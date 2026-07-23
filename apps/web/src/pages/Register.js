import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Shield, Mail, Key, User, Phone, Building, MapPin } from "lucide-react";
import { Button, Card, Input } from "@remotefix/ui";
import { api } from "../api.js";
export const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();
    const registerMutation = useMutation({
        mutationFn: async (registerData) => {
            return api.register(registerData);
        },
        onSuccess: (data) => {
            localStorage.setItem("rf_token", data.token);
            localStorage.setItem("rf_user", JSON.stringify(data.user));
            navigate("/customer");
            window.location.reload();
        },
        onError: (err) => {
            setErrorMsg(err.message || "Failed to create account. Please check inputs.");
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password || !fullName || !phone)
            return;
        setErrorMsg("");
        registerMutation.mutate({
            email,
            password,
            fullName,
            phone,
            companyName: companyName || undefined,
            billingAddress: billingAddress || undefined,
        });
    };
    return (_jsxs("div", { className: "max-w-lg mx-auto px-4 py-16", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 group mb-4", children: [_jsx("div", { className: "p-2 bg-primary/10 rounded-lg border border-primary/20", children: _jsx(Shield, { className: "w-5 h-5 text-primary" }) }), _jsxs("span", { className: "font-display text-xl font-bold tracking-tight text-text", children: ["Remote", _jsx("span", { className: "text-primary", children: "Fix" })] })] }), _jsx("h1", { className: "text-2xl font-bold font-display text-text", children: "Create Customer Account" }), _jsx("p", { className: "text-xs text-muted font-body mt-1.5", children: "Establish an account to track diagnostics and manage corporate SLA invoices." })] }), errorMsg && (_jsx("div", { className: "bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body", children: errorMsg })), _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Card, { className: "flex flex-col gap-5", glowColor: "cyan", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Full Name *", placeholder: "John Doe", value: fullName, onChange: (e) => setFullName(e.target.value), required: true, className: "pl-10" }), _jsx(User, { className: "absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" })] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Phone Number *", placeholder: "5551234567", value: phone, onChange: (e) => setPhone(e.target.value), required: true, className: "pl-10" }), _jsx(Phone, { className: "absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" })] })] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Email Address *", type: "email", placeholder: "name@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "pl-10" }), _jsx(Mail, { className: "absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" })] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Password *", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "pl-10" }), _jsx(Key, { className: "absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" })] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Company Name (Optional)", placeholder: "Acme Corp", value: companyName, onChange: (e) => setCompanyName(e.target.value), className: "pl-10" }), _jsx(Building, { className: "absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" })] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Billing Address (Optional)", placeholder: "Suite, Street, City, ZIP", value: billingAddress, onChange: (e) => setBillingAddress(e.target.value), className: "pl-10" }), _jsx(MapPin, { className: "absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" })] }), _jsx(Button, { variant: "primary", type: "submit", isLoading: registerMutation.isPending, className: "w-full flex justify-center mt-2", children: "Create Account" }), _jsxs("div", { className: "text-center font-body text-xs text-muted mt-2 border-t border-border/40 pt-4", children: ["Already have an account?", " ", _jsx(Link, { to: "/login", className: "text-primary hover:underline font-semibold", children: "Sign in here" })] })] }) })] }));
};
//# sourceMappingURL=Register.js.map