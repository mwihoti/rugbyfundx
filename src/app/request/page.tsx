import { AssistanceRequestForm } from "@/components/AssistanceRequestForm";
import Link from "next/link";

export default function RequestPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#065f46] to-[#10b981] text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/teams"
            className="inline-flex items-center gap-1 text-green-200 hover:text-white text-sm mb-4 transition"
          >
            ← Back to Teams
          </Link>
          <h1 className="text-4xl font-bold mb-3">Request Funding Assistance</h1>
          <p className="text-green-100 text-lg max-w-xl">
            Apply for on-chain crowdfunding support for your rugby team. All requests are reviewed transparently.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Info sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">How it works</h2>
              <ol className="space-y-4">
                {[
                  { icon: "📋", title: "Submit Request", desc: "Fill out the form with your team details and funding needs" },
                  { icon: "🔍", title: "Review Process", desc: "Our team reviews your application within 2-3 business days" },
                  { icon: "🔗", title: "On-Chain Setup", desc: "Approved teams get a Cardano wallet address and are listed on the platform" },
                  { icon: "💰", title: "Receive Donations", desc: "Supporters can donate ADA directly to your team wallet" },
                  { icon: "✅", title: "Milestone Release", desc: "Complete milestones to trigger transparent fund releases" },
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0 text-lg">
                      {step.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Eligible categories</h3>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li className="flex items-center gap-2"><span className="text-[#10b981]">✓</span> Team kits &amp; equipment</li>
                <li className="flex items-center gap-2"><span className="text-[#10b981]">✓</span> Training &amp; coaching</li>
                <li className="flex items-center gap-2"><span className="text-[#10b981]">✓</span> Medical &amp; physiotherapy</li>
                <li className="flex items-center gap-2"><span className="text-[#10b981]">✓</span> Travel &amp; accommodation</li>
                <li className="flex items-center gap-2"><span className="text-[#10b981]">✓</span> Training facility improvements</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Need help?</h3>
              <p className="text-xs text-gray-600 mb-3">
                Contact us on Telegram or Twitter for assistance with your application.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://t.me/rugbyfundx"
                  className="text-xs bg-[#065f46] text-white px-3 py-1.5 rounded-lg hover:bg-[#10b981] transition font-medium"
                >
                  Telegram
                </a>
                <a
                  href="https://twitter.com/rugbyfundx"
                  className="text-xs border border-[#065f46] text-[#065f46] px-3 py-1.5 rounded-lg hover:bg-green-50 transition font-medium"
                >
                  Twitter
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-green-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Application Form</h2>
              <AssistanceRequestForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
