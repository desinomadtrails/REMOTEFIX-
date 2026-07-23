import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ShieldAlert, Cpu, Calendar, CheckCircle2, User, FileImage } from "lucide-react";
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

export const BookService: React.FC = () => {
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
  const [images, setImages] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize values from Query parameters if present
  useEffect(() => {
    const qType = searchParams.get("type");
    const qService = searchParams.get("serviceId");
    if (qType) setType(qType);
    if (qService) setServiceId(qService);

    // Try to pre-fill from logged-in user profile
    const storedUser = localStorage.getItem("rf_user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setName(userObj.fullName);
        setEmail(userObj.email);
      } catch {}
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
    ...(servicesData || []).map((s: any) => ({
      label: `${s.name} - $${s.price}`,
      value: s.id,
    })),
  ];

  // Handle file uploads -> Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit mutation
  const bookingMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.createBooking(payload);
    },
    onSuccess: (data: any) => {
      setStep(4); // Success step
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to submit booking request. Please check fields.");
    },
  });

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
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

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Step indicators */}
      {step < 4 && (
        <div className="flex justify-between items-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold border transition-all ${
                  step === s
                    ? "bg-primary text-[#030712] border-primary shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                    : step > s
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "bg-surface text-muted border-border"
                }`}
              >
                {s}
              </div>
              <span className={`text-xs font-semibold font-display hidden sm:inline ${step === s ? "text-text" : "text-muted"}`}>
                {s === 1 ? "Service Class" : s === 2 ? "System & Issue" : "Contact & Schedule"}
              </span>
            </div>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: SERVICE TYPE */}
      {step === 1 && (
        <Card className="flex flex-col gap-6" glowColor="cyan">
          <div>
            <h2 className="text-2xl font-black font-display text-text flex items-center gap-2">
              <Cpu size={24} className="text-primary" />
              1. Choose Support Category
            </h2>
            <p className="text-sm text-muted font-body mt-1">
              Select how you would like our tech engineers to service your systems.
            </p>
          </div>

          <Select
            label="Service Mode"
            options={SUPPORT_TYPES}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />

          <Select
            label="IT Catalog Item (Optional)"
            options={servicesOptions}
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          />

          <Button variant="primary" className="ml-auto w-full sm:w-auto" onClick={handleNext}>
            Proceed to Details
          </Button>
        </Card>
      )}

      {/* STEP 2: SYSTEM & PROBLEM */}
      {step === 2 && (
        <Card className="flex flex-col gap-6" glowColor="cyan">
          <div>
            <h2 className="text-2xl font-black font-display text-text flex items-center gap-2">
              <ShieldAlert size={24} className="text-primary" />
              2. System Details & Faults
            </h2>
            <p className="text-sm text-muted font-body mt-1">
              Provide context on the affected system and upload pictures if applicable.
            </p>
          </div>

          <Select
            label="Operating System"
            options={OS_OPTIONS}
            value={operatingSystem}
            onChange={(e) => setOperatingSystem(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium font-display text-muted">Problem Description</label>
            <textarea
              rows={4}
              placeholder="Describe the issue in detail, including error codes, system behaviors, or symptoms..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-text font-body outline-none"
            />
          </div>

          {/* Photo uploader */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium font-display text-muted">Upload Photos (Optional)</label>
            <div className="border border-dashed border-border hover:border-primary/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer relative bg-[#111827]/30">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileImage className="w-8 h-8 text-muted mb-2" />
              <span className="text-xs text-muted font-body">Drag files here or click to browse</span>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded border border-border overflow-hidden">
                    <img src={img} alt="upload" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Proceed to Schedule
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: CONTACT & SCHEDULE */}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <Card className="flex flex-col gap-6" glowColor="cyan">
            <div>
              <h2 className="text-2xl font-black font-display text-text flex items-center gap-2">
                <Calendar size={24} className="text-primary" />
                3. Customer Coordinates & Date
              </h2>
              <p className="text-sm text-muted font-body mt-1">
                Enter scheduling date and client details to register the booking.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Phone Number *"
                placeholder="5551234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address *"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Company Name (Optional)"
                placeholder="Acme Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* Address is conditional based on Support Type */}
            {type !== "remote" && (
              <Input
                label="On-Site Address *"
                placeholder="Street address, Suite, City, ZIP code"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Preferred Date *"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
              />
              <Input
                label="Preferred Time *"
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" type="button" onClick={handleBack}>
                Back
              </Button>
              <Button variant="primary" type="submit" isLoading={bookingMutation.isPending}>
                Submit Booking
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <Card className="text-center p-8 md:p-12 flex flex-col items-center gap-6" glowColor="cyan">
          <div className="p-4 bg-success/15 rounded-full border border-success/30 text-success">
            <CheckCircle2 size={48} className="animate-bounce" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-display text-text">Booking Submitted!</h1>
            <p className="text-sm text-muted font-body mt-2 max-w-md mx-auto leading-relaxed">
              Your support ticket has been opened. An IT specialist will review the details and contact you shortly.
            </p>
          </div>

          <div className="border border-border/50 bg-[#111827]/40 rounded-xl p-4 w-full max-w-sm flex flex-col gap-2.5 text-sm font-body text-left">
            <div className="flex justify-between">
              <span className="text-muted">Service Class:</span>
              <span className="font-semibold text-text uppercase">{type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">OS Platform:</span>
              <span className="font-semibold text-text">{operatingSystem}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Scheduled Date:</span>
              <span className="font-semibold text-text">{preferredDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Scheduled Time:</span>
              <span className="font-semibold text-text">{preferredTime}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
            <Button variant="primary" className="flex-1" onClick={() => navigate("/customer")}>
              Go to Customer Portal
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
              Return Home
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
