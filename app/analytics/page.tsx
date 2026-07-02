'use client';

import { useGovernor } from '@/hooks/useGovernor';
import { useWallet } from '@/hooks/useWallet';
import { useContractEvents } from '@/hooks/useContractEvents';
import { GOVERNOR_CONTRACT_ID } from '@/lib/constants';
import { FiActivity, FiPieChart, FiTrendingUp, FiUsers } from 'react-icons/fi';

export default function AnalyticsPage() {
  const { publicKey } = useWallet();
  const { proposals, loading } = useGovernor(publicKey || undefined);
  const { events, loading: eventsLoading } = useContractEvents(GOVERNOR_CONTRACT_ID);

  const totalProposals = proposals.length;
  const executedProposals = proposals.filter((p) => p.status === 'executed').length;
  const passedProposals = proposals.filter((p) => p.status === 'passed').length;
  const failedProposals = proposals.filter((p) => p.status === 'failed').length;
  const activeProposals = proposals.filter((p) => p.status === 'active').length;

  const successRate = totalProposals > 0 ? ((executedProposals + passedProposals) / totalProposals) * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-[#fcf8fa] dark:bg-surface-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-surface-700 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">DAO Metrics</p>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white font-sans">Analytics Dashboard</h1>
        </div>
      </div>

      {!publicKey ? (
        <div className="text-center py-16 rounded border border-dashed border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800">
          <FiPieChart className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-black dark:text-white">Wallet Connection Required</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Please connect your Freighter wallet to query and view real-time governance metrics and analytics.
          </p>
        </div>
      ) : (loading || eventsLoading) ? (
        <div className="flex items-center justify-center p-12">
          <FiActivity className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-surface-800 p-6 rounded shadow-sm border border-slate-200 dark:border-surface-700">
              <div className="flex items-center gap-3 mb-2">
                <FiPieChart className="text-blue-500 h-5 w-5" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Proposals</h3>
              </div>
              <p className="text-3xl font-bold">{totalProposals}</p>
            </div>
            
            <div className="bg-white dark:bg-surface-800 p-6 rounded shadow-sm border border-slate-200 dark:border-surface-700">
              <div className="flex items-center gap-3 mb-2">
                <FiTrendingUp className="text-emerald-500 h-5 w-5" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Success Rate</h3>
              </div>
              <p className="text-3xl font-bold">{successRate.toFixed(1)}%</p>
            </div>

            <div className="bg-white dark:bg-surface-800 p-6 rounded shadow-sm border border-slate-200 dark:border-surface-700">
              <div className="flex items-center gap-3 mb-2">
                <FiActivity className="text-amber-500 h-5 w-5" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Now</h3>
              </div>
              <p className="text-3xl font-bold">{activeProposals}</p>
            </div>

            <div className="bg-white dark:bg-surface-800 p-6 rounded shadow-sm border border-slate-200 dark:border-surface-700">
              <div className="flex items-center gap-3 mb-2">
                <FiUsers className="text-purple-500 h-5 w-5" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Events Logged</h3>
              </div>
              <p className="text-3xl font-bold">{events.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-800 rounded shadow-sm border border-slate-200 dark:border-surface-700 p-6">
            <h2 className="text-lg font-bold mb-4">Proposal Status Breakdown</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active</span>
                  <span className="font-medium">{activeProposals}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-surface-700 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${totalProposals > 0 ? (activeProposals / totalProposals) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Executed / Passed</span>
                  <span className="font-medium">{executedProposals + passedProposals}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-surface-700 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${successRate}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Failed</span>
                  <span className="font-medium">{failedProposals}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-surface-700 rounded-full h-2">
                  <div className="bg-rose-600 h-2 rounded-full" style={{ width: `${totalProposals > 0 ? (failedProposals / totalProposals) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
