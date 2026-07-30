import { mssqlTable, varchar, text, int, decimal, datetime2, bit, index } from "drizzle-orm/mssql-core";
import { sql } from "drizzle-orm";

// ==========================================
// 0. ORGANIZATIONS TABLE (Multi-Tenant)
// ==========================================
export const organizations = mssqlTable("organizations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }),
  tier: varchar("tier", { length: 50 }).notNull().default("enterprise"), // 'startup' | 'smb' | 'msp' | 'enterprise'
  maxEndpoints: int("max_endpoints").notNull().default(50),
  logoUrl: varchar("logo_url", { length: 500 }),
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active' | 'suspended'
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_orgs_slug").on(table.slug),
  index("idx_orgs_status").on(table.status),
]);

// ==========================================
// 0.1 DEPARTMENTS TABLE (Multi-Tenant)
// ==========================================
export const departments = mssqlTable("departments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 })
    .notNull()
    .references(() => organizations.id),
  name: varchar("name", { length: 150 }).notNull(),
  code: varchar("code", { length: 50 }),
  headUserId: varchar("head_user_id", { length: 36 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_depts_org_id").on(table.organizationId),
]);

// ==========================================
// 0.2 ROLES TABLE (Database-Driven RBAC)
// ==========================================
export const roles = mssqlTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  name: varchar("name", { length: 50 }).notNull(), // 'super_admin' | 'org_admin' | 'manager' | 'dispatcher' | 'technician' | 'finance' | 'viewer'
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  isSystem: bit("is_system").notNull().default(false),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_roles_org_id").on(table.organizationId),
  index("idx_roles_name").on(table.name),
]);

// ==========================================
// 0.3 PERMISSIONS TABLE (Database-Driven RBAC)
// ==========================================
export const permissions = mssqlTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  roleId: varchar("role_id", { length: 36 })
    .notNull()
    .references(() => roles.id),
  resource: varchar("resource", { length: 50 }).notNull(), // 'organizations' | 'departments' | 'users' | 'bookings' | 'tickets' | 'assets' | 'billing' | 'reports'
  action: varchar("action", { length: 50 }).notNull(),   // 'create' | 'read' | 'update' | 'delete' | 'manage'
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_permissions_role_id").on(table.roleId),
  index("idx_permissions_resource_action").on(table.resource, table.action),
]);

// ==========================================
// 0.4 ASSETS TABLE (ITAM & QR Tracking)
// ==========================================
export const assets = mssqlTable("assets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  departmentId: varchar("department_id", { length: 36 }).references(() => departments.id),
  assetTag: varchar("asset_tag", { length: 100 }).notNull().unique(), // e.g. AST-2026-000101
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'Laptop' | 'Desktop' | 'Server' | 'Router' | 'CCTV' | 'Printer' | 'Other'
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  qrCodeUrl: varchar("qr_code_url", { length: 500 }),
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active' | 'maintenance' | 'retired'
  purchaseDate: varchar("purchase_date", { length: 10 }), // YYYY-MM-DD
  warrantyExpiryDate: varchar("warranty_expiry_date", { length: 10 }), // YYYY-MM-DD
  notes: text("notes"),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_assets_tag").on(table.assetTag),
  index("idx_assets_org_id").on(table.organizationId),
  index("idx_assets_status").on(table.status),
  index("idx_assets_type").on(table.type),
]);

// ==========================================
// 0.5 SLA POLICIES TABLE (Service Level Agreements)
// ==========================================
export const slaPolicies = mssqlTable("sla_policies", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  priority: varchar("priority", { length: 20 }).notNull().unique(), // 'urgent' | 'high' | 'medium' | 'low' | 'normal'
  responseBufferMinutes: int("response_buffer_minutes").notNull(), // Target first response minutes (e.g. 15)
  resolutionBufferMinutes: int("resolution_buffer_minutes").notNull(), // Target resolution minutes (e.g. 120)
  escalationEmail: varchar("escalation_email", { length: 255 }),
  isDefault: bit("is_default").notNull().default(false),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_sla_priority").on(table.priority),
]);

