"use client";

import Link from "next/link";
import { useState } from "react";
import { useWalletContext } from "@/context/WalletContext";
import { WalletModal } from "./WalletModal";

export function Header() {
  const [walletOpen, setWalletOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { connected, address, walletName } = useWalletContext();

  const shortAddr = (addr: string) =>
    `${addr.slice(0, 8)}...${addr.slice(-4)}`;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/teams", label: "Teams" },
    { href: "/transparency", label: "Transparency" },
    { href: "/request", label: "Get Funding" },
    { href: "/wallet", label: "My Wallet" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-green-200 bg-[#fdfffc]/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-[#065f46] to-[#10b981] rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">RFX</span>
              </div>
              <span className="font-bold text-lg text-[#065f46] hidden sm:inline">
                RugbyFundX
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#065f46] hover:bg-green-50 rounded-lg transition"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {connected ? (
                <button
                  onClick={() => setWalletOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 border-2 border-green-200 text-[#065f46] rounded-lg hover:border-[#065f46] transition text-sm font-medium"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="hidden sm:inline">{walletName}</span>
                  <span className="font-mono text-xs hidden sm:inline text-gray-500">
                    {shortAddr(address || "")}
                  </span>
                  <span className="sm:hidden text-xs">Connected</span>
                </button>
              ) : (
                <button
                  onClick={() => setWalletOpen(true)}
                  className="px-4 py-2 bg-[#065f46] text-white rounded-lg hover:bg-[#10b981] transition text-sm font-semibold shadow-sm"
                >
                  Connect Wallet
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-[#065f46] rounded-lg hover:bg-green-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-green-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#065f46] hover:bg-green-50 rounded-lg transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
}
