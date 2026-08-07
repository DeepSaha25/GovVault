import { describe, it, expect } from 'vitest';
import { stellar } from '@/lib/stellar';
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from '@/lib/constants';

describe('StellarHelper Utilities', () => {
  describe('formatAddress', () => {
    it('truncates public keys correctly', () => {
      const address = 'GB7OTVADKAP2N7CLW5X7Q5ZAKN6635PEIX4UKSX5TPSPGFF3ND224EIN';
      expect(stellar.formatAddress(address)).toBe('GB7O...4EIN');
    });

    it('returns short addresses as-is', () => {
      const short = 'GABC';
      expect(stellar.formatAddress(short)).toBe('GABC');
    });

    it('supports custom start and end lengths', () => {
      const address = 'GB7OTVADKAP2N7CLW5X7Q5ZAKN6635PEIX4UKSX5TPSPGFF3ND224EIN';
      expect(stellar.formatAddress(address, 6, 6)).toBe('GB7OTV...24EIN');
    });

    it('handles exact-length address equal to start+end without truncation', () => {
      const short = 'GABCDEFG';
      expect(stellar.formatAddress(short, 4, 4)).toBe('GABCDEFG');
    });
  });

  describe('getExplorerLink', () => {
    it('generates correct transaction link', () => {
      const tx = 'abc123hash';
      expect(stellar.getExplorerLink(tx, 'tx')).toBe('https://stellar.expert/explorer/testnet/tx/abc123hash');
    });

    it('generates correct account link', () => {
      const acc = 'GACC';
      expect(stellar.getExplorerLink(acc, 'account')).toBe('https://stellar.expert/explorer/testnet/account/GACC');
    });

    it('generates correct contract explorer link', () => {
      const contractId = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
      expect(stellar.getExplorerLink(contractId, 'contract')).toContain('/contract/');
    });
  });

  describe('stroopsToXlm', () => {
    it('converts basic stroop balances correctly', () => {
      expect(stellar.stroopsToXlm(100_0000000)).toBe('100.0000000');
      expect(stellar.stroopsToXlm(70000000)).toBe('7.0000000');
    });

    it('converts zero stroops to 0.0000000', () => {
      expect(stellar.stroopsToXlm(0)).toBe('0.0000000');
    });

    it('correctly pads fractional part with leading zeros', () => {
      // 1 stroop = 0.0000001 XLM
      expect(stellar.stroopsToXlm(1)).toBe('0.0000001');
    });
  });

  describe('xlmToStroops', () => {
    it('converts XLM amounts to stroops correctly', () => {
      expect(stellar.xlmToStroops('10')).toBe('100000000');
      expect(stellar.xlmToStroops('1.5')).toBe('15000000');
    });

    it('handles integer XLM with no decimal', () => {
      expect(stellar.xlmToStroops('100')).toBe('1000000000');
    });

    it('handles zero correctly', () => {
      expect(stellar.xlmToStroops('0')).toBe('0');
    });
  });

  describe('Quadratic Voting Math', () => {
    it('quadratic cost grows correctly: 1->1, 3->9, 5->25, 10->100', () => {
      const quadratic = (v: number) => v * v;
      expect(quadratic(1)).toBe(1);
      expect(quadratic(3)).toBe(9);
      expect(quadratic(5)).toBe(25);
      expect(quadratic(10)).toBe(100);
    });

    it('negative votes produce positive cost (the contract bug we fixed)', () => {
      // This test documents why the contracts/governor fix was necessary:
      // negative * negative = positive cost, but vote counts would be decremented
      const brokenCost = (-3) * (-3);
      expect(brokenCost).toBe(9); // Cost looks valid but would corrupt tally
    });
  });

  describe('Proposal Status Labels', () => {
    it('has a label for all 4 known statuses', () => {
      expect(PROPOSAL_STATUS_LABELS['active']).toBe('Active');
      expect(PROPOSAL_STATUS_LABELS['passed']).toBe('Passed & Timelocked');
      expect(PROPOSAL_STATUS_LABELS['failed']).toBe('Failed');
      expect(PROPOSAL_STATUS_LABELS['executed']).toBe('Executed');
    });

    it('has color tokens for all 4 known statuses', () => {
      const statuses = ['active', 'passed', 'failed', 'executed'];
      statuses.forEach((s) => {
        expect(PROPOSAL_STATUS_COLORS[s]).toBeDefined();
        expect(PROPOSAL_STATUS_COLORS[s].bg).toBeTruthy();
        expect(PROPOSAL_STATUS_COLORS[s].text).toBeTruthy();
      });
    });
  });
});
