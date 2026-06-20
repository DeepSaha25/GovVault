'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useGovernor } from '@/hooks/useGovernor';
import { useContractEvents } from '@/hooks/useContractEvents';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { stellar } from '@/lib/stellar';
import { GOVERNOR_CONTRACT_ID } from '@/lib/constants';
import {
  FiPlus,
  FiCheck,
  FiX,
  FiPlay,
  FiActivity,
  FiLoader,
  FiExternalLink,
  FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { publicKey, isConnected } = useWallet();
  const { proposals, loading, createProposal, castVote, executeProposal, evaluateResult } = useGovernor(
    publicKey || undefined
  );
  const { events, loading: eventsLoading } = useContractEvents(GOVERNOR_CONTRACT_ID);

  // Proposal Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Voting Calculator State per Proposal
  const [voteInputs, setVoteInputs] = useState<Record<number, { votes: number; approve: boolean }>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !publicKey) {
      toast.error('Please connect your wallet first.');
      return;
    }

    try {
      setSubmitting(true);
      await createProposal(title, description, target, amount);
      toast.success('Proposal created successfully!');
      setShowForm(false);
      setTitle('');
      setDescription('');
      setTarget('');
      setAmount('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create proposal';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (proposalId: number, approve: boolean) => {
    const input = voteInputs[proposalId];
    const votes = input?.votes || 1;
    const actionKey = `vote-${proposalId}`;

    try {
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
      await castVote(proposalId, votes, approve);
      toast.success(`Successfully cast ${votes} votes!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Voting failed';
      toast.error(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleEvaluate = async (proposalId: number) => {
    const actionKey = `eval-${proposalId}`;
    try {
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
      await evaluateResult(proposalId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Evaluation failed';
      toast.error(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleExecute = async (proposalId: number) => {
    const actionKey = `exec-${proposalId}`;
    try {
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
      await executeProposal(proposalId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Execution failed';
      toast.error(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const updateVoteInput = (proposalId: number, votes: number) => {
    setVoteInputs((prev) => ({
      ...prev,
      [proposalId]: { ...prev[proposalId], votes: Math.max(1, votes) },
    }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-850 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">DAO Governance Portal</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Create proposals, calculate quadratic vote weights, and execute timelocked treasury distributions.
          </p>
        </div>

        {isConnected && (
          <Button onClick={() => setShowForm(!showForm)} className="h-10 px-4 flex items-center gap-1.5 self-start">
            <FiPlus className="h-4 w-4" />
            New Proposal
          </Button>
        )}
      </div>

      {!GOVERNOR_CONTRACT_ID && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-zinc-450 text-xs flex items-center gap-2.5">
          <FiInfo className="text-zinc-500 h-4 w-4 flex-shrink-0" />
          <span>Governor contract ID is not configured. Please deploy the smart contracts first to fetch real-time state.</span>
        </div>
      )}

      {/* New Proposal Modal Form */}
      {showForm && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 animate-slide-up">
          <h2 className="text-lg font-bold text-white mb-6">Create New Grant Proposal</h2>
          <form onSubmit={handleCreateProposal} className="space-y-4 max-w-2xl">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-zinc-400 mb-1.5">Proposal Title</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Funding Core Infrastructure"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="field-input"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-zinc-400 mb-1.5">Description</label>
              <textarea
                id="description"
                rows={3}
                placeholder="Describe the milestone and scope of work..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="field-input"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="target" className="block text-xs font-semibold text-zinc-400 mb-1.5">Recipient Target Account</label>
                <input
                  id="target"
                  type="text"
                  placeholder="G..."
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="field-input font-mono"
                  required
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-xs font-semibold text-zinc-400 mb-1.5">Amount (XLM)</label>
                <input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="field-input"
                  required
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting}>
                Submit Proposal
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content Layout */}
      {!isConnected ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20">
          <FiActivity className="mx-auto h-12 w-12 text-zinc-650 mb-3" />
          <h3 className="text-sm font-semibold text-white">Wallet Connection Required</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            Please connect your Freighter wallet using the selector in the header to view governance proposals and cast votes.
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20 text-zinc-450 gap-2">
          <FiLoader className="animate-spin h-5 w-5" />
          <span>Synchronizing state from Soroban RPC...</span>
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-16 text-zinc-450 border border-zinc-850 rounded-xl bg-zinc-950/20">
          No proposals found. Create the first one using the &quot;New Proposal&quot; button!
        </div>
      ) : (
        <div className="grid gap-6">
          {proposals.map((prop) => {
            const votesToCast = voteInputs[prop.id]?.votes || 1;
            const quadraticCost = votesToCast * votesToCast;
            const evalLoading = actionLoading[`eval-${prop.id}`];
            const execLoading = actionLoading[`exec-${prop.id}`];
            const voteLoading = actionLoading[`vote-${prop.id}`];

            return (
              <div key={prop.id} className="card border border-zinc-850 bg-zinc-950/40 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all hover:border-zinc-800">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-500">#{prop.id}</span>
                    <h3 className="text-lg font-bold text-white">{prop.title}</h3>
                    <Badge status={prop.status} />
                  </div>

                  <p className="text-sm text-zinc-400 leading-relaxed">{prop.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs font-mono text-zinc-400">
                    <div>
                      <span className="block text-zinc-550 text-[10px] font-sans">Proposer</span>
                      <span>{stellar.formatAddress(prop.proposer, 5, 5)}</span>
                    </div>
                    <div>
                      <span className="block text-zinc-550 text-[10px] font-sans">Grant Value</span>
                      <span className="text-white">{prop.amount} XLM</span>
                    </div>
                    <div>
                      <span className="block text-zinc-550 text-[10px] font-sans">Yes Votes</span>
                      <span className="text-emerald-400">{prop.yesVotes}</span>
                    </div>
                    <div>
                      <span className="block text-zinc-550 text-[10px] font-sans">No Votes</span>
                      <span className="text-red-400">{prop.noVotes}</span>
                    </div>
                  </div>
                </div>

                {/* Vote Panel / Action Panel */}
                <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-zinc-850 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between gap-4">
                  {prop.status === 'active' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold mb-1">
                          Votes to Cast
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={votesToCast}
                            onChange={(e) => updateVoteInput(prop.id, parseInt(e.target.value) || 1)}
                            className="w-20 h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm text-white font-mono text-center focus:outline-none focus:border-zinc-700"
                            disabled={voteLoading}
                          />
                          <span className="text-[10px] text-zinc-450 font-mono">
                            Cost: {quadraticCost} XLM
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleVote(prop.id, true)}
                          isLoading={voteLoading}
                          className="h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                        >
                          <FiCheck className="mr-1 h-3.5 w-3.5" /> Yes
                        </Button>
                        <Button
                          onClick={() => handleVote(prop.id, false)}
                          isLoading={voteLoading}
                          className="h-9 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                        >
                          <FiX className="mr-1 h-3.5 w-3.5" /> No
                        </Button>
                      </div>

                      <Button
                        onClick={() => handleEvaluate(prop.id)}
                        isLoading={evalLoading}
                        variant="secondary"
                        className="w-full h-8 text-[11px]"
                      >
                        End Voting Period
                      </Button>
                    </div>
                  )}

                  {prop.status === 'passed' && (
                    <div className="space-y-2">
                      <div className="rounded-lg bg-zinc-900/40 p-2.5 border border-zinc-800 text-[11px] text-zinc-400">
                        Timelock Active. Executable once lock expires.
                      </div>
                      <Button
                        onClick={() => handleExecute(prop.id)}
                        isLoading={execLoading}
                        className="w-full h-9 flex items-center justify-center gap-1.5"
                      >
                        <FiPlay className="h-3.5 w-3.5" /> Execute Grant
                      </Button>
                    </div>
                  )}

                  {prop.status === 'executed' && (
                    <div className="rounded-lg bg-emerald-500/5 p-3 border border-emerald-500/20 text-xs text-emerald-400 text-center font-medium">
                      Grant Paid Out Successfully
                    </div>
                  )}

                  {prop.status === 'failed' && (
                    <div className="rounded-lg bg-red-500/5 p-3 border border-red-500/20 text-xs text-red-400 text-center font-medium">
                      Proposal Rejected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Real-time Contract Events Logging Feed */}
      <div className="card border border-zinc-850 p-6 bg-zinc-950/40 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <FiActivity className="text-zinc-500 animate-pulse" />
          Real-time DAO Contract Events Log
        </h3>
        
        {eventsLoading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-10 animate-pulse bg-zinc-900/60 rounded-lg" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-xs text-zinc-550 italic">No events streaming yet. Actions on-chain will appear here.</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="rounded-lg border border-zinc-850 bg-zinc-950/60 p-3 text-[11px] font-mono animate-fade-in"
              >
                <div className="flex justify-between text-white font-semibold mb-1">
                  <span>{evt.topic.join(' / ')}</span>
                  <span className="text-zinc-550">Ledger: {evt.ledger}</span>
                </div>
                <p className="text-zinc-400 truncate">Payload: {JSON.stringify(evt.value, (key, value) => typeof value === 'bigint' ? value.toString() : value)}</p>
                <a
                  href={stellar.getExplorerLink(evt.txHash, 'tx')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-white"
                >
                  Tx Hash: {stellar.formatAddress(evt.txHash, 6, 6)}
                  <FiExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
