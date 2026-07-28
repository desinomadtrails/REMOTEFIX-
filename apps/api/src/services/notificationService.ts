import { sendEmail, EmailTemplates } from "./emailService.js";
import { sendSMS } from "./smsService.js";

export interface BookingNotificationOptions {
  name: string;
  email: string;
  phone: string;
  ticketId: string;
  trackingUrl: string;
}

export async function notifyBookingCreated(opts: BookingNotificationOptions, env?: any) {
  // 1. Send Email
  const emailData = EmailTemplates.ticketCreated(opts.name, opts.ticketId, opts.trackingUrl);
  const emailRes = await sendEmail({ to: opts.email, ...emailData }, env);

  // 2. Send SMS
  const smsBody = `RemoteFix: Your IT service request ${opts.ticketId} is registered. Track status live: ${opts.trackingUrl}`;
  const smsRes = await sendSMS({ to: opts.phone, body: smsBody }, env);

  return { emailRes, smsRes };
}

export async function notifyStatusChanged(
  opts: { name: string; email: string; phone: string; ticketId: string; status: string; remarks?: string },
  env?: any
) {
  const text = `RemoteFix Update: Your ticket ${opts.ticketId} status changed to ${opts.status.toUpperCase()}.${
    opts.remarks ? ` Remarks: ${opts.remarks}` : ""
  }`;

  const emailRes = await sendEmail(
    {
      to: opts.email,
      subject: `Status Update for Ticket ${opts.ticketId}: ${opts.status.toUpperCase()}`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; background: #030712; color: #f9fafb;">
        <h3 style="color: #00E5FF;">Ticket Status Updated</h3>
        <p>Hello ${opts.name}, your request status for <strong>${opts.ticketId}</strong> is now: <span style="color: #8B5CF6; font-weight: bold;">${opts.status.toUpperCase()}</span>.</p>
        ${opts.remarks ? `<p><strong>Technician Remarks:</strong> ${opts.remarks}</p>` : ""}
      </div>`,
    },
    env
  );

  const smsRes = await sendSMS({ to: opts.phone, body: text }, env);

  return { emailRes, smsRes };
}
