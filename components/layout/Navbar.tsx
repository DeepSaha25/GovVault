'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import WalletButton from '../wallet/WalletButton';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transfer', label: 'XLM Direct Transfer' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-black">
          <span className="text-lg font-bold tracking-wider uppercase font-sans">
            🏛️ GovVault
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-semibold text-xs uppercase tracking-widest h-full flex items-center border-b-2 transition-all ${
                  isActive
                    ? 'border-black text-black'
                    : 'border-transparent text-slate-500 hover:text-black hover:border-slate-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet action (desktop) */}
        <div className="hidden md:block">
          <WalletButton />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-black"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden animate-slide-up">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-black'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-black'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <WalletButton />
          </div>
        </div>
      )}
    </header>
  );
}
