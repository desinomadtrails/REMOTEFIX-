import React from "react";
import { Link } from "react-router";
import { ShieldAlert, ArrowLeft, Home as HomeIcon } from "lucide-react";
import { Button, Card } from "@remotefix/ui";
import { SEO } from "../components/SEO.js";

export const NotFound: React.FC = () => {
  return (
    <>
      <SEO
        title="404 - Page Not Found | RemoteFix"
        description="The requested page could not be found on RemoteFix IT Services platform."
      />
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full text-center p-8 border-[#374151]/50 bg-[#0B0F17]/80 backdrop-blur-md">
          <div className="mx-auto w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-6 border border-danger/20">
            <ShieldAlert size={36} />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-text mb-3">
            404 - Page Not Found
          </h1>
          <p className="text-muted font-body text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button variant="primary" className="w-full sm:w-auto flex items-center justify-center gap-2">
                <HomeIcon size={16} />
                Return to Homepage
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2">
                <ArrowLeft size={16} />
                Contact Support
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
};
