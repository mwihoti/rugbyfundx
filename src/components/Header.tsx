import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-200 bg-[#fdfffc] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#065f46] to-[#10b981] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RFX</span>
            </div>
            <span className="font-bold text-lg text-[#065f46] hidden sm:inline">
              RugbyFundX
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-[#065f46] transition"
            >
              Home
            </Link>
            <Link
              href="/teams"
              className="text-sm font-medium text-gray-700 hover:text-[#065f46] transition"
            >
              Teams
            </Link>
            <Link
              href="/transparency"
              className="text-sm font-medium text-gray-700 hover:text-[#065f46] transition"
            >
              Transparency
            </Link>
            <Link
              href="/kpis"
              className="text-sm font-medium text-gray-700 hover:text-[#065f46] transition"
            >
              KPIs
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-[#065f46] transition"
            >
              Dashboard
            </Link>
          </nav>

          <button className="px-4 py-2 bg-[#065f46] text-white rounded-lg hover:bg-[#10b981] transition text-sm font-medium">
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
}
