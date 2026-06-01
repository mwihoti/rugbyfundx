import Link from "next/link";
import { getCardanoscanBaseUrl, getNetworkLabel } from "@/lib/cardanoExplorer";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-green-200 bg-[#fdfffc] py-12 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-[#065f46] to-[#10b981] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">RFX</span>
              </div>
              <h3 className="font-bold text-[#065f46]">RugbyFundX</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Transparent on-chain crowdfunding for Kenyan rugby on Cardano
            </p>
            <div className="text-xs bg-green-50 text-green-800 border border-green-200 rounded-lg px-2.5 py-1.5 inline-block">
              Cardano {getNetworkLabel()}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/teams" className="text-gray-600 hover:text-[#065f46] transition">Teams</Link></li>
              <li><Link href="/transparency" className="text-gray-600 hover:text-[#065f46] transition">Transparency</Link></li>
              <li><Link href="/dashboard" className="text-gray-600 hover:text-[#065f46] transition">Dashboard</Link></li>
              <li><Link href="/wallet" className="text-gray-600 hover:text-[#065f46] transition">My Wallet</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Get Involved</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/request" className="text-gray-600 hover:text-[#065f46] transition">Request Funding</Link></li>
              <li><Link href="/teams" className="text-gray-600 hover:text-[#065f46] transition">Donate to Teams</Link></li>
              <li><a href="https://t.me/rugbyfundx" className="text-gray-600 hover:text-[#065f46] transition">Telegram</a></li>
              <li><a href="https://twitter.com/rugbyfundx" className="text-gray-600 hover:text-[#065f46] transition">Twitter / X</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={getCardanoscanBaseUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#065f46] transition"
                >
                  Cardanoscan (Testnet)
                </a>
              </li>
              <li>
                <a
                  href="https://docs.cardano.org/cardano-testnets/tools/faucet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#065f46] transition"
                >
                  Get Test ADA
                </a>
              </li>
              <li>
                <a
                  href="https://meshjs.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#065f46] transition"
                >
                  Powered by Mesh SDK
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-500">
            © {currentYear} RugbyFundX. Open-source public good for transparent sports funding.
          </p>
          <p className="text-xs text-gray-400">
            Built on Cardano · Powered by Mesh SDK
          </p>
        </div>
      </div>
    </footer>
  );
}
