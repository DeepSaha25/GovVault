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
  FiSearch,
  FiLock,
  FiUnlock,
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

  // Search and Filter State
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'failed' | 'executed'>('all');

  // Voting Calculator State per Proposal
  const [voteInputs, setVoteInputs] = useState<Record<number, { votes: number }>>({});
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

  // Filtered Proposals
  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toString() === search;
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Timelocked Treasury Queue items
  const treasuryQueue = proposals.filter((p) => p.status === 'passed');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-[#fcf8fa]">
      {/* Header & Subtitle */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Network Overview</p>
          <h1 className="text-3xl font-bold tracking-tight text-black font-sans">Governance Dashboard</h1>
        </div>

        {isConnected && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white px-5 py-2.5 rounded font-semibold flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all text-xs uppercase tracking-wider"
          >
            <FiPlus className="h-4 w-4" />
            {showForm ? 'Close Console' : 'New Proposal'}
          </button>
        )}
      </div>

      {!GOVERNOR_CONTRACT_ID && (
        <div className="rounded border border-slate-200 bg-white p-4 text-slate-500 text-xs flex items-center gap-2.5">
          <FiInfo className="text-slate-400 h-4 w-4 flex-shrink-0" />
          <span>Governor contract ID is not configured. Please deploy the smart contracts first to fetch real-time state.</span>
        </div>
      )}

      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 border border-slate-200 bg-white divide-y md:divide-y-0 md:divide-x divide-slate-200">
        <div className="p-6">
          <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Total Treasury Pool</p>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-black font-sans">1,245,890.00 XLM</span>
            <span className="text-[10px] font-mono text-slate-400 mt-1">Timelocked: 340,000 XLM</span>
          </div>
        </div>
        <div className="p-6">
          <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Active Proposals</p>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-black font-sans">
              {proposals.filter((p) => p.status === 'active').length} Proposals
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400">Voting Live</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Quadratic Votes Cast</p>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-black font-sans">12,840 Votes</span>
            <span className="text-[10px] font-mono text-slate-400 mt-1">↑ 12% from last epoch</span>
          </div>
        </div>
        <div className="p-6">
          <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">DAO Members</p>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-black font-sans">1,894 Wallets</span>
            <span className="text-[10px] font-mono text-slate-400 mt-1">Active on Stellar Soroban</span>
          </div>
        </div>
      </div>

      {/* New Proposal Modal Form */}
      {showForm && (
        <div className="rounded border border-slate-200 bg-white p-6 animate-slide-up space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-black uppercase tracking-wider">Create New Grant Proposal</h2>
            <p className="text-xs text-slate-400">Deposit 100 GVT tokens to initiate a proposal.</p>
          </div>
          <form onSubmit={handleCreateProposal} className="space-y-4 max-w-3xl">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Proposal Title</label>
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
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</label>
              <textarea
                id="description"
                rows={3}
                placeholder="Describe the milestone and scope of work..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="field-input h-24 pt-2"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="target" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Recipient Target Account</label>
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
                <label htmlFor="amount" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Amount (XLM)</label>
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

      {/* Main Content Layout (8/4 Split Screen) */}
      {!isConnected ? (
        <div className="text-center py-16 rounded border border-dashed border-slate-200 bg-white">
          <FiActivity className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-black">Wallet Connection Required</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Please connect your Freighter wallet using the selector in the header to view governance proposals and cast votes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Proposals List (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-lg font-bold text-black uppercase tracking-wider">Active Proposals</h2>
              <div className="relative w-full md:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  className="w-full pl-9 pr-3 h-10 bg-white border border-slate-200 rounded focus:border-black outline-none text-xs text-slate-700 placeholder:text-slate-400"
                  placeholder="Search proposals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 border-b border-slate-200 overflow-x-auto pb-px">
              {([
                { id: 'all', label: 'All Proposals' },
                { id: 'active', label: 'Active' },
                { id: 'passed', label: 'Passed' },
                { id: 'failed', label: 'Failed' },
                { id: 'executed', label: 'Executed' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`font-semibold text-xs uppercase tracking-wider pb-2 px-1 whitespace-nowrap border-b-2 transition-all ${
                    filter === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-slate-500 hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Proposals List mapping */}
            {loading ? (
              <div className="flex justify-center items-center py-20 text-slate-500 gap-2">
                <FiLoader className="animate-spin h-5 w-5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Synchronizing state from Soroban...</span>
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-16 text-slate-400 border border-slate-200 rounded bg-white text-xs">
                No proposals found matching this filter.
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProposals.map((prop) => {
                  const votesToCast = voteInputs[prop.id]?.votes || 1;
                  const quadraticCost = votesToCast * votesToCast;
                  const evalLoading = actionLoading[`eval-${prop.id}`];
                  const execLoading = actionLoading[`exec-${prop.id}`];
                  const voteLoading = actionLoading[`vote-${prop.id}`];

                  return (
                    <div
                      key={prop.id}
                      className="border border-slate-200 bg-white p-6 rounded flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-black transition-colors"
                    >
                      {/* Left Part of Card */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 text-slate-600 rounded">
                            #GV-{prop.id}
                          </span>
                          <Badge status={prop.status} />
                        </div>
                        <h3 className="text-base font-bold text-black font-sans">{prop.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{prop.description}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          <div>
                            <span className="block text-slate-400 text-[9px] mb-0.5">Proposer</span>
                            <span className="font-mono text-black">{stellar.formatAddress(prop.proposer, 5, 5)}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 text-[9px] mb-0.5">Grant Value</span>
                            <span className="text-black font-bold">{prop.amount} XLM</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 text-[9px] mb-0.5">Yes Votes</span>
                            <span className="text-emerald-700 font-bold">{prop.yesVotes}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 text-[9px] mb-0.5">No Votes</span>
                            <span className="text-rose-700 font-bold">{prop.noVotes}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Part: Vote Panel / Action Panel */}
                      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center gap-4">
                        {prop.status === 'active' && (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                Cast Your Vote (Quadratic Cost)
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={votesToCast}
                                  onChange={(e) => updateVoteInput(prop.id, parseInt(e.target.value) || 1)}
                                  className="w-16 h-9 rounded border border-slate-200 bg-white text-xs text-black font-mono text-center focus:border-black focus:ring-0 focus:outline-none"
                                  disabled={voteLoading}
                                />
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Cost: {quadraticCost} Tokens
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => handleVote(prop.id, true)}
                                isLoading={voteLoading}
                                className="h-9 text-xs bg-white hover:bg-emerald-50 hover:border-emerald-600 border border-slate-200 text-slate-700"
                              >
                                <FiCheck className="mr-1 h-3.5 w-3.5 text-emerald-600" /> YES
                              </Button>
                              <Button
                                onClick={() => handleVote(prop.id, false)}
                                isLoading={voteLoading}
                                className="h-9 text-xs bg-white hover:bg-rose-50 hover:border-rose-600 border border-slate-200 text-slate-700"
                              >
                                <FiX className="mr-1 h-3.5 w-3.5 text-rose-600" /> NO
                              </Button>
                            </div>

                            <Button
                              onClick={() => handleEvaluate(prop.id)}
                              isLoading={evalLoading}
                              variant="secondary"
                              className="w-full h-8 text-[10px] uppercase tracking-wider"
                            >
                              End Voting Period
                            </Button>
                          </div>
                        )}

                        {prop.status === 'passed' && (
                          <div className="space-y-2">
                            <div className="rounded border border-amber-200 bg-amber-50 p-2.5 text-[9px] font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                              <FiLock className="h-3 w-3 flex-shrink-0" />
                              <span>Timelock Active (Executable)</span>
                            </div>
                            <Button
                              onClick={() => handleExecute(prop.id)}
                              isLoading={execLoading}
                              className="w-full h-9 flex items-center justify-center gap-1.5 uppercase text-xs tracking-wider"
                            >
                              <FiPlay className="h-3.5 w-3.5" /> Execute Release
                            </Button>
                          </div>
                        )}

                        {prop.status === 'executed' && (
                          <div className="rounded border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-800 text-center font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                            <FiUnlock className="h-3.5 w-3.5" /> Paid Out
                          </div>
                        )}

                        {prop.status === 'failed' && (
                          <div className="rounded border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-800 text-center font-bold uppercase tracking-wider">
                            Rejected
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Treasury Payout Queue & Event Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Treasury Payout Queue */}
            <div className="border border-slate-200 bg-white rounded overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <span className="font-bold text-xs uppercase tracking-wider text-black">Treasury Queue</span>
                <span className="font-mono text-xs bg-black text-white px-2 py-0.5 rounded">
                  {treasuryQueue.length} Items
                </span>
              </div>
              <div className="divide-y divide-slate-200">
                {treasuryQueue.length === 0 ? (
                  <p className="p-4 text-xs text-slate-500 italic text-center">No payouts pending execution.</p>
                ) : (
                  treasuryQueue.map((item) => (
                    <div key={item.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-xs text-black truncate max-w-[140px]">{item.title}</p>
                          <p className="font-mono text-slate-400 text-[10px]">GV-{item.id}</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-black">{item.amount} XLM</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-700">
                        <FiLock className="h-3 w-3" />
                        <span className="font-mono text-[10px]">Timelocked Payout</span>
                      </div>
                      <button
                        onClick={() => handleExecute(item.id)}
                        className="w-full py-2 bg-black text-white hover:bg-opacity-90 active:scale-95 text-[10px] font-bold uppercase tracking-widest transition-all rounded border border-black"
                      >
                        Execute Release
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Event Ledger Logs Feed */}
            <div className="border border-slate-200 bg-white p-4 rounded space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-1.5">
                <FiActivity className="text-slate-500 animate-pulse" />
                Live Event Ledger
              </h3>
              
              {eventsLoading ? (
                <div className="space-y-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-10 animate-pulse bg-slate-100 rounded" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No events streaming. Actions on-chain will appear here.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      className="rounded border border-slate-150 bg-slate-50 p-2.5 text-[10px] font-mono animate-fade-in space-y-1"
                    >
                      <div className="flex justify-between text-black font-semibold">
                        <span>{evt.topic.join(' / ')}</span>
                        <span className="text-slate-400 text-[9px]">L{evt.ledger}</span>
                      </div>
                      <p className="text-slate-500 truncate leading-relaxed">
                        Payload: {JSON.stringify(evt.value, (k, v) => typeof v === 'bigint' ? v.toString() : v)}
                      </p>
                      <a
                        href={stellar.getExplorerLink(evt.txHash, 'tx')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] text-slate-400 hover:text-black"
                      >
                        Tx Hash: {stellar.formatAddress(evt.txHash, 5, 5)}
                        <FiExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
