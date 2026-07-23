import React from "react";
import { Link } from "react-router";
import { Shield, Github, Twitter, Linkedin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#030712] border-t border-[#374151]/40 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
          {/* Logo & Info */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-text">
                Remote<span className="text-primary">Fix</span>
              </span>
            </Link>
            <p className="text-sm text-muted font-body leading-relaxed max-w-xs">
              Enterprise-grade IT support, custom networking, virus removals, and storage setups. Secure remote repairs and expert on-site consultations.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold font-display text-text uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-3 font-body text-sm">
              <li>
                <Link to="/services" className="text-muted hover:text-text transition-colors">
                  Services List
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted hover:text-text transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-muted hover:text-text transition-colors font-medium text-primary">
                  Book A Service
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted hover:text-text transition-colors">
                  FAQ Helpdesk
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold font-display text-text uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-3 font-body text-sm">
              <li>
                <Link to="/blog" className="text-muted hover:text-text transition-colors">
                  Blog & Articles
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-text transition-colors">
                  Knowledge Base
                </a>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-text transition-colors">
                  System Status
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold font-display text-text uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-3 font-body text-sm">
              <li>
                <Link to="/privacy" className="text-muted hover:text-text transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted hover:text-text transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom banner */}
        <div className="border-t border-[#374151]/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-body text-xs text-muted">
          <span>&copy; {new Date().getFullYear()} RemoteFix IT Services LLC. All rights reserved.</span>
          <div className="flex gap-6">
            <span>WCAG AA Accessible</span>
            <span>Edge Caching Enabled</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
