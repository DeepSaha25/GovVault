'use client';

import { useCallback, useEffect, useState } from 'react';
import { stellar } from '@/lib/stellar';
import { GOVERNOR_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import type { Proposal } from '@/lib/types';
import toast from 'react-hot-toast';

export function useGovernor(publicKey: string | undefined) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProposals = useCallback(async () => {
    if (!GOVERNOR_CONTRACT_ID || !publicKey) return;
    try {
      setLoading(true);
      const countVal = await stellar.simulateRead({
        publicKey,
        contractId: GOVERNOR_CONTRACT_ID,
        method: 'get_proposal_count',
      });
      
      const count = countVal ? Number(StellarSdk.scValToNative(countVal)) : 0;
      const loaded: Proposal[] = [];

      for (let i = count; i >= 1; i--) {
        const propVal = await stellar.simulateRead({
          publicKey,
          contractId: GOVERNOR_CONTRACT_ID,
          method: 'get_proposal',
          args: [StellarSdk.nativeToScVal(i, { type: 'u32' })],
        });

        if (propVal) {
          const raw = StellarSdk.scValToNative(propVal);
          loaded.push({
            id: Number(raw.id),
            proposer: String(raw.proposer),
            title: String(raw.title),
            description: String(raw.description),
            target: String(raw.target),
            amount: stellar.stroopsToXlm(raw.amount),
            yesVotes: Number(raw.yes_votes),
            noVotes: Number(raw.no_votes),
            status: ['active', 'passed', 'failed', 'executed'][Number(raw.status)] as any,
            executionTime: Number(raw.execution_time),
            createdAt: Number(raw.end_time) - 300,
          });
        }
      }
      setProposals(loaded);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  const createProposal = async (title: string, description: string, target: string, amount: string) => {
    if (!publicKey || !GOVERNOR_CONTRACT_ID) {
      throw new Error('Wallet not connected or contract not configured.');
    }

    const stroopAmount = stellar.xlmToStroops(amount);
    
    const args = [
      StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
      StellarSdk.nativeToScVal(title, { type: 'string' }),
      StellarSdk.nativeToScVal(description, { type: 'string' }),
      StellarSdk.nativeToScVal(target, { type: 'address' }),
      StellarSdk.nativeToScVal(BigInt(stroopAmount), { type: 'i128' }),
    ];

    const { hash } = await stellar.buildAndSignTx({
      publicKey,
      contractId: GOVERNOR_CONTRACT_ID,
      method: 'create_proposal',
      args,
    });

    toast.success('Proposal transaction submitted!');
    await fetchProposals();
    return hash;
  };

  const castVote = async (proposalId: number, votes: number, approve: boolean) => {
    if (!publicKey || !GOVERNOR_CONTRACT_ID) {
      throw new Error('Wallet not connected.');
    }

    const args = [
      StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
      StellarSdk.nativeToScVal(proposalId, { type: 'u32' }),
      StellarSdk.nativeToScVal(BigInt(votes), { type: 'i128' }),
      StellarSdk.nativeToScVal(approve, { type: 'bool' }),
    ];

    const { hash } = await stellar.buildAndSignTx({
      publicKey,
      contractId: GOVERNOR_CONTRACT_ID,
      method: 'vote',
      args,
    });

    toast.success('Vote cast successfully!');
    await fetchProposals();
    return hash;
  };

  const executeProposal = async (proposalId: number) => {
    if (!publicKey || !GOVERNOR_CONTRACT_ID) {
      throw new Error('Wallet not connected.');
    }

    const { hash } = await stellar.buildAndSignTx({
      publicKey,
      contractId: GOVERNOR_CONTRACT_ID,
      method: 'execute_proposal',
      args: [StellarSdk.nativeToScVal(proposalId, { type: 'u32' })],
    });

    toast.success('Proposal executed, treasury grant released!');
    await fetchProposals();
    return hash;
  };

  const evaluateResult = async (proposalId: number) => {
    if (!publicKey || !GOVERNOR_CONTRACT_ID) {
      throw new Error('Wallet not connected.');
    }

    const { hash } = await stellar.buildAndSignTx({
      publicKey,
      contractId: GOVERNOR_CONTRACT_ID,
      method: 'check_proposal_result',
      args: [StellarSdk.nativeToScVal(proposalId, { type: 'u32' })],
    });

    toast.success('Proposal voting ended and evaluated!');
    await fetchProposals();
    return hash;
  };

  useEffect(() => {
    if (publicKey) fetchProposals();
  }, [publicKey, fetchProposals]);

  return {
    proposals,
    loading,
    refetch: fetchProposals,
    createProposal,
    castVote,
    executeProposal,
    evaluateResult,
  };
}
