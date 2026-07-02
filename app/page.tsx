import Link from 'next/link';
import { FiArrowRight, FiShield, FiPercent, FiActivity, FiGrid } from 'react-icons/fi';

const features = [
  {
    icon: FiPercent,
    title: 'Quadratic Voting Engine',
    description: 'Ensure democratic outcomes. The voting cost scales quadratically (cost = votes²), protecting consensus against whale dominance.',
  },
  {
    icon: FiShield,
    title: 'Timelocked Treasury Executor',
    description: 'Successful grant proposals trigger auto-payouts protected by an on-chain timelock to ensure safety and prevent exploits.',
  },
  {
    icon: FiActivity,
    title: 'Milestone Tracking & State Machine',
    description: 'Proposal lifecycle states (Active ➔ Passed ➔ Executed/Failed) are fully verified on-chain via Soroban smart contracts.',
  },
];

export default function LandingPage() {
  return (
    <div className="animate-fade-in bg-[#fcf8fa] dark:bg-surface-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-900">
        {/* Background decorative gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten animate-pulse" />
          <div className="absolute top-20 right-0 w-80 h-80 bg-emerald-400/20 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten" />
          <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-blue-400/10 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8 lg:pt-16 lg:pb-28">
          <div className="mx-auto max-w-3xl text-center space-y-8">

            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl font-sans drop-shadow-sm">
              Democratic Governance with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                Quadratic Voting
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl max-w-2xl mx-auto font-medium">
              Empower DAO members to propose, vote quadratically on funding allocations, and execute decentralized treasury grants trustlessly.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link href="/dashboard" className="btn-primary h-14 px-8 flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-xl shadow-black/10 dark:shadow-white/5 hover:-translate-y-0.5 transition-transform">
                Enter voting portal <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/transfer" className="btn-secondary h-14 px-8 flex items-center justify-center gap-2 uppercase tracking-wider text-sm hover:-translate-y-0.5 transition-transform bg-white/80 dark:bg-surface-800/80 backdrop-blur-md">
                Direct XLM Transfer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white sm:text-3xl font-sans">
            GovVault Core Protocol Pillars
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            State of the art DAO governance and treasury execution utilizing Soroban.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card rounded border border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-6 transition-all hover:border-black flex flex-col justify-between h-56">
              <div>
                <feature.icon className="mb-4 h-6 w-6 text-black dark:text-white" />
                <h3 className="text-base font-bold text-black dark:text-white font-sans mb-2">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Task Checklist Tracker */}
      <section className="border-t border-slate-200 dark:border-surface-700 bg-slate-50 dark:bg-surface-800/50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded border border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-8">
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2 font-sans">
                <FiGrid className="h-5 w-5 text-slate-400" />
                Core Governance Infrastructure Setup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-wallet connections, quadratic on-chain voting metrics, and secure execution flows.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 text-center">
              <div className="rounded border border-slate-200 dark:border-surface-700 p-4 bg-slate-50 dark:bg-surface-800">
                <div className="text-sm font-bold text-black dark:text-white">Wallet Integration</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 font-semibold">Freighter, xBull, and Albedo</div>
              </div>
              <div className="rounded border border-slate-200 dark:border-surface-700 p-4 bg-slate-50 dark:bg-surface-800">
                <div className="text-sm font-bold text-black dark:text-white">Voting Logic</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 font-semibold">On-chain Quadratic Cost Engine</div>
              </div>
              <div className="rounded border border-slate-200 dark:border-surface-700 p-4 bg-slate-50 dark:bg-surface-800">
                <div className="text-sm font-bold text-black dark:text-white">Treasury Control</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 font-semibold">Timelocked Release Mechanism</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
