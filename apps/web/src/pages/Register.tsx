import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Shield, Mail, Key, User, Phone, Building, MapPin } from "lucide-react";
import { Button, Card, Input } from "@remotefix/ui";
import { useAuth } from "../context/AuthContext.js";
import { SEO } from "../components/SEO.js";

export const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phone) return;
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await register({
        email,
        password,
        fullName,
        phone,
        companyName: companyName || undefined,
        billingAddress: billingAddress || undefined,
      });
      navigate("/customer", { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 font-body">
      <SEO
        title="Create Customer Account | RemoteFix"
        description="Register a free RemoteFix customer account to link guest service bookings, access invoice history, and manage corporate AMC contracts."
        canonicalUrl="https://remotefix.com/register"
      />
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-text">
            Remote<span className="text-primary">Fix</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold font-display text-text">Create Customer Account</h1>
        <p className="text-xs text-muted font-body mt-1.5">
          Establish an account to track diagnostics and manage corporate SLA invoices.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="flex flex-col gap-5" glowColor="cyan">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="Full Name *"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-10"
              />
              <User className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
            </div>
            <div className="relative">
              <Input
                label="Phone Number *"
                placeholder="5551234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="pl-10"
              />
              <Phone className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
            </div>
          </div>

          <div className="relative">
            <Input
              label="Email Address *"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
            />
            <Mail className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
          </div>

          <div className="relative">
            <Input
              label="Password *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10"
            />
            <Key className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
          </div>

          <div className="relative">
            <Input
              label="Company Name (Optional)"
              placeholder="Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="pl-10"
            />
            <Building className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
          </div>

          <div className="relative">
            <Input
              label="Billing Address (Optional)"
              placeholder="Suite, Street, City, ZIP"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className="pl-10"
            />
            <MapPin className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
          </div>

          <Button variant="primary" type="submit" isLoading={isSubmitting} className="w-full flex justify-center mt-2">
            Create Account
          </Button>

          <div className="text-center font-body text-xs text-muted mt-2 border-t border-border/40 pt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign in here
            </Link>
          </div>
        </Card>
      </form>
    </div>
  );
};
