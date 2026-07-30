import { z } from "zod";

// ==========================================
// ENUMS & CONSTANTS
// ==========================================

export const USER_ROLES = ["customer", "engineer", "admin", "super_admin", "org_admin", "manager", "dispatcher", "technician", "finance", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SYSTEM_ROLES = ["super_admin", "org_admin", "manager", "dispatcher", "technician", "finance", "viewer"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const USER_STATUSES = ["active", "suspended", "pending"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ENGINEER_STATUSES = ["available", "busy", "offline"] as const;
export type EngineerStatus = (typeof ENGINEER_STATUSES)[number];

export const BOOKING_TYPES = ["remote", "onsite", "emergency", "amc", "consultation"] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

export const BOOKING_STATUSES = ["pending", "assigned", "in_progress", "completed", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const INVOICE_STATUSES = ["unpaid", "paid", "refunded"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_STATUSES = ["success", "failed", "pending"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const ORG_TIERS = ["startup", "smb", "msp", "enterprise"] as const;
export type OrgTier = (typeof ORG_TIERS)[number];

// ==========================================
// ZOD SCHEMAS & TYPES
// ==========================================

// Organization & Department Schemas (Multi-Tenant)
export const OrganizationCreateSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().min(2, "Organization slug is required"),
  domain: z.string().optional(),
  tier: z.enum(ORG_TIERS).default("enterprise"),
  maxEndpoints: z.number().int().min(1).default(50),
  logoUrl: z.string().optional(),
});
export const AssetCreateSchema = z.object({
  organizationId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  name: z.string().min(2, "Asset name is required"),
  type: z.enum(["Laptop", "Desktop", "Server", "Router", "CCTV", "Printer", "Other"]),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  warrantyExpiryDate: z.string().optional(),
  notes: z.string().optional(),
});
export type AssetCreateInput = z.infer<typeof AssetCreateSchema>;

export const SlaPolicyCreateSchema = z.object({
  name: z.string().min(2, "SLA policy name is required"),
  priority: z.enum(["urgent", "high", "medium", "low", "normal"]),
  responseBufferMinutes: z.number().int().min(1, "Response target must be at least 1 minute"),
  resolutionBufferMinutes: z.number().int().min(1, "Resolution target must be at least 1 minute"),
  escalationEmail: z.string().email().optional(),
  isDefault: z.boolean().default(false),
});
export type SlaPolicyCreateInput = z.infer<typeof SlaPolicyCreateSchema>;

export const AmcContractCreateSchema = z.object({
  organizationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  title: z.string().min(3, "Contract title is required"),
  deviceCount: z.number().int().min(1, "Device count must be at least 1"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start Date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End Date must be YYYY-MM-DD"),
  contractAmount: z.number().min(0, "Contract amount cannot be negative"),
});
export type AmcContractCreateInput = z.infer<typeof AmcContractCreateSchema>;

export const DepartmentCreateSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  name: z.string().min(2, "Department name is required"),
  code: z.string().optional(),
  headUserId: z.string().uuid().optional(),
});
export type DepartmentCreateInput = z.infer<typeof DepartmentCreateSchema>;

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  companyName: z.string().optional(),
  billingAddress: z.string().optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

// Service Schemas
export const ServiceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Service name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  price: z.number().min(0, "Price cannot be negative"),
  estimatedDurationMinutes: z.number().int().min(1, "Duration must be at least 1 minute"),
  isActive: z.boolean().default(true),
});
export type Service = z.infer<typeof ServiceSchema>;

// Booking Schemas
export const BookingCreateSchema = z.object({
  type: z.enum(BOOKING_TYPES),
  serviceId: z.string().uuid().optional(),
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email"),
  company: z.string().optional(),
  address: z.string().optional(), // optional for remote support
  problemDescription: z.string().min(10, "Please describe the problem in detail (min 10 chars)"),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  operatingSystem: z.string().min(2, "Operating system is required"),
  images: z.array(z.string()).optional(), // Base64 strings or URLs
});
export type BookingCreateInput = z.infer<typeof BookingCreateSchema>;

export const BookingUpdateStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
  engineerId: z.string().uuid().optional(),
  remarks: z.string().optional(),
  partsUsed: z.string().optional(),
});

