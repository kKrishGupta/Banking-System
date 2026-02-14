import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield } from "lucide-react";
import { toast } from "sonner";
function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!strongPasswordRegex.test(password)) {
      toast.error("Password must include uppercase, lowercase, number, and special character");
      return;
    }
    setLoading(true);
    try {
      const success = await register(name, email, password);
      if (success) {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        toast.error("Email already exists. Please use a different email.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {
    /* Logo */
  }
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">LedgerBank</span>
        </Link>

        <Card className="shadow-lg border-gray-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your details to get started with LedgerBank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
    id="name"
    type="text"
    placeholder="John Doe"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
    className="bg-white"
  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
    id="email"
    type="email"
    placeholder="john@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className="bg-white"
  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
    id="password"
    type="password"
    placeholder="Create a password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="bg-white"
    minLength={8}
  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
    id="confirmPassword"
    type="password"
    placeholder="Confirm your password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    className="bg-white"
    minLength={8}
  />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}
export {
  RegisterPage as default
};
