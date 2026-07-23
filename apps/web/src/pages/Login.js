import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Shield, Key, Mail, ArrowRight } from "lucide-react";
import { Button, Card, Input } from "@remotefix/ui";
import { api } from "../api.js";
export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            return api.login(credentials);
        },
        onSuccess: (data) => {
            localStorage.setItem("rf_token", data.token);
            localStorage.setItem("rf_user", JSON.stringify(data.user));
            // Redirect based on role
            if (data.user.role === "admin") {
                // Admin goes to customer portal or admin dashboard
                navigate("/customer");
            }
            else if (data.user.role === "engineer") {
                navigate("/engineer");
            }
            else {
                navigate("/customer");
            }
            // Force refresh to reload header states
            window.location.reload();
        },
        onError: (err) => {
            setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password)
            return;
        setErrorMsg("");
        loginMutation.mutate({ email, password });
    };
    // Social login mock handler
    const handleSocialLogin = (provider) => {
        setErrorMsg("");
        // Simulate OAuth callback
        const mockOauthPayload = {
            provider,
            token: `mock_oauth_token_${provider}_${Date.now()}`,
            fullName: provider === "google" ? "Google User" : "Microsoft Partner",
            email: provider === "google" ? "google.user@example.com" : "microsoft.partner@example.com",
        };
        api.oauthLogin(mockOauthPayload)
            .then((data) => {
            localStorage.setItem("rf_token", data.token);
            localStorage.setItem("rf_user", JSON.stringify(data.user));
            navigate("/customer");
            window.location.reload();
        })
            .catch((err) => {
            setErrorMsg(err.message || "Social login failed.");
        });
    };
    return (_jsxs("div", { className: "max-w-md mx-auto px-4 py-20", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 group mb-4", children: [_jsx("div", { className: "p-2 bg-primary/10 rounded-lg border border-primary/20", children: _jsx(Shield, { className: "w-5 h-5 text-primary" }) }), _jsxs("span", { className: "font-display text-xl font-bold tracking-tight text-text", children: ["Remote", _jsx("span", { className: "text-primary", children: "Fix" })] })] }), _jsx("h1", { className: "text-2xl font-bold font-display text-text", children: "Sign in to RemoteFix" }), _jsx("p", { className: "text-xs text-muted font-body mt-1.5", children: "Access your appointments, billing history, and support tickets." })] }), errorMsg && (_jsx("div", { className: "bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body", children: errorMsg })), _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Card, { className: "flex flex-col gap-5", glowColor: "cyan", children: [_jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Email Address", type: "email", placeholder: "name@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "pl-10" }), _jsx(Mail, { className: "absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" })] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "pl-10" }), _jsx(Key, { className: "absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" })] }), _jsxs(Button, { variant: "primary", type: "submit", isLoading: loginMutation.isPending, className: "w-full flex justify-center gap-1.5 mt-2", children: ["Sign In", _jsx(ArrowRight, { size: 16 })] }), _jsxs("div", { className: "relative flex py-2 items-center", children: [_jsx("div", { className: "flex-grow border-t border-border/40" }), _jsx("span", { className: "flex-shrink mx-4 text-xs text-muted font-body", children: "Or continue with" }), _jsx("div", { className: "flex-grow border-t border-border/40" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Button, { variant: "secondary", type: "button", className: "text-xs py-2 bg-transparent border border-border hover:bg-surface-hover hover:border-muted/20", onClick: () => handleSocialLogin("google"), children: "Google Login" }), _jsx(Button, { variant: "secondary", type: "button", className: "text-xs py-2 bg-transparent border border-border hover:bg-surface-hover hover:border-muted/20", onClick: () => handleSocialLogin("microsoft"), children: "Microsoft Login" })] }), _jsxs("div", { className: "text-center font-body text-xs text-muted mt-2 border-t border-border/40 pt-4", children: ["New to RemoteFix?", " ", _jsx(Link, { to: "/register", className: "text-primary hover:underline font-semibold", children: "Create customer account" })] })] }) })] }));
};
//# sourceMappingURL=Login.js.map