import React from "react";
import { Briefcase, MapPin, Clock, Compass, DollarSign, Award } from "lucide-react";
import { Button, Card, GlowDivider } from "@remotefix/ui";
import { useNavigate } from "react-router";

export const Careers: React.FC = () => {
  const navigate = useNavigate();

  const jobs = [
    {
      title: "Lead Systems Administrator",
      type: "Full-Time",
      location: "Hybrid (Azure City HQ)",
      salary: "$110k - $130k / year",
      desc: "Manage server networks, active directory structures, cloud migrations, and lead escalations.",
    },
    {
      title: "Cyber Security Incident Responder",
      type: "Full-Time",
      location: "Remote (USA/Canada)",
      salary: "$120k - $145k / year",
      desc: "Investigate security alerts, audit customer firewalls, quarantine malware payloads, and draft post-mortems.",
    },
    {
      title: "Field Systems Technician",
      type: "Contract / Freelance",
      location: "On-Site (Multiple Locations)",
      salary: "$45 - $60 / hour",
      desc: "On-site dispatching for device configurations, Wi-Fi dead-zone audits, and hardware deployments.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 font-body">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
          <Award className="w-3.5 h-3.5" />
          Careers at RemoteFix
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-text">
          Join the Fleet of IT Specialists
        </h1>
        <p className="text-muted mt-4 max-w-xl mx-auto leading-relaxed text-sm">
          RemoteFix is expanding. We are seeking certified professionals with active CCNA, CISSP, or M365 credentials.
        </p>
      </div>

      {/* Perks Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        <Card className="flex flex-col gap-3 p-5" glowColor="none">
          <Compass className="w-6 h-6 text-primary" />
          <h3 className="text-sm font-bold font-display text-text">Continuous Training</h3>
          <p className="text-xs text-muted leading-relaxed">
            We sponsor active certification updates, training courses, and tech lab subscriptions.
          </p>
        </Card>

        <Card className="flex flex-col gap-3 p-5" glowColor="none">
          <DollarSign className="w-6 h-6 text-primary" />
          <h3 className="text-sm font-bold font-display text-text">Premium Compensation</h3>
          <p className="text-xs text-muted leading-relaxed">
            Competitive baseline salaries, emergency call-out bonuses, and medical benefits.
          </p>
        </Card>

        <Card className="flex flex-col gap-3 p-5" glowColor="none">
          <Briefcase className="w-6 h-6 text-primary" />
          <h3 className="text-sm font-bold font-display text-text">Next-Gen Tooling</h3>
          <p className="text-xs text-muted leading-relaxed">
            Get top-tier hardware configurations and secure enterprise diagnostic licenses.
          </p>
        </Card>
      </div>

      <GlowDivider color="gradient" className="my-12" />

      {/* Active Postings */}
      <div>
        <h2 className="text-2xl font-bold font-display text-text mb-8">Open Roles</h2>
        
        <div className="flex flex-col gap-6">
          {jobs.map((job, idx) => (
            <Card key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6" glowColor="cyan">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold font-display text-text">{job.title}</h3>
                <div className="flex flex-wrap gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign size={14} className="text-primary" />
                    {job.salary}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed mt-2 max-w-2xl">{job.desc}</p>
              </div>

              <Button variant="cyber" size="sm" onClick={() => navigate("/contact")} className="shrink-0 w-full md:w-auto">
                Apply Now
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
