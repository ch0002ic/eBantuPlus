import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            eBantu<span className="text-blue-600">+</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered legal automation tool for LAB (Legal Aid Bureau) to automate 
            nafkah iddah and mutaah formula updates from Syariah Court cases
          </p>
        </div>

        <div className="text-center">
          <Link 
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Launch Dashboard
          </Link>
        </div>

        <footer className="mt-20 text-center text-gray-500">
          <p>SMU LIT Hackathon 2025 | Team HashBill</p>
          <p className="mt-2">Built for Singapore Legal Aid Bureau (LAB)</p>
        </footer>
      </div>
    </div>
  );
}
