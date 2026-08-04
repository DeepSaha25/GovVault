import React from 'react';

interface VoteDistributionBarProps {
  yesVotes: number;
  noVotes: number;
  className?: string;
}

export function VoteDistributionBar({ yesVotes, noVotes, className = '' }: VoteDistributionBarProps) {
  const total = yesVotes + noVotes;
  const yesPercent = total > 0 ? (yesVotes / total) * 100 : 0;
  const noPercent = total > 0 ? (noVotes / total) * 100 : 0;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between text-[11px] font-semibold">
        <span className="text-emerald-600 dark:text-emerald-400">
          ✓ {yesVotes} YES {total > 0 ? `(${yesPercent.toFixed(0)}%)` : ''}
        </span>
        <span className="text-rose-500 dark:text-rose-400">
          ✗ {noVotes} NO {total > 0 ? `(${noPercent.toFixed(0)}%)` : ''}
        </span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-surface-700 rounded-full h-2 overflow-hidden flex border border-slate-200/50 dark:border-surface-700/50">
        {total === 0 ? (
          <div className="w-full bg-slate-200 dark:bg-surface-600 h-full rounded-full" />
        ) : (
          <>
            <div
              className="bg-emerald-500 h-full transition-all duration-700 ease-out"
              style={{ width: `${yesPercent}%` }}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-700 ease-out"
              style={{ width: `${noPercent}%` }}
            />
          </>
        )}
      </div>
      {total > 0 && (
        <p className="text-[10px] text-slate-400 text-right font-mono">{total} total votes cast</p>
      )}
    </div>
  );
}
