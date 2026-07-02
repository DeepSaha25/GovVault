'use client';

import { useGovernor } from '@/hooks/useGovernor';
import { useWallet } from '@/hooks/useWallet';
import { Badge } from '@/components/ui/Badge';
import { FiArchive, FiLoader, FiCalendar, FiTarget } from 'react-icons/fi';
import Link from 'next/link';

export default function HistoryPage() {
  const { publicKey } = useWallet();
  const { proposals, loading } = useGovernor(publicKey || undefined);

  const historyProposals = proposals.filter(p => p.status === 'executed' || p.status === 'failed');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-[#fcf8fa] dark:bg-surface-900 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-surface-700 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Archive</p>
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white font-sans">Proposal History</h1>
        <p className="text-slate-600 dark:text-slate-300">Past governance decisions, including executed treasury transfers and failed proposals.</p>
      </div>

      {!publicKey ? (
        <div className="text-center py-16 rounded border border-dashed border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 flex flex-col items-center justify-center">
          <FiArchive className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-black dark:text-white">Wallet Connection Required</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Please connect your Freighter wallet to view historical governance proposals and past treasury payouts.
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center p-12">
          <FiLoader className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : historyProposals.length === 0 ? (
        <div className="rounded border border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
          <FiArchive className="h-10 w-10 text-slate-300 mb-3" />
          <p>No historical proposals found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyProposals.map((proposal) => (
            <div key={proposal.id} className="bg-white dark:bg-surface-800 rounded-lg border border-slate-200 dark:border-surface-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{proposal.id}</span>
                    <Badge status={proposal.status} />
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white">{proposal.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{proposal.description}</p>
                </div>
                <Link 
                  href={`/proposals/${proposal.id}/history`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
                >
                  View Log
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <FiTarget className="h-4 w-4" />
                  <span className="font-mono truncate max-w-[150px]" title={proposal.target}>
                    {proposal.target.substring(0,6)}...{proposal.target.substring(proposal.target.length-4)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-black dark:text-white">{proposal.amount} XLM</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <FiCalendar className="h-4 w-4" />
                  <span>Archived</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
