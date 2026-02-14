import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  Shield,
  LayoutDashboard,
  ArrowRightLeft,
  History,
  CreditCard,
  LogOut,
  User,
  Coins
} from "lucide-react";
function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/transfer", icon: ArrowRightLeft, label: "Transfer Money" },
    { path: "/transactions", icon: History, label: "Transactions" },
    { path: "/accounts", icon: CreditCard, label: "Accounts" }
  ];
  if (user?.isAdmin) {
    navItems.push({ path: "/admin", icon: Coins, label: "Admin Panel" });
  }
  return <div className="min-h-screen bg-gray-50">
      {
    /* Sidebar */
  }
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col">
        {
    /* Logo */
  }
        <div className="p-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">LedgerBank</span>
          </Link>
        </div>

        {
    /* Navigation */
  }
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return <Link key={item.path} to={item.path}>
                <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
    >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>;
  })}
        </nav>

        {
    /* User Profile */
  }
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
    variant="outline"
    className="w-full gap-2"
    onClick={handleLogout}
  >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {
    /* Main Content */
  }
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>;
}
export {
  DashboardLayout as default
};
