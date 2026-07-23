import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ShieldAlert, Cpu, Calendar, CheckCircle2, FileImage } from "lucide-react";
import { Button, Card, Input, Select } from "@remotefix/ui";
import { api } from "../api.js";
const SUPPORT_TYPES = [
    { value: "remote", label: "Remote IT Support (Immediate Cloud fix)" },
    { value: "onsite", label: "On-Site Visit (Engineer comes to you)" },
    { value: "emergency", label: "Emergency SLA Support (15 min response)" },
    { value: "amc", label: "AMC Contract (Business Maintenance)" },
    { value: "consultation", label: "IT Business Consultation" },
];
const OS_OPTIONS = [
    { value: "Windows", label: "Microsoft Windows" },
    { value: "macOS", label: "Apple macOS" },
    { value: "Linux", label: "Linux (Ubuntu/CentOS/Debian)" },
    { value: "iOS/Android", label: "Mobile OS (iOS / Android)" },
    { value: "Server/NAS", label: "Server/NAS Storage System" },
    { value: "Other", label: "Other / Network Hardware" },
];
export const BookService = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // Wizard state
    const [step, setStep] = useState(1);
    // Form Fields
    const [type, setType] = useState("remote");
    const [serviceId, setServiceId] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [company, setCompany] = useState("");
    const [address, setAddress] = useState("");
    const [problemDescription, setProblemDescription] = useState("");
    const [preferredDate, setPreferredDate] = useState("");
    const [preferredTime, setPreferredTime] = useState("");
    const [operatingSystem, setOperatingSystem] = useState("Windows");
    const [images, setImages] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    // Initialize values from Query parameters if present
    useEffect(() => {
        const qType = searchParams.get("type");
        const qService = searchParams.get("serviceId");
        if (qType)
            setType(qType);
        if (qService)
            setServiceId(qService);
        // Try to pre-fill from logged-in user profile
        const storedUser = localStorage.getItem("rf_user");
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                setName(userObj.fullName);
                setEmail(userObj.email);
            }
            catch { }
        }
    }, [searchParams]);
    // Load services for dropdown
    const { data: servicesData } = useQuery({
        queryKey: ["services-list"],
        queryFn: async () => {
            const res = await api.getServices();
            return res.services || [];
        },
    });
    const servicesOptions = [
        { label: "-- Select Specific Service (Optional) --", value: "" },
        ...(servicesData || []).map((s) => ({
            label: `${s.name} - $${s.price}`,
            value: s.id,
        })),
    ];
    // Handle file uploads -> Base64
    const handleFileChange = (e) => {
        const files = e.target.files;
        if (!files)
            return;
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    setImages((prev) => [...prev, reader.result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };
    // Submit mutation
    const bookingMutation = useMutation({
        mutationFn: async (payload) => {
            return api.createBooking(payload);
        },
        onSuccess: (data) => {
            setStep(4); // Success step
        },
        onError: (err) => {
            setErrorMsg(err.message || "Failed to submit booking request. Please check fields.");
        },
    });
    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        }
        else if (step === 2) {
            if (!problemDescription || problemDescription.length < 10) {
                setErrorMsg("Please describe the issue in at least 10 characters.");
                return;
            }
            setErrorMsg("");
            setStep(3);
        }
    };
    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !phone || !email || !preferredDate || !preferredTime) {
            setErrorMsg("Please fill out all required contact and scheduling fields.");
            return;
        }
        if (type !== "remote" && !address) {
            setErrorMsg("Physical address is required for on-site services.");
            return;
        }
        setErrorMsg("");
        bookingMutation.mutate({
            type,
            serviceId: serviceId || undefined,
            name,
            phone,
            email,
            company: company || undefined,
            address: address || undefined,
            problemDescription,
            preferredDate,
            preferredTime,
            operatingSystem,
            images,
        });
    };
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-16", children: [step < 4 && (_jsx("div", { className: "flex justify-between items-center mb-12", children: [1, 2, 3].map((s) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center font-display font-bold border transition-all ${step === s
                                ? "bg-primary text-[#030712] border-primary shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                                : step > s
                                    ? "bg-primary/20 text-primary border-primary/40"
                                    : "bg-surface text-muted border-border"}`, children: s }), _jsx("span", { className: `text-xs font-semibold font-display hidden sm:inline ${step === s ? "text-text" : "text-muted"}`, children: s === 1 ? "Service Class" : s === 2 ? "System & Issue" : "Contact & Schedule" })] }, s))) })), errorMsg && (_jsx("div", { className: "bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body", children: errorMsg })), step === 1 && (_jsxs(Card, { className: "flex flex-col gap-6", glowColor: "cyan", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-black font-display text-text flex items-center gap-2", children: [_jsx(Cpu, { size: 24, className: "text-primary" }), "1. Choose Support Category"] }), _jsx("p", { className: "text-sm text-muted font-body mt-1", children: "Select how you would like our tech engineers to service your systems." })] }), _jsx(Select, { label: "Service Mode", options: SUPPORT_TYPES, value: type, onChange: (e) => setType(e.target.value) }), _jsx(Select, { label: "IT Catalog Item (Optional)", options: servicesOptions, value: serviceId, onChange: (e) => setServiceId(e.target.value) }), _jsx(Button, { variant: "primary", className: "ml-auto w-full sm:w-auto", onClick: handleNext, children: "Proceed to Details" })] })), step === 2 && (_jsxs(Card, { className: "flex flex-col gap-6", glowColor: "cyan", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-black font-display text-text flex items-center gap-2", children: [_jsx(ShieldAlert, { size: 24, className: "text-primary" }), "2. System Details & Faults"] }), _jsx("p", { className: "text-sm text-muted font-body mt-1", children: "Provide context on the affected system and upload pictures if applicable." })] }), _jsx(Select, { label: "Operating System", options: OS_OPTIONS, value: operatingSystem, onChange: (e) => setOperatingSystem(e.target.value) }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-sm font-medium font-display text-muted", children: "Problem Description" }), _jsx("textarea", { rows: 4, placeholder: "Describe the issue in detail, including error codes, system behaviors, or symptoms...", value: problemDescription, onChange: (e) => setProblemDescription(e.target.value), className: "w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-text font-body outline-none" })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("label", { className: "text-sm font-medium font-display text-muted", children: "Upload Photos (Optional)" }), _jsxs("div", { className: "border border-dashed border-border hover:border-primary/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer relative bg-[#111827]/30", children: [_jsx("input", { type: "file", multiple: true, accept: "image/*", onChange: handleFileChange, className: "absolute inset-0 opacity-0 cursor-pointer w-full h-full" }), _jsx(FileImage, { className: "w-8 h-8 text-muted mb-2" }), _jsx("span", { className: "text-xs text-muted font-body", children: "Drag files here or click to browse" })] }), images.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: images.map((img, idx) => (_jsx("div", { className: "relative w-16 h-16 rounded border border-border overflow-hidden", children: _jsx("img", { src: img, alt: "upload", className: "w-full h-full object-cover" }) }, idx))) }))] }), _jsxs("div", { className: "flex justify-between items-center mt-4", children: [_jsx(Button, { variant: "outline", onClick: handleBack, children: "Back" }), _jsx(Button, { variant: "primary", onClick: handleNext, children: "Proceed to Schedule" })] })] })), step === 3 && (_jsx("form", { onSubmit: handleSubmit, children: _jsxs(Card, { className: "flex flex-col gap-6", glowColor: "cyan", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-black font-display text-text flex items-center gap-2", children: [_jsx(Calendar, { size: 24, className: "text-primary" }), "3. Customer Coordinates & Date"] }), _jsx("p", { className: "text-sm text-muted font-body mt-1", children: "Enter scheduling date and client details to register the booking." })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { label: "Full Name *", placeholder: "John Doe", value: name, onChange: (e) => setName(e.target.value), required: true }), _jsx(Input, { label: "Phone Number *", placeholder: "5551234567", value: phone, onChange: (e) => setPhone(e.target.value), required: true })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { label: "Email Address *", type: "email", placeholder: "john@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx(Input, { label: "Company Name (Optional)", placeholder: "Acme Corp", value: company, onChange: (e) => setCompany(e.target.value) })] }), type !== "remote" && (_jsx(Input, { label: "On-Site Address *", placeholder: "Street address, Suite, City, ZIP code", value: address, onChange: (e) => setAddress(e.target.value), required: true })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Input, { label: "Preferred Date *", type: "date", value: preferredDate, onChange: (e) => setPreferredDate(e.target.value), required: true }), _jsx(Input, { label: "Preferred Time *", type: "time", value: preferredTime, onChange: (e) => setPreferredTime(e.target.value), required: true })] }), _jsxs("div", { className: "flex justify-between items-center mt-4", children: [_jsx(Button, { variant: "outline", type: "button", onClick: handleBack, children: "Back" }), _jsx(Button, { variant: "primary", type: "submit", isLoading: bookingMutation.isPending, children: "Submit Booking" })] })] }) })), step === 4 && (_jsxs(Card, { className: "text-center p-8 md:p-12 flex flex-col items-center gap-6", glowColor: "cyan", children: [_jsx("div", { className: "p-4 bg-success/15 rounded-full border border-success/30 text-success", children: _jsx(CheckCircle2, { size: 48, className: "animate-bounce" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-black font-display text-text", children: "Booking Submitted!" }), _jsx("p", { className: "text-sm text-muted font-body mt-2 max-w-md mx-auto leading-relaxed", children: "Your support ticket has been opened. An IT specialist will review the details and contact you shortly." })] }), _jsxs("div", { className: "border border-border/50 bg-[#111827]/40 rounded-xl p-4 w-full max-w-sm flex flex-col gap-2.5 text-sm font-body text-left", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted", children: "Service Class:" }), _jsx("span", { className: "font-semibold text-text uppercase", children: type })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted", children: "OS Platform:" }), _jsx("span", { className: "font-semibold text-text", children: operatingSystem })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted", children: "Scheduled Date:" }), _jsx("span", { className: "font-semibold text-text", children: preferredDate })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted", children: "Scheduled Time:" }), _jsx("span", { className: "font-semibold text-text", children: preferredTime })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2", children: [_jsx(Button, { variant: "primary", className: "flex-1", onClick: () => navigate("/customer"), children: "Go to Customer Portal" }), _jsx(Button, { variant: "outline", className: "flex-1", onClick: () => navigate("/"), children: "Return Home" })] })] }))] }));
};
//# sourceMappingURL=BookService.js.map