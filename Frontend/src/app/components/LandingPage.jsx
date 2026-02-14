import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Shield, Zap, Lock, TrendingUp } from "lucide-react";
function LandingPage() {
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {
    /* Header */
  }
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">LedgerBank</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {
    /* Hero Section */
  }
      <main className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Ledger-Based Banking System</span>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Modern Banking,<br />
              Built for the Future
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience seamless money transfers, real-time transaction tracking, 
              and enterprise-grade security with our next-generation banking platform.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {
    /* Features */
  }
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="mb-3 text-gray-900">Secure Transactions</h3>
              <p className="text-gray-600">
                Bank-grade security with idempotency keys to prevent duplicate transactions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-3 text-gray-900">Instant Transfers</h3>
              <p className="text-gray-600">
                Transfer money between accounts instantly with real-time balance updates.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mb-3 text-gray-900">Transaction History</h3>
              <p className="text-gray-600">
                Complete ledger-based view of all your transactions with advanced filtering.
              </p>
            </div>
          </div>

          {
    /* Stats */
  }
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-blue-100">Secure</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Available</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">Instant</div>
                <div className="text-blue-100">Transfers</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {
    /* Footer */
  }
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2026 LedgerBank. All rights reserved.</p>
        </div>
      </footer>
    </div>;
}
export {
  LandingPage as default
};
