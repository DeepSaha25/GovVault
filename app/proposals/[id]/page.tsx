'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGovernor } from '@/hooks/useGovernor';
import { useWallet } from '@/hooks/useWallet';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProposalCountdown } from '@/components/ui/ProposalCountdown';
import { QVComparisonCard } from '@/components/ui/QVComparisonCard';
import { stellar } from '@/lib/stellar';
import { FiCheck, FiX, FiPlay, FiLock, FiUnlock, FiInfo, FiActivity, FiArrowLeft, FiSliders } from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalIdStr = typeof params?.id === 'string' ? params.id : '';
  const proposalId = parseInt(proposalIdStr, 10);

  const { publicKey, isConnected } = useWallet();
  const { proposals, loading, castVote, executeProposal, evaluateResult } = useGovernor(publicKey || undefined);

  const proposal = proposals.find((p) => p.id === proposalId);

  // Voting input state
  const [votes, setVotes] = useState(1);
  const [voteLoading, setVoteLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [execLoading, setExecLoading] = useState(false);

  const handleVote = async (approve: boolean) => {
    if (proposalId === 9999) {
      toast.success(`[Demo] Successfully cast ${votes} votes!`);
      return;
    }
    try {
      setVoteLoading(true);
      await castVote(proposalId, votes, approve);
      toast.success(`Successfully cast ${votes} votes!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Voting failed';
      toast.error(msg);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (proposalId === 9999) {
      toast.success('[Demo] Proposal evaluation triggered!');
      return;
    }
    try {
      setEvalLoading(true);
      await evaluateResult(proposalId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Evaluation failed';
      toast.error(msg);
    } finally {
      setEvalLoading(false);
    }
  };

  const handleExecute = async () => {
    try {
      setExecLoading(true);
      await executeProposal(proposalId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Execution failed';
      toast.error(msg);
    } finally {
      setExecLoading(false);
    }
  };

  const totalVotes = proposal ? proposal.yesVotes + proposal.noVotes : 0;
  const yesPercentage = totalVotes > 0 ? (proposal!.yesVotes / totalVotes) * 100 : 50;
  const noPercentage = totalVotes > 0 ? (proposal!.noVotes / totalVotes) * 100 : 50;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-[#fcf8fa] dark:bg-surface-900 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-surface-700 pb-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-black dark:text-white flex items-center gap-1">
            <FiArrowLeft /> Back to Dashboard
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white font-sans">
            Proposal Details
          </h1>
          {proposal && (
            <div className="flex items-center gap-3">
              <Badge status={proposal.status} />
              {proposal.status === 'active' && proposal.endTime > 0 && (
                <ProposalCountdown targetTime={proposal.endTime} prefix="Ends In:" />
              )}
              {proposal.status === 'passed' && proposal.executionTime > 0 && (
                <ProposalCountdown targetTime={proposal.executionTime} prefix="Timelock:" />
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <FiActivity className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : !proposal ? (
        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 p-6 rounded text-center">
          Proposal not found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details Panel (Left/Center 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-surface-800 p-6 rounded-lg border border-slate-200 dark:border-surface-700 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-surface-700 border border-slate-200 dark:border-surface-700 px-2.5 py-1 text-slate-600 dark:text-slate-300 rounded">
                  #GV-{proposal.id}
                </span>
                <h2 className="text-xl font-bold mt-3 text-black dark:text-white">{proposal.title}</h2>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {proposal.description}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-surface-700 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Vote distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-600 dark:text-emerald-400">{proposal.yesVotes} YES ({totalVotes > 0 ? yesPercentage.toFixed(0) : 0}%)</span>
                    <span className="text-rose-600 dark:text-rose-400">{proposal.noVotes} NO ({totalVotes > 0 ? noPercentage.toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-surface-700 rounded-full h-3 overflow-hidden flex border border-slate-200/50 dark:border-surface-700/50">
                    {totalVotes === 0 ? (
                      <div className="w-full bg-slate-200 dark:bg-surface-700 h-full rounded-full" />
                    ) : (
                      <>
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${yesPercentage}%` }} />
                        <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${noPercentage}%` }} />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-surface-700 pt-6">
                <QVComparisonCard 
                  yesVotes={proposal.yesVotes}
                  noVotes={proposal.noVotes}
                  status={proposal.status}
                />
              </div>
            </div>

            {/* Event Log Link Card */}
            <div className="bg-white dark:bg-surface-800 p-6 rounded-lg border border-slate-200 dark:border-surface-700 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-black dark:text-white">Audit & Timeline</h3>
                <p className="text-xs text-slate-400">View real-time event logs and consensus validation logs for this proposal.</p>
              </div>
              <Link 
                href={`/proposals/${proposalId}/history`}
                className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider"
              >
                <FiSliders className="h-3.5 w-3.5" /> View Audit Trail
              </Link>
            </div>
          </div>

          {/* Voting Control Panel (Right Column) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-800 p-6 rounded-lg border border-slate-200 dark:border-surface-700 shadow-sm space-y-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-surface-700 pb-3">
                Parameters
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Proposer:</span>
                  <span className="font-mono text-black dark:text-white font-bold">{stellar.formatAddress(proposal.proposer, 6, 6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient Account:</span>
                  <span className="font-mono text-black dark:text-white font-bold">{stellar.formatAddress(proposal.target, 6, 6)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-surface-700 pt-3">
                  <span className="text-slate-400">Requested Amount:</span>
                  <span className="text-black dark:text-white font-bold text-sm">{proposal.amount} XLM</span>
                </div>
              </div>
            </div>

            {/* Voting console */}
            <div className="bg-white dark:bg-surface-800 p-6 rounded-lg border border-slate-200 dark:border-surface-700 shadow-sm space-y-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-surface-700 pb-3">
                Governance Console
              </h3>

              {!isConnected ? (
                <div className="text-center py-4 text-slate-400 text-xs">
                  Connect your wallet to participate in this proposal.
                </div>
              ) : (
                <div className="space-y-4">
                  {proposal.status === 'active' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Cast Your Vote (Quadratic Cost)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={votes}
                            onChange={(e) => setVotes(parseInt(e.target.value) || 1)}
                            className="flex-1 h-1.5 bg-slate-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                            disabled={voteLoading}
                          />
                          <input
                            type="number"
                            min="1"
                            value={votes}
                            onChange={(e) => setVotes(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 h-8 rounded border border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-xs text-black dark:text-white font-mono text-center focus:border-black focus:outline-none"
                            disabled={voteLoading}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] pt-1">
                          <span className="text-slate-400 font-semibold">Votes: {votes}</span>
                          <span className="text-black dark:text-white font-bold bg-slate-100 dark:bg-surface-700 px-2 py-0.5 rounded font-mono">
                            Cost: {votes * votes} Tokens
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleVote(true)}
                          isLoading={voteLoading}
                          className="h-9 text-xs bg-white dark:bg-surface-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-surface-700 text-slate-700 dark:text-slate-200"
                        >
                          <FiCheck className="mr-1 h-3.5 w-3.5 text-emerald-600" /> YES
                        </Button>
                        <Button
                          onClick={() => handleVote(false)}
                          isLoading={voteLoading}
                          className="h-9 text-xs bg-white dark:bg-surface-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-surface-700 text-slate-700 dark:text-slate-200"
                        >
                          <FiX className="mr-1 h-3.5 w-3.5 text-rose-600" /> NO
                        </Button>
                      </div>

                      <Button
                        onClick={handleEvaluate}
                        isLoading={evalLoading}
                        variant="secondary"
                        className="w-full h-8 text-[10px] uppercase tracking-wider"
                      >
                        End Voting Period
                      </Button>
                    </div>
                  )}

                  {proposal.status === 'passed' && (
                    <div className="space-y-3">
                      <div className="rounded border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/30 p-3 text-[10px] font-semibold uppercase tracking-wider text-amber-850 dark:text-amber-300 flex items-center gap-1.5">
                        <FiLock className="h-4 w-4 flex-shrink-0" />
                        <span>Timelock Lockup Active</span>
                      </div>
                      <Button
                        onClick={handleExecute}
                        isLoading={execLoading}
                        className="w-full h-9 flex items-center justify-center gap-1.5 uppercase text-xs tracking-wider"
                      >
                        <FiPlay className="h-3.5 w-3.5" /> Execute Release
                      </Button>
                    </div>
                  )}

                  {proposal.status === 'executed' && (
                    <div className="rounded border border-emerald-250 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-xs text-emerald-800 dark:text-emerald-350 text-center font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <FiUnlock className="h-4 w-4" /> Payout Released
                    </div>
                  )}

                  {proposal.status === 'failed' && (
                    <div className="rounded border border-rose-250 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/20 p-3 text-xs text-rose-800 dark:text-rose-350 text-center font-bold uppercase tracking-wider">
                      Proposal Rejected
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
