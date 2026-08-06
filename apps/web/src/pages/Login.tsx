import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { Shield, Key, Mail, ArrowRight } from "lucide-react";
import { Button, Card, Input } from "@remotefix/ui";
import { useAuth } from "../context/AuthContext.js";
import { api } from "../services/api.js";
import { SEO } from "../components/SEO.js";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, getRedirectPath } = useAuth();

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const loggedInUser = await login({ email, password });
      const targetPath = from || getRedirectPath(loggedInUser.role);
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "microsoft") => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const mockOauthPayload = {
        provider,
        token: `mock_oauth_token_${provider}_${Date.now()}`,
        fullName: provider === "google" ? "Google User" : "Microsoft Partner",
        email: provider === "google" ? "google.user@example.com" : "microsoft.partner@example.com",
      };

      const data = await api.oauthLogin(mockOauthPayload);
      if (data.success && data.token && data.user) {
        localStorage.setItem("rf_token", data.token);
        if (data.refreshToken) {
          localStorage.setItem("rf_refresh_token", data.refreshToken);
        }
        localStorage.setItem("rf_user", JSON.stringify(data.user));
        const targetPath = from || getRedirectPath(data.user.role);
        navigate(targetPath, { replace: true });
        window.location.reload();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Social login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 font-body">
      <SEO
        title="Sign In | RemoteFix Customer & Tech Portal"
        description="Sign in to your RemoteFix account to manage bookings, track repair tickets, view invoices, and update profile."
        canonicalUrl="https://remotefix.com/login"
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
        <h1 className="text-2xl font-bold font-display text-text">Sign in to RemoteFix</h1>
        <p className="text-xs text-muted font-body mt-1.5">
          Access your appointments, billing history, and support tickets.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="flex flex-col gap-5" glowColor="cyan">
          <div className="relative">
            <Input
              label="Email Address"
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
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10"
            />
            <Key className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
          </div>

          <Button variant="primary" type="submit" isLoading={isSubmitting} className="w-full flex justify-center gap-1.5 mt-2">
            Sign In
            <ArrowRight size={16} />
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border/40"></div>
            <span className="flex-shrink mx-4 text-xs text-muted font-body">Or continue with</span>
            <div className="flex-grow border-t border-border/40"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              type="button"
              className="text-xs py-2 bg-transparent border border-border hover:bg-surface-hover hover:border-muted/20"
              onClick={() => handleSocialLogin("google")}
            >
              Google Login
            </Button>
            <Button
              variant="secondary"
              type="button"
              className="text-xs py-2 bg-transparent border border-border hover:bg-surface-hover hover:border-muted/20"
              onClick={() => handleSocialLogin("microsoft")}
            >
              Microsoft Login
            </Button>
          </div>

          <div className="text-center font-body text-xs text-muted mt-2 border-t border-border/40 pt-4">
            New to RemoteFix?{" "}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Create customer account
            </Link>
          </div>
        </Card>
      </form>
    </div>
  );
};
