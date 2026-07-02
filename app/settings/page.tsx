'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GOVERNOR_CONTRACT_ID, TREASURY_CONTRACT_ID } from '@/lib/constants';
import { FiSettings, FiSave, FiLock, FiClock, FiShield } from 'react-icons/fi';
import { useWallet } from '@/hooks/useWallet';
import { useGovernor } from '@/hooks/useGovernor';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { publicKey, isConnected } = useWallet();
  const { createProposal } = useGovernor(publicKey || undefined);
  const [loading, setLoading] = useState(false);
  const [votingPeriod, setVotingPeriod] = useState('7200'); // blocks
  const [timelockDelay, setTimelockDelay] = useState('17280'); // blocks

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !publicKey) {
      toast.error('Please connect your wallet first.');
      return;
    }

    setLoading(true);
    try {
      const title = `[Config] Update DAO Parameters`;
      const description = `Proposing to update the core parameters of the DAO:\n- Voting Period: ${votingPeriod} ledgers\n- Timelock Delay: ${timelockDelay} ledgers`;
      
      // Target: Governor Contract, Amount: 0 XLM
      await createProposal(title, description, GOVERNOR_CONTRACT_ID, '0');
      toast.success('Configuration update proposal submitted successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit proposal';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-[#fcf8fa] dark:bg-surface-900 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-surface-700 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Configuration</p>
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white font-sans">DAO Settings</h1>
        <p className="text-slate-600 dark:text-slate-300">View and propose changes to the core parameters of the GovVault contracts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white dark:bg-surface-800 p-6 rounded-lg border border-slate-200 dark:border-surface-700 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-100 pb-4">
              <FiSettings className="text-slate-500 dark:text-slate-400" /> Contract Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Voting Period (Ledgers)</label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="number" 
                    value={votingPeriod}
                    onChange={(e) => setVotingPeriod(e.target.value)}
                    disabled={!isConnected}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-surface-600 rounded focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-60"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Approx. {Math.round(Number(votingPeriod) * 5 / 60 / 60)} hours (assuming 5s per ledger)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Timelock Delay (Ledgers)</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="number" 
                    value={timelockDelay}
                    onChange={(e) => setTimelockDelay(e.target.value)}
                    disabled={!isConnected}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-surface-600 rounded focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-60"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Approx. {Math.round(Number(timelockDelay) * 5 / 60 / 60)} hours mandatory wait before execution.</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 p-4 rounded text-sm">
              Note: Changing these parameters requires a formal DAO vote. Clicking save will create a new proposal.
            </div>

            <Button 
              type="submit" 
              disabled={loading || !isConnected} 
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Proposing...' : !isConnected ? 'Connect Wallet to Propose' : <><FiSave /> Propose Parameter Update</>}
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-surface-800 p-6 rounded-lg border border-slate-200 dark:border-surface-700">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiShield className="text-slate-500 dark:text-slate-400" /> Contract Addresses
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Governor Contract</p>
                <p className="font-mono text-xs bg-white dark:bg-surface-800 p-2 border border-slate-200 dark:border-surface-700 rounded break-all">
                  {GOVERNOR_CONTRACT_ID || 'Not configured'}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Treasury Contract</p>
                <p className="font-mono text-xs bg-white dark:bg-surface-800 p-2 border border-slate-200 dark:border-surface-700 rounded break-all">
                  {TREASURY_CONTRACT_ID || 'Not configured'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
