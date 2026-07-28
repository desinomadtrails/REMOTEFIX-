import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { User, Cpu, Calendar, CheckCircle2, FileImage, Shield } from "lucide-react";
import { Button, Card, Input, Select } from "@remotefix/ui";
import { api } from "../services/api.js";
import { SEO } from "../components/SEO.js";

const DEVICE_TYPES = [
  { value: "Laptop", label: "Laptop" },
  { value: "Desktop", label: "Desktop" },
  { value: "Printer", label: "Printer" },
  { value: "CCTV", label: "CCTV Security Camera" },
  { value: "Networking", label: "Networking Equipment" },
  { value: "Router", label: "Router/Switch" },
  { value: "Server", label: "Enterprise Server" },
  { value: "Other", label: "Other Device" },
];

const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal (Regular response)" },
  { value: "high", label: "High (Same-day service)" },
  { value: "emergency", label: "Emergency SLA (Within 15 minutes)" },
];

export const BookService: React.FC = () => {
  const navigate = useNavigate();

  // Wizard step state
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Customer Details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");

  // Step 2: Device Details
  const [deviceType, setDeviceType] = useState("Laptop");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  // Step 3: Issue Details & Uploads
  const [problemDescription, setProblemDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  // Handle image upload converting to Base64
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

  // Submit Mutation
  const bookingMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.createServiceRequest(payload);
    },
    onSuccess: (data: any) => {
      navigate(`/book/success?ticketId=${data.ticketId}&phone=${encodeURIComponent(phone)}`);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to submit request. Please check your network and fields.");
    },
  });

  const handleNext = () => {
    if (step === 1) {
      if (!fullName || !phone || !email || !address || !city || !state || !pinCode) {
        setErrorMsg("Please fill out all customer details before proceeding.");
        return;
      }
      if (phone.length < 10) {
        setErrorMsg("Please enter a valid 10-digit mobile number.");
        return;
      }
      setErrorMsg("");
      setStep(2);
    } else if (step === 2) {
      if (!brand || !model) {
        setErrorMsg("Please specify the brand and model of your device.");
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
    if (!problemDescription || !preferredDate || !preferredTime) {
      setErrorMsg("Please fill in problem description and preferred appointment slot.");
      return;
    }
    if (problemDescription.length < 10) {
      setErrorMsg("Problem description must be at least 10 characters.");
      return;
    }
    if (!consent) {
      setErrorMsg("You must agree to the Terms & Conditions to submit your request.");
      return;
    }

    setErrorMsg("");
    bookingMutation.mutate({
      fullName,
      phone,
      email,
      address,
      city,
      state,
      pinCode,
      deviceType,
      brand,
      model,
      serialNumber: serialNumber || undefined,
      problemDescription,
      priority,
      preferredDate,
      preferredTime,
      images,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 font-body">
      <SEO
        title="Guest Booking Wizard | RemoteFix IT Services"
        description="Book on-site or remote IT support in under 2 minutes. No account creation required. Instant Ticket ID generated and saved to Azure SQL."
        canonicalUrl="https://remotefix.com/book"
      />

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-3 font-display">
          <Shield className="w-3.5 h-3.5" />
          Zero Friction Guest Booking
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-text">
          Book IT Service
        </h1>
        <p className="text-xs text-muted font-body mt-1">
          No sign-up mandatory. Describe your issue and track live milestones instantly.
        </p>
      </div>

      {/* SaaS Wizard Step Header */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/40 -translate-y-1/2 z-0" />
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 relative z-10 bg-[#030712] px-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold border transition-all ${
                step === s
                  ? "bg-primary text-[#030712] border-primary shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  : step > s
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-surface text-muted border-border"
              }`}
            >
              {s}
            </div>
            <span className={`text-xs font-semibold font-display hidden sm:inline ${step === s ? "text-text" : "text-muted"}`}>
              {s === 1 ? "Customer Info" : s === 2 ? "Device Specs" : "Issue & Schedule"}
            </span>
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-xs rounded-lg p-4 mb-6 font-body">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: CUSTOMER DETAILS */}
      {step === 1 && (
        <Card className="flex flex-col gap-6" glowColor="cyan">
          <div>
            <h2 className="text-2xl font-black font-display text-text flex items-center gap-2">
              <User size={24} className="text-primary" />
              1. Contact Information
            </h2>
            <p className="text-xs text-muted font-body mt-1">
              Enter your coordinates where our support technician can contact you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Mobile Number *"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="Email Address *"
            type="email"
            placeholder="john.doe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Street Address *"
            placeholder="Flat, House no., Building, Street Name"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City *"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              label="State *"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
            <Input
              label="PIN Code *"
              placeholder="PIN"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              required
            />
          </div>

          <Button variant="primary" className="ml-auto w-full sm:w-auto" onClick={handleNext}>
            Proceed to Device Details
          </Button>
        </Card>
      )}

      {/* STEP 2: DEVICE DETAILS */}
      {step === 2 && (
        <Card className="flex flex-col gap-6" glowColor="cyan">
          <div>
            <h2 className="text-2xl font-black font-display text-text flex items-center gap-2">
              <Cpu size={24} className="text-primary" />
              2. Device Configuration
            </h2>
            <p className="text-xs text-muted font-body mt-1">
              Specify the type and brand of the device needing service.
            </p>
          </div>

          <Select
            label="Device Type *"
            options={DEVICE_TYPES}
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand *"
              placeholder="e.g. Dell, Apple, HP"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
            <Input
              label="Model *"
              placeholder="e.g. Inspiron 15, MacBook Pro"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>

          <Input
            label="Serial Number (Optional)"
            placeholder="e.g. CN-0XYZ123"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />

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

      {/* STEP 3: SCHEDULE, UPLOADS & CONSENT */}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <Card className="flex flex-col gap-6" glowColor="cyan">
            <div>
              <h2 className="text-2xl font-black font-display text-text flex items-center gap-2">
                <Calendar size={24} className="text-primary" />
                3. Issue Details &amp; Schedule
              </h2>
              <p className="text-xs text-muted font-body mt-1">
                Describe the problem and select your preferred visit time slot.
              </p>
            </div>

            <Select
              label="Service Priority *"
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold font-display text-muted">Problem Description *</label>
              <textarea
                rows={4}
                placeholder="Describe the issue in detail. Include any error codes, symptoms, or what happened right before the failure..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-text text-xs font-body outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Preferred Visit Date *"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
              />
              <Input
                label="Preferred Time Slot *"
                type="text"
                placeholder="e.g. 10:00 AM - 12:00 PM"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                required
              />
            </div>

            {/* Photo uploader */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold font-display text-muted">Upload Device Images or Screenshots (Optional)</label>
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
                      <img src={img} alt="upload preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-3 mt-2">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded bg-[#111827]/60 border-border text-primary focus:ring-primary focus:ring-opacity-20 cursor-pointer"
              />
              <label htmlFor="consent" className="text-xs text-muted font-body leading-relaxed select-none cursor-pointer">
                I agree to the RemoteFix Terms &amp; Conditions and authorize diagnostics.
              </label>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" type="button" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={bookingMutation.isPending}
                glow
              >
                Submit Request
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};
