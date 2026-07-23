import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button, Card, Input } from "@remotefix/ui";

export const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    
    // Simulate submission
    console.log("Contact form submitted:", { name, email, subject, message });
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black font-display text-text">
          Get in Touch
        </h1>
        <p className="text-muted font-body mt-4 max-w-md mx-auto leading-relaxed">
          Need a custom enterprise quote, or have a billing inquiry? Reach out and we will respond within 4 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact details */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card className="flex flex-col gap-6" glowColor="none">
            <h3 className="text-xl font-bold font-display text-text border-b border-border/40 pb-3">
              Coordinates
            </h3>
            
            <div className="flex items-start gap-3.5 font-body text-sm text-muted">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="block font-semibold text-text">Direct Phone</span>
                <span className="block mt-0.5">+1 (800) 555-RFIX</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 font-body text-sm text-muted">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="block font-semibold text-text">General Inquiries</span>
                <span className="block mt-0.5">support@remotefix.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 font-body text-sm text-muted">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="block font-semibold text-text">Headquarters</span>
                <span className="block mt-0.5 leading-relaxed">
                  100 Cyber Ridge Plaza,<br />
                  Suite 404, Tech Valley, CA 94025
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <Card className="text-center py-12 flex flex-col items-center gap-4" glowColor="cyan">
              <div className="p-3 bg-success/10 text-success border border-success/30 rounded-full">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold font-display text-text">Message Received!</h2>
              <p className="text-sm text-muted font-body leading-relaxed max-w-sm">
                Thank you for contacting RemoteFix. A support manager has been assigned to your ticket and will email you shortly.
              </p>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card className="flex flex-col gap-6" glowColor="cyan">
                <h3 className="text-xl font-bold font-display text-text">
                  Dispatch Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Subject"
                  placeholder="Billing / Corporate AMC / Feedback"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium font-display text-muted">Message</label>
                  <textarea
                    rows={5}
                    placeholder="What would you like to discuss with our IT management team?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-text font-body outline-none"
                  />
                </div>

                <Button variant="primary" type="submit" className="w-full sm:w-auto flex items-center gap-2 justify-center ml-auto">
                  <Send size={16} />
                  Send Message
                </Button>
              </Card>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
