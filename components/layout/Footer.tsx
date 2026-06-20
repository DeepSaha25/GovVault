export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="mx-auto flex flex-col md:flex-row justify-between items-center w-full py-6 px-4 max-w-7xl gap-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
          <span className="font-bold text-sm text-black">🏛️ GovVault</span>
          <span className="text-xs text-slate-500 font-medium">© 2026 GovVault Protocol. Built on Stellar Soroban.</span>
        </div>
        <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-wider">
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-black transition-colors"
          >
            Stellar Expert
          </a>
          <a
            href="https://github.com/DeepSaha25/GovVault"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-black transition-colors"
          >
            Docs
          </a>
          <a
            href="#"
            className="text-slate-500 hover:text-black transition-colors"
          >
            Audit
          </a>
        </div>
      </div>
    </footer>
  );
}
