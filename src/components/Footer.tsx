import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-green-200 bg-[#fdfffc] py-12 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-[#065f46] mb-4">RugbyFundX</h3>
            <p className="text-sm text-gray-600">
              Transparent on-chain crowdfunding for Kenyan rugby
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/teams" className="text-gray-600 hover:text-[#065f46]">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="text-gray-600 hover:text-[#065f46]">
                  Transactions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://telegram.org" className="text-gray-600 hover:text-[#065f46]">
                  Telegram
                </a>
              </li>
              <li>
                <a href="https://discord.com" className="text-gray-600 hover:text-[#065f46]">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://twitter.com" className="text-gray-600 hover:text-[#065f46]">
                  Twitter
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com" className="text-gray-600 hover:text-[#065f46]">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#065f46]">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-200 pt-8">
          <p className="text-center text-sm text-gray-600">
            © {currentYear} RugbyFundX. Open-source public good for transparent
            sports funding.
          </p>
        </div>
      </div>
    </footer>
  );
}
