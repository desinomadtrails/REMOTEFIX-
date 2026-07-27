import { z } from "zod";

// ==========================================
// ENUMS & CONSTANTS
// ==========================================

export const USER_ROLES = ["customer", "engineer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

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

// ==========================================
// ZOD SCHEMAS & TYPES
// ==========================================

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

export interface User {
  id: string;
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
  userId: string | null;
  action: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
  user?: User;
}