// Ticket Schemas
export const TicketCreateSchema = z.object({
  bookingId: z.string().uuid().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(TICKET_PRIORITIES).default("medium"),
});
export type TicketCreateInput = z.infer<typeof TicketCreateSchema>;

export const TicketMessageCreateSchema = z.object({
  message: z.string().min(1, "Message content cannot be empty"),
});
export type TicketMessageCreateInput = z.infer<typeof TicketMessageCreateSchema>;

// Invoice & Payment Schemas
export const InvoiceCreateSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().min(0, "Amount must be a positive number"),
});
export type InvoiceCreateInput = z.infer<typeof InvoiceCreateSchema>;

export const PaymentCreateSchema = z.object({
  invoiceId: z.string().uuid(),
  paymentMethod: z.string().min(2, "Payment method is required"),
  transactionId: z.string().min(2, "Transaction ID is required"),
  amount: z.number().min(0),
});
export type PaymentCreateInput = z.infer<typeof PaymentCreateSchema>;

export const ReviewCreateSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});
export type ReviewCreateInput = z.infer<typeof ReviewCreateSchema>;

export const ServiceRequestCreateSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email"),
  companyName: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pinCode: z.string().min(5, "PIN Code is required"),
  deviceType: z.string().min(2, "Device Type is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().optional(),
  problemDescription: z.string().min(10, "Problem description must be at least 10 characters"),
  priority: z.enum(["normal", "high", "emergency"]).default("normal"),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  preferredTime: z.string().min(2, "Preferred Time Slot is required"),
  images: z.array(z.string()).optional(), // Base64 strings
});
export type ServiceRequestCreateInput = z.infer<typeof ServiceRequestCreateSchema>;

// FAQ & Blog Schemas
export const FaqSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(5, "Question is too short"),
  answer: z.string().min(10, "Answer is too short"),
  category: z.string().min(2, "Category is required"),
  isActive: z.boolean().default(true),
});
export type Faq = z.infer<typeof FaqSchema>;

export const BlogPostSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(5, "Title is too short"),
  slug: z.string().min(2, "Slug is required"),
  content: z.string().min(20, "Content must be longer"),
  isPublished: z.boolean().default(false),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