// ==========================================
// 0.6 AMC CONTRACTS TABLE (Annual Maintenance Contracts)
// ==========================================
export const amcContracts = mssqlTable("amc_contracts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  customerId: varchar("customer_id", { length: 36 }).references(() => customers.id),
  contractNumber: varchar("contract_number", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  deviceCount: int("device_count").notNull().default(1),
  startDate: varchar("start_date", { length: 10 }).notNull(), // YYYY-MM-DD
  endDate: varchar("end_date", { length: 10 }).notNull(),   // YYYY-MM-DD
  contractAmount: decimal("contract_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active' | 'expiring' | 'expired'
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_amc_contract_number").on(table.contractNumber),
  index("idx_amc_status").on(table.status),
  index("idx_amc_org_id").on(table.organizationId),
  index("idx_amc_end_date").on(table.endDate),
]);

// ==========================================
// 1. USERS TABLE
// ==========================================
export const users = mssqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  departmentId: varchar("department_id", { length: 36 }).references(() => departments.id),
  roleId: varchar("role_id", { length: 36 }).references(() => roles.id),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }), // Can be null for OAuth login
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // Legacy role string or system role name
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active' | 'suspended' | 'pending'
  emailVerified: bit("email_verified").notNull().default(false),
  emailVerifiedAt: datetime2("email_verified_at"),
  googleId: varchar("google_id", { length: 255 }),
  microsoftId: varchar("microsoft_id", { length: 255 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_users_email").on(table.email),
  index("idx_users_role").on(table.role),
  index("idx_users_status").on(table.status),
  index("idx_users_org_id").on(table.organizationId),
  index("idx_users_role_id").on(table.roleId),
]);

// ==========================================
// 2. CUSTOMERS TABLE
// ==========================================
export const customers = mssqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  phone: varchar("phone", { length: 20 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  billingAddress: varchar("billing_address", { length: 500 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_customers_user_id").on(table.userId),
  index("idx_customers_phone").on(table.phone),
  index("idx_customers_org_id").on(table.organizationId),
]);

// ==========================================
// 3. ENGINEERS TABLE
// ==========================================
export const engineers = mssqlTable("engineers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  phone: varchar("phone", { length: 20 }).notNull(),
  bio: text("bio"),
  specialities: text("specialities"), // Comma-separated list or JSON
  status: varchar("status", { length: 20 }).notNull().default("available"), // 'available' | 'busy' | 'offline'
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_engineers_user_id").on(table.userId),
  index("idx_engineers_status").on(table.status),
  index("idx_engineers_org_id").on(table.organizationId),
]);

// ==========================================
// 4. SERVICES TABLE
// ==========================================
export const services = mssqlTable("services", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedDurationMinutes: int("estimated_duration_minutes").notNull(),
  isActive: bit("is_active").notNull().default(true),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_services_category").on(table.category),
  index("idx_services_is_active").on(table.isActive),
  index("idx_services_org_id").on(table.organizationId),
]);

// ==========================================
// 5. BOOKINGS TABLE
// ==========================================
export const bookings = mssqlTable("bookings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  departmentId: varchar("department_id", { length: 36 }).references(() => departments.id),
  assetId: varchar("asset_id", { length: 36 }).references(() => assets.id),
  slaPolicyId: varchar("sla_policy_id", { length: 36 }).references(() => slaPolicies.id),
  customerId: varchar("customer_id", { length: 36 })
    .notNull()
    .references(() => customers.id),
  serviceId: varchar("service_id", { length: 36 }).references(() => services.id),
  type: varchar("type", { length: 20 }).notNull(), // 'remote' | 'onsite' | 'emergency' | 'amc' | 'consultation'
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  address: varchar("address", { length: 500 }), // Optional for Remote IT Support
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pinCode: varchar("pin_code", { length: 20 }),
  deviceType: varchar("device_type", { length: 50 }),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  priority: varchar("priority", { length: 20 }).notNull().default("normal"), // 'normal' | 'high' | 'emergency'
  problemDescription: text("problem_description").notNull(),
  preferredDate: varchar("preferred_date", { length: 10 }).notNull(), // YYYY-MM-DD
  preferredTime: varchar("preferred_time", { length: 5 }).notNull(), // HH:MM
  operatingSystem: varchar("operating_system", { length: 50 }),
  remarks: text("remarks"),
  partsUsed: text("parts_used"),
  engineerId: varchar("engineer_id", { length: 36 }).references(() => engineers.id),
  ticketId: varchar("ticket_id", { length: 50 }).unique(),
  firstResponseDueAt: datetime2("first_response_due_at"),
  resolutionDueAt: datetime2("resolution_due_at"),
  isSlaBreached: bit("is_sla_breached").notNull().default(false),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_bookings_customer_id").on(table.customerId),
  index("idx_bookings_engineer_id").on(table.engineerId),
  index("idx_bookings_ticket_id").on(table.ticketId),
  index("idx_bookings_status").on(table.status),
  index("idx_bookings_phone").on(table.phone),
  index("idx_bookings_org_id").on(table.organizationId),
  index("idx_bookings_asset_id").on(table.assetId),
  index("idx_bookings_sla_breached").on(table.isSlaBreached),
  index("idx_bookings_created_at").on(table.createdAt),
]);

