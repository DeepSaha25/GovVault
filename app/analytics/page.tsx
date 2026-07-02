'use client';

import { useGovernor } from '@/hooks/useGovernor';
import { useWallet } from '@/hooks/useWallet';
import { useContractEvents } from '@/hooks/useContractEvents';
import { GOVERNOR_CONTRACT_ID } from '@/lib/constants';
import { FiActivity, FiPieChart, FiTrendingUp, FiUsers, FiExternalLink } from 'react-icons/fi';
import { stellar } from '@/lib/stellar';

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown Card */}
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

            {/* Quadratic Cost Curve Card */}
            <div className="bg-white dark:bg-surface-800 rounded shadow-sm border border-slate-200 dark:border-surface-700 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold">Quadratic Cost Scaling</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  How token cost grows exponentially ($cost = votes^2$) to protect community voting consensus.
                </p>
              </div>
              
              <div className="py-2 flex items-center justify-center">
                <svg className="w-full h-28 max-w-sm text-slate-300 dark:text-surface-700" viewBox="0 0 100 30" fill="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="0" y1="0" x2="0" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                  
                  {/* Curve Path (y = 30 - 30 * (x/100)^2) */}
                  <path d="M 0 30 Q 50 28 100 0" stroke="#f59e0b" strokeWidth="1.5" />
                  
                  {/* Key Annotations */}
                  <circle cx="0" cy="30" r="1.5" fill="#f59e0b" />
                  <circle cx="30" cy="27" r="1.5" fill="#f59e0b" />
                  <circle cx="60" cy="19" r="1.5" fill="#f59e0b" />
                  <circle cx="100" cy="0" r="1.5" fill="#f59e0b" />
                  
                  <text x="35" y="25" fill="currentColor" className="text-[3px] font-sans font-semibold">3 Votes = 9 Tokens</text>
                  <text x="65" y="15" fill="currentColor" className="text-[3px] font-sans font-semibold">6 Votes = 36 Tokens</text>
                  <text x="75" y="3" fill="#f59e0b" className="text-[3px] font-sans font-bold">10 Votes = 100 Tokens</text>
                </svg>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-100 dark:border-surface-750">
                <span>1 Vote = 1 Token</span>
                <span>Whale Prevention: 10x More Costly</span>
              </div>
            </div>
          </div>

          {/* Recent Event Log Table */}
          <div className="bg-white dark:bg-surface-800 rounded shadow-sm border border-slate-200 dark:border-surface-700 p-6 space-y-4">
            <h2 className="text-lg font-bold">Recent Contract Events</h2>
            {events.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No events found in the recent ledger entries.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-surface-700 text-xs text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Event Topic</th>
                      <th className="py-3 px-4">Ledger</th>
                      <th className="py-3 px-4">Payload</th>
                      <th className="py-3 px-4">Transaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-surface-700/50 font-mono">
                    {events.slice(0, 10).map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-surface-750/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-black dark:text-white">
                          {evt.topic.join(' / ')}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{evt.ledger}</td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-500" title={JSON.stringify(evt.value)}>
                          {JSON.stringify(evt.value, (k, v) => typeof v === 'bigint' ? v.toString() : v)}
                        </td>
                        <td className="py-3 px-4">
                          <a
                            href={stellar.getExplorerLink(evt.txHash, 'tx')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline inline-flex items-center gap-1"
                          >
                            {stellar.formatAddress(evt.txHash, 6, 6)}
                            <FiExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