// ==========================================
// SYSTEM MODELS
// ==========================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  tier: OrgTier;
  maxEndpoints: number;
  logoUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string | null;
  headUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId?: string | null;
  departmentId?: string | null;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  googleId: string | null;
  microsoftId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  organizationId?: string | null;
  phone: string;
  companyName: string | null;
  billingAddress: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Engineer {
  id: string;
  userId: string;
  organizationId?: string | null;
  phone: string;
  bio: string | null;
  specialities: string[];
  status: EngineerStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Booking {
  id: string;
  organizationId?: string | null;
  departmentId?: string | null;
  customerId: string;
  serviceId: string | null;
  type: BookingType;
  status: BookingStatus;
  name: string;
  phone: string;
  email: string;
  company: string | null;
  address: string | null;
  problemDescription: string;
  preferredDate: string;
  preferredTime: string;
  operatingSystem: string;
  engineerId: string | null;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  engineer?: Engineer;
  images?: string[];
}

export interface Ticket {
  id: string;
  organizationId?: string | null;
  departmentId?: string | null;
  bookingId: string | null;
  customerId: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  engineerId: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  engineer?: Engineer;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender?: User;
}

export interface Invoice {
  id: string;
  organizationId?: string | null;
  bookingId: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: Booking;
}

export interface Payment {
  id: string;
  invoiceId: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  booking?: Booking;
}

export interface AuditLog {
  id: string;
  organizationId?: string | null;
  userId: string | null;
  action: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
  user?: User;
}

export interface Asset {
  id: string;
  organizationId?: string | null;
  departmentId?: string | null;
  assetTag: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  serialNumber?: string | null;
  qrCodeUrl?: string | null;
  status: string;
  purchaseDate?: string | null;
  warrantyExpiryDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SlaPolicy {
  id: string;
  name: string;
  priority: string;
  responseBufferMinutes: number;
  resolutionBufferMinutes: number;
  escalationEmail?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AmcContract {
  id: string;
  organizationId?: string | null;
  customerId?: string | null;
  contractNumber: string;
  title: string;
  deviceCount: number;
  startDate: string;
  endDate: string;
  contractAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  organizationId?: string | null;
  name: string;
  displayName: string;
  description?: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  roleId: string;
  resource: string;
  action: string;
  createdAt: string;
}

export interface RmmEndpoint {
  id: string;
  organizationId?: string | null;
  assetId?: string | null;
  hostname: string;
  osVersion: string;
  ipAddress?: string | null;
  macAddress?: string | null;
  cpuUsagePercent: number;
  ramUsagePercent: number;
  diskUsagePercent: number;
  status: "online" | "offline" | "warning" | "critical";
  lastHeartbeatAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RmmScript {
  id: string;
  name: string;
  category: string;
  shellType: "powershell" | "bash" | "cmd";
  scriptContent: string;
  description?: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SsoProvider {
  id: string;
  organizationId?: string | null;
  providerType: "okta" | "azure_ad" | "google_workspace" | "custom_saml";
  issuerUrl: string;
  ssoUrl: string;
  certificatePem?: string | null;
  domain?: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  organizationId?: string | null;
  departmentId?: string | null;
  userId?: string | null;
  action: string;
  actionType?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  oldValuesJson?: string | null;
  newValuesJson?: string | null;
  reason?: string | null;
  status: string;
  details: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  organizationId?: string | null;
  eventKey: string;
  channel: "email" | "in_app" | "push" | "webhook";
  subject: string;
  bodyTemplate: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueueItem {
  id: string;
  organizationId?: string | null;
  userId?: string | null;
  eventKey: string;
  channel: "email" | "in_app" | "push" | "webhook";
  recipient: string;
  title: string;
  message: string;
  status: "pending" | "sent" | "failed";
  retryCount: number;
  lastError?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  isEnabled: boolean;
  targetOrgId?: string | null;
  rolloutPercentage: number;
  scheduledEnableAt?: string | null;
  scheduledDisableAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseBackup {
  id: string;
  organizationId?: string | null;
  filename: string;
  backupType: "full_database" | "tenant_export" | "scheduled_cron";
  sizeBytes: number;
  checksumSha256?: string | null;
  isEncrypted: boolean;
  status: "completed" | "failed" | "restoring";
  createdAt: string;
  updatedAt: string;
}

export interface TrackingToken {
  id: string;
  bookingId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  userId?: string | null;
  email: string;
  companyName?: string | null;
  customerName: string;
  phoneNumber?: string | null;
  preferredContactMethod: "email" | "sms" | "phone" | "whatsapp";
  savedDevicesJson?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OtpCode {
  id: string;
  email: string;
  code: string;
  token: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

export interface AssetServiceHistory {
  id: string;
  assetId: string;
  organizationId?: string | null;
  eventType: "installation" | "repair" | "maintenance" | "parts_replaced" | "software" | "firmware" | "warranty_claim";
  title: string;
  description?: string | null;
  performedBy?: string | null;
  partsReplaced?: string | null;
  softwareInstalled?: string | null;
  createdAt: string;
}

export interface CustomerAssetDocument {
  id: string;
  assetId: string;
  customerId?: string | null;
  documentType: "invoice" | "warranty" | "amc_contract" | "report" | "photo";
  documentName: string;
  documentUrl: string;
  createdAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  assetId: string;
  organizationId?: string | null;
  serviceName: string;
  scheduledDate: string;
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  assignedEngineerId?: string | null;
  createdAt: string;
  updatedAt: string;
}
