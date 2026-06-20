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
    <div className="animate-fade-in bg-[#fcf8fa]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="mb-6 inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              GovVault Protocol Core Active
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl lg:text-6xl font-sans">
              Democratic Governance with{' '}
              <span className="underline decoration-slate-300 underline-offset-4">Quadratic Voting</span>
            </h1>

            <p className="mt-6 text-base leading-8 text-slate-500 sm:text-lg max-w-2xl mx-auto">
              Empower DAO members to propose, vote quadratically on funding allocations, and execute decentralized treasury grants trustlessly.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/dashboard" className="btn-primary h-12 px-6 flex items-center justify-center gap-2 uppercase tracking-wider text-xs">
                Enter voting portal <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/transfer" className="btn-secondary h-12 px-6 flex items-center justify-center gap-2 uppercase tracking-wider text-xs">
                Direct XLM Transfer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-bold text-black sm:text-3xl font-sans">
            GovVault Core Protocol Pillars
          </h2>
          <p className="text-sm text-slate-500">
            State of the art DAO governance and treasury execution utilizing Soroban.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card rounded border border-slate-200 bg-white p-6 transition-all hover:border-black flex flex-col justify-between h-56">
              <div>
                <feature.icon className="mb-4 h-6 w-6 text-black" />
                <h3 className="text-base font-bold text-black font-sans mb-2">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Task Checklist Tracker */}
      <section className="border-t border-slate-200 bg-slate-50/50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded border border-slate-200 bg-white p-8">
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-bold text-black flex items-center gap-2 font-sans">
                <FiGrid className="h-5 w-5 text-slate-400" />
                Core Governance Infrastructure Setup
              </h3>
              <p className="text-xs text-slate-500">
                Multi-wallet connections, quadratic on-chain voting metrics, and secure execution flows.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 text-center">
              <div className="rounded border border-slate-200 p-4 bg-slate-50">
                <div className="text-sm font-bold text-black">Wallet Integration</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1 font-semibold">Freighter, xBull, and Albedo</div>
              </div>
              <div className="rounded border border-slate-200 p-4 bg-slate-50">
                <div className="text-sm font-bold text-black">Voting Logic</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1 font-semibold">On-chain Quadratic Cost Engine</div>
              </div>
              <div className="rounded border border-slate-200 p-4 bg-slate-50">
                <div className="text-sm font-bold text-black">Treasury Control</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1 font-semibold">Timelocked Release Mechanism</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