// ==========================================
// 6. BOOKING IMAGES TABLE
// ==========================================
export const bookingImages = mssqlTable("booking_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  bookingId: varchar("booking_id", { length: 36 })
    .notNull()
    .references(() => bookings.id),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_booking_images_booking_id").on(table.bookingId),
]);

// ==========================================
// 7. INVOICES TABLE
// ==========================================
export const invoices = mssqlTable("invoices", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  bookingId: varchar("booking_id", { length: 36 })
    .notNull()
    .references(() => bookings.id),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("unpaid"), // 'unpaid' | 'paid' | 'refunded'
  pdfUrl: varchar("pdf_url", { length: 500 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_invoices_booking_id").on(table.bookingId),
  index("idx_invoices_invoice_number").on(table.invoiceNumber),
  index("idx_invoices_status").on(table.status),
  index("idx_invoices_org_id").on(table.organizationId),
]);

// ==========================================
// 8. PAYMENTS TABLE
// ==========================================
export const payments = mssqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  invoiceId: varchar("invoice_id", { length: 36 })
    .notNull()
    .references(() => invoices.id),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  transactionId: varchar("transaction_id", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'success' | 'failed' | 'pending'
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_payments_invoice_id").on(table.invoiceId),
  index("idx_payments_status").on(table.status),
]);

// ==========================================
// 9. SUPPORT TICKETS TABLE
// ==========================================
export const tickets = mssqlTable("tickets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  departmentId: varchar("department_id", { length: 36 }).references(() => departments.id),
  assetId: varchar("asset_id", { length: 36 }).references(() => assets.id),
  slaPolicyId: varchar("sla_policy_id", { length: 36 }).references(() => slaPolicies.id),
  bookingId: varchar("booking_id", { length: 36 }).references(() => bookings.id),
  customerId: varchar("customer_id", { length: 36 })
    .notNull()
    .references(() => customers.id),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // 'low' | 'medium' | 'high' | 'urgent'
  status: varchar("status", { length: 20 }).notNull().default("open"), // 'open' | 'in_progress' | 'resolved' | 'closed'
  engineerId: varchar("engineer_id", { length: 36 }).references(() => engineers.id),
  firstResponseDueAt: datetime2("first_response_due_at"),
  resolutionDueAt: datetime2("resolution_due_at"),
  isSlaBreached: bit("is_sla_breached").notNull().default(false),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_tickets_customer_id").on(table.customerId),
  index("idx_tickets_engineer_id").on(table.engineerId),
  index("idx_tickets_status").on(table.status),
  index("idx_tickets_org_id").on(table.organizationId),
  index("idx_tickets_asset_id").on(table.assetId),
  index("idx_tickets_sla_breached").on(table.isSlaBreached),
]);

// ==========================================
// 10. SUPPORT TICKET MESSAGES TABLE
// ==========================================
export const ticketMessages = mssqlTable("ticket_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ticketId: varchar("ticket_id", { length: 36 })
    .notNull()
    .references(() => tickets.id),
  senderId: varchar("sender_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_ticket_messages_ticket_id").on(table.ticketId),
]);

// ==========================================
// 11. REVIEWS TABLE
// ==========================================
export const reviews = mssqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey(),
  bookingId: varchar("booking_id", { length: 36 })
    .notNull()
    .references(() => bookings.id),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_reviews_booking_id").on(table.bookingId),
]);

// ==========================================
// 12. BLOG POSTS TABLE
// ==========================================
export const blogPosts = mssqlTable("blog_posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  authorId: varchar("author_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  publishedAt: datetime2("published_at"),
  isPublished: bit("is_published").notNull().default(false),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
});

// ==========================================
// 13. FAQS TABLE
// ==========================================
export const faqs = mssqlTable("faqs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  isActive: bit("is_active").notNull().default(true),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
});

// ==========================================
// 14. AUDIT LOGS TABLE
// ==========================================
export const auditLogs = mssqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_audit_logs_user_id").on(table.userId),
  index("idx_audit_logs_action").on(table.action),
  index("idx_audit_logs_org_id").on(table.organizationId),
  index("idx_audit_logs_created_at").on(table.createdAt),
]);

