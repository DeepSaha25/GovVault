'use client';

import { useParams } from 'next/navigation';
import { useGovernor } from '@/hooks/useGovernor';
import { useWallet } from '@/hooks/useWallet';
import { useContractEvents } from '@/hooks/useContractEvents';
import { GOVERNOR_CONTRACT_ID } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';
import { FiClock, FiCheck, FiX, FiInfo, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

export default function ProposalHistoryPage() {
  const params = useParams();
  const proposalIdStr = typeof params?.id === 'string' ? params.id : '';
  const proposalId = parseInt(proposalIdStr, 10);
  
  const { publicKey } = useWallet();
  const { proposals, loading: governorLoading } = useGovernor(publicKey || undefined);
  const { events, loading: eventsLoading } = useContractEvents(GOVERNOR_CONTRACT_ID);

  const proposal = proposals.find((p) => p.id === proposalId);

  // Filter events related to this proposal (assuming topics[2] or data might contain it, 
  // for this mockup we will assume any 'vote' event on this ID)
  // Contract events structure might vary. Here we'll map all events generically but highlight vote types.
  
  const voteEvents = events.filter(e => {
    // Basic heuristic: check if the data or topics array contains the proposal ID as a string or number.
    // In a real scenario, Soroban events encode these specifically.
    const jsonStr = JSON.stringify(e).toLowerCase();
    return jsonStr.includes(`vote`) && jsonStr.includes(proposalIdStr.toLowerCase());
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-[#fcf8fa] dark:bg-surface-900 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-surface-700 pb-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-black dark:text-white">
            &larr; Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white font-sans">
          Proposal #{proposalId} Audit Trail
        </h1>
        {proposal && (
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl">{proposal.title}</p>
        )}
      </div>

      {(governorLoading || eventsLoading) ? (
        <div className="flex justify-center p-12">
          <FiClock className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : !proposal ? (
        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 p-6 rounded text-center">
          Proposal not found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-surface-800 p-6 rounded-lg border border-slate-200 dark:border-surface-700 shadow-sm">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Current Status</h3>
              <div className="mb-4">
                <Badge status={proposal.status} />
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Votes For:</span>
                  <p className="font-bold text-emerald-600 flex items-center gap-1"><FiCheck /> {proposal.yesVotes}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Votes Against:</span>
                  <p className="font-bold text-rose-600 flex items-center gap-1"><FiX /> {proposal.noVotes}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h3 className="font-bold text-lg border-b border-slate-200 dark:border-surface-700 pb-2">Event Timeline</h3>
            
            {voteEvents.length === 0 ? (
              <div className="bg-slate-50 dark:bg-surface-800 p-6 text-center text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-surface-700 text-sm">
                No specific vote events found in the recent ledger cache for this proposal.
              </div>
            ) : (
              <div className="space-y-4">
                {voteEvents.map((evt, idx) => (
                  <div key={idx} className="bg-white dark:bg-surface-800 p-4 rounded border border-slate-200 dark:border-surface-700 shadow-sm flex items-start gap-4">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full flex-shrink-0 mt-1">
                      <FiInfo />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-sm">Vote Cast Event</p>
                      <pre className="text-[10px] mt-2 bg-slate-50 dark:bg-surface-800 p-2 rounded overflow-x-auto text-slate-600 dark:text-slate-300 border border-slate-100">
                        {JSON.stringify(evt, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
