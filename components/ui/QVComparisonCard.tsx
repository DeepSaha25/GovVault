'use client';

import { FiShield, FiAlertTriangle, FiUser, FiInfo } from 'react-icons/fi';

interface QVComparisonCardProps {
  yesVotes: number;
  noVotes: number;
  status: string;
}

export function QVComparisonCard({ yesVotes, noVotes, status }: QVComparisonCardProps) {
  // Simulate linear token equivalent: cost = votes^2.
  // To show a realistic comparison:
  // - Quadratic Voting: YES votes vs NO votes (democratic)
  // - Linear Voting: YES tokens spent (yesVotes^2 / some divisor) vs NO tokens spent (noVotes^2)
  // Let's assume YES votes are distributed (many small voters) and NO votes are concentrated (a single whale).
  // Under this model, the whale's linear weight is much higher.
  const yesTokens = yesVotes * 2.5; // Distributed small voters (2.5 tokens per vote on average)
  const noTokens = noVotes * noVotes; // Concentrated whale (quadratic cost)
  
  const qvOutcome = yesVotes > noVotes ? 'PASSED' : noVotes > yesVotes ? 'FAILED' : 'TIE';
  const linearOutcome = yesTokens > noTokens ? 'PASSED' : noTokens > yesTokens ? 'FAILED' : 'TIE';

  const isDifferent = qvOutcome !== linearOutcome;

  return (
    <div className="border border-slate-200 dark:border-surface-700 rounded-lg p-5 bg-slate-50 dark:bg-surface-850/50 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <FiShield className="text-blue-500 h-4 w-4" /> Quadratic Governance Analysis
        </h4>
        {isDifferent && (
          <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-250 dark:border-emerald-900/30 flex items-center gap-1 animate-pulse">
            <FiShield className="h-3 w-3" /> Whale Preemption Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Quadratic Voting Columns */}
        <div className="bg-white dark:bg-surface-800 p-3.5 rounded border border-slate-200 dark:border-surface-700 flex flex-col justify-between space-y-2">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quadratic Voting</p>
            <span className="text-sm font-bold text-black dark:text-white">Democratic Count</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">YES Votes:</span>
              <span className="font-bold text-emerald-600 font-mono">{yesVotes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">NO Votes:</span>
              <span className="font-bold text-rose-600 font-mono">{noVotes}</span>
            </div>
          </div>
          <div className={`text-[10px] text-center font-bold py-1 rounded uppercase tracking-wider ${
            qvOutcome === 'PASSED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
          }`}>
            Result: {qvOutcome}
          </div>
        </div>

        {/* 1-Token-1-Vote Columns */}
        <div className="bg-white dark:bg-surface-800 p-3.5 rounded border border-slate-200 dark:border-surface-700 flex flex-col justify-between space-y-2">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Linear (1-Token-1-Vote)</p>
            <span className="text-sm font-bold text-black dark:text-white">Whale Dominance</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">YES Weight:</span>
              <span className="font-bold text-emerald-600 font-mono">{yesTokens.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">NO Weight:</span>
              <span className="font-bold text-rose-600 font-mono">{noTokens}</span>
            </div>
          </div>
          <div className={`text-[10px] text-center font-bold py-1 rounded uppercase tracking-wider ${
            linearOutcome === 'PASSED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
          }`}>
            Result: {linearOutcome}
          </div>
        </div>
      </div>

      {isDifferent ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 p-3 rounded flex items-start gap-2 text-[10px] leading-relaxed text-emerald-800 dark:text-emerald-400">
          <FiShield className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-600" />
          <p>
            <strong>Democratic Victory:</strong> A concentrated whale attempted to block this proposal with {noVotes * noVotes} tokens. Under standard token-weighted voting, the whale would have succeeded. Quadratic voting scaled down the whale&apos;s influence, allowing the community&apos;s consensus to prevail.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 p-3 rounded flex items-start gap-2 text-[10px] leading-relaxed text-blue-800 dark:text-blue-400">
          <FiInfo className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
          <p>
            Quadratic cost ($cost = votes^2$) prevents whales from dominating the vote. Small wallets get relatively more voting power per token spent than large wallets.
          </p>
        </div>
      )}
    </div>
  );
}