// ==========================================
// 15. REFRESH TOKENS TABLE (Production Auth)
// ==========================================
export const refreshTokens = mssqlTable("refresh_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  userAgent: varchar("user_agent", { length: 500 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  isRevoked: bit("is_revoked").notNull().default(false),
  expiresAt: datetime2("expires_at").notNull(),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_refresh_tokens_user_id").on(table.userId),
  index("idx_refresh_tokens_token_hash").on(table.tokenHash),
]);

// ==========================================
// 16. PASSWORD RESETS TABLE (Production Auth)
// ==========================================
export const passwordResets = mssqlTable("password_resets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  isUsed: bit("is_used").notNull().default(false),
  expiresAt: datetime2("expires_at").notNull(),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_password_resets_token_hash").on(table.tokenHash),
  index("idx_password_resets_user_id").on(table.userId),
]);

// ==========================================
// 17. EMAIL VERIFICATIONS TABLE (Production Auth)
// ==========================================
export const emailVerifications = mssqlTable("email_verifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  isVerified: bit("is_verified").notNull().default(false),
  expiresAt: datetime2("expires_at").notNull(),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_email_verifications_token_hash").on(table.tokenHash),
]);

// ==========================================
// 18. TECHNICIAN WORK LOGS TABLE (Technician Workflow)
// ==========================================
export const technicianWorkLogs = mssqlTable("technician_work_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  bookingId: varchar("booking_id", { length: 36 })
    .notNull()
    .references(() => bookings.id),
  engineerId: varchar("engineer_id", { length: 36 })
    .notNull()
    .references(() => engineers.id),
  checkInTime: datetime2("check_in_time"),
  checkOutTime: datetime2("check_out_time"),
  checkInLat: decimal("check_in_lat", { precision: 10, scale: 7 }),
  checkInLng: decimal("check_in_lng", { precision: 10, scale: 7 }),
  checkOutLat: decimal("check_out_lat", { precision: 10, scale: 7 }),
  checkOutLng: decimal("check_out_lng", { precision: 10, scale: 7 }),
  beforePhotosJson: text("before_photos_json"), // JSON string array
  afterPhotosJson: text("after_photos_json"),   // JSON string array
  digitalSignatureUrl: text("digital_signature_url"), // Base64 or Blob storage URL
  totalMinutes: int("total_minutes"),
  notes: text("notes"),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_tech_logs_booking_id").on(table.bookingId),
  index("idx_tech_logs_engineer_id").on(table.engineerId),
]);

// ==========================================
// 19. RMM ENDPOINTS TABLE (RMM Agent Telemetry)
// ==========================================
export const rmmEndpoints = mssqlTable("rmm_endpoints", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  assetId: varchar("asset_id", { length: 36 }).references(() => assets.id),
  hostname: varchar("hostname", { length: 255 }).notNull(),
  osVersion: varchar("os_version", { length: 150 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  macAddress: varchar("mac_address", { length: 50 }),
  cpuUsagePercent: decimal("cpu_usage_percent", { precision: 5, scale: 2 }).default("0.00"),
  ramUsagePercent: decimal("ram_usage_percent", { precision: 5, scale: 2 }).default("0.00"),
  diskUsagePercent: decimal("disk_usage_percent", { precision: 5, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 20 }).notNull().default("online"), // 'online' | 'offline' | 'warning' | 'critical'
  lastHeartbeatAt: datetime2("last_heartbeat_at").notNull().default(sql`(getdate())`),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_rmm_hostname").on(table.hostname),
  index("idx_rmm_status").on(table.status),
  index("idx_rmm_org_id").on(table.organizationId),
  index("idx_rmm_last_heartbeat").on(table.lastHeartbeatAt),
]);

// ==========================================
// 20. RMM SCRIPTS TABLE (RMM Script Automation)
// ==========================================
export const rmmScripts = mssqlTable("rmm_scripts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'Maintenance' | 'Security' | 'Networking' | 'Software'
  shellType: varchar("shell_type", { length: 20 }).notNull().default("powershell"), // 'powershell' | 'bash' | 'cmd'
  scriptContent: text("script_content").notNull(),
  description: text("description"),
  isSystem: bit("is_system").notNull().default(true),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_rmm_scripts_category").on(table.category),
  index("idx_rmm_scripts_shell").on(table.shellType),
]);
