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
// 14. AUDIT LOGS TABLE (Enterprise Immutable Audit Trail)
// ==========================================
export const auditLogs = mssqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  departmentId: varchar("department_id", { length: 36 }).references(() => departments.id),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  actionType: varchar("action_type", { length: 100 }), // e.g. 'auth.login' | 'ticket.create' | 'rmm.script_dispatch'
  entityType: varchar("entity_type", { length: 50 }),   // e.g. 'users' | 'tickets' | 'assets' | 'invoices'
  entityId: varchar("entity_id", { length: 36 }),
  oldValuesJson: text("old_values_json"),
  newValuesJson: text("new_values_json"),
  reason: varchar("reason", { length: 500 }),
  status: varchar("status", { length: 20 }).notNull().default("success"), // 'success' | 'failed'
  details: text("details").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_audit_logs_user_id").on(table.userId),
  index("idx_audit_logs_action").on(table.action),
  index("idx_audit_logs_action_type").on(table.actionType),
  index("idx_audit_logs_entity").on(table.entityType, table.entityId),
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

// ==========================================
// 21. SSO PROVIDERS TABLE (Enterprise SAML / Okta)
// ==========================================
export const ssoProviders = mssqlTable("sso_providers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  providerType: varchar("provider_type", { length: 50 }).notNull(), // 'okta' | 'azure_ad' | 'google_workspace' | 'custom_saml'
  issuerUrl: varchar("issuer_url", { length: 500 }).notNull(),
  ssoUrl: varchar("sso_url", { length: 500 }).notNull(),
  certificatePem: text("certificate_pem"),
  domain: varchar("domain", { length: 255 }),
  isEnabled: bit("is_enabled").notNull().default(true),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_sso_org_id").on(table.organizationId),
  index("idx_sso_provider_type").on(table.providerType),
]);

// ==========================================
// 22. NOTIFICATION TEMPLATES TABLE
// ==========================================
export const notificationTemplates = mssqlTable("notification_templates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  eventKey: varchar("event_key", { length: 100 }).notNull(), // 'ticket.assigned' | 'sla.breach' | 'rmm.offline' | 'invoice.paid'
  channel: varchar("channel", { length: 20 }).notNull().default("in_app"), // 'email' | 'in_app' | 'push' | 'webhook'
  subject: varchar("subject", { length: 255 }).notNull(),
  bodyTemplate: text("body_template").notNull(),
  isEnabled: bit("is_enabled").notNull().default(true),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_notif_templates_event").on(table.eventKey),
  index("idx_notif_templates_channel").on(table.channel),
]);

// ==========================================
// 23. NOTIFICATION QUEUE TABLE
// ==========================================
export const notificationQueue = mssqlTable("notification_queue", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  eventKey: varchar("event_key", { length: 100 }).notNull(),
  channel: varchar("channel", { length: 20 }).notNull().default("in_app"),
  recipient: varchar("recipient", { length: 255 }).notNull(), // email address, webhook URL, or userId
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending' | 'sent' | 'failed'
  retryCount: int("retry_count").notNull().default(0),
  lastError: text("last_error"),
  sentAt: datetime2("sent_at"),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_notif_queue_status").on(table.status),
  index("idx_notif_queue_user_id").on(table.userId),
  index("idx_notif_queue_created_at").on(table.createdAt),
]);

// ==========================================
// 24. FEATURE FLAGS TABLE (Database-Driven Feature Controls)
// ==========================================
export const featureFlags = mssqlTable("feature_flags", {
  id: varchar("id", { length: 36 }).primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g. 'ai_triage_enabled' | 'rmm_terminal_enabled'
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  isEnabled: bit("is_enabled").notNull().default(false),
  targetOrgId: varchar("target_org_id", { length: 36 }).references(() => organizations.id),
  rolloutPercentage: int("rollout_percentage").notNull().default(100),
  scheduledEnableAt: datetime2("scheduled_enable_at"),
  scheduledDisableAt: datetime2("scheduled_disable_at"),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_feature_flags_key").on(table.key),
  index("idx_feature_flags_target_org").on(table.targetOrgId),
]);

// ==========================================
// 25. DATABASE BACKUPS TABLE (Disaster Recovery)
// ==========================================
export const databaseBackups = mssqlTable("database_backups", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  filename: varchar("filename", { length: 255 }).notNull(),
  backupType: varchar("backup_type", { length: 50 }).notNull().default("full_database"), // 'full_database' | 'tenant_export' | 'scheduled_cron'
  sizeBytes: int("size_bytes").notNull().default(0),
  checksumSha256: varchar("checksum_sha256", { length: 64 }),
  isEncrypted: bit("is_encrypted").notNull().default(true),
  status: varchar("status", { length: 20 }).notNull().default("completed"), // 'completed' | 'failed' | 'restoring'
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_backups_org_id").on(table.organizationId),
  index("idx_backups_status").on(table.status),
  index("idx_backups_created_at").on(table.createdAt),
]);

// ==========================================
// 26. TRACKING TOKENS TABLE (Passwordless Guest Ticket Access)
// ==========================================
export const trackingTokens = mssqlTable("tracking_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  bookingId: varchar("booking_id", { length: 36 }).notNull().references(() => bookings.id),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: datetime2("expires_at").notNull(),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_tracking_tokens_booking").on(table.bookingId),
  index("idx_tracking_tokens_token").on(table.token),
]);

// ==========================================
// 27. CUSTOMER PROFILES TABLE (Optional Registered Customer Account)
// ==========================================
export const customerProfiles = mssqlTable("customer_profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  email: varchar("email", { length: 255 }).notNull().unique(),
  companyName: varchar("company_name", { length: 255 }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }),
  preferredContactMethod: varchar("preferred_contact_method", { length: 20 }).notNull().default("email"), // 'email' | 'sms' | 'phone' | 'whatsapp'
  savedDevicesJson: text("saved_devices_json"),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_customer_profiles_user").on(table.userId),
  index("idx_customer_profiles_email").on(table.email),
]);

// ==========================================
// 28. OTP CODES TABLE (Passwordless Magic Link & Verification Codes)
// ==========================================
export const otpCodes = mssqlTable("otp_codes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: datetime2("expires_at").notNull(),
  isUsed: bit("is_used").notNull().default(false),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_otp_codes_email").on(table.email),
  index("idx_otp_codes_code").on(table.code),
  index("idx_otp_codes_token").on(table.token),
]);

// ==========================================
// 29. ASSET SERVICE HISTORY TABLE (Chronological Asset Timeline)
// ==========================================
export const assetServiceHistory = mssqlTable("asset_service_history", {
  id: varchar("id", { length: 36 }).primaryKey(),
  assetId: varchar("asset_id", { length: 36 }).notNull().references(() => assets.id),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'installation' | 'repair' | 'maintenance' | 'parts_replaced' | 'software' | 'firmware' | 'warranty_claim'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  performedBy: varchar("performed_by", { length: 255 }),
  partsReplaced: text("parts_replaced"),
  softwareInstalled: text("software_installed"),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_ash_asset_id").on(table.assetId),
  index("idx_ash_event_type").on(table.eventType),
  index("idx_ash_created_at").on(table.createdAt),
]);

// ==========================================
// 30. CUSTOMER ASSET DOCUMENTS TABLE (Invoices, Warranties & AMC Contracts)
// ==========================================
export const customerAssetDocuments = mssqlTable("customer_asset_documents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  assetId: varchar("asset_id", { length: 36 }).notNull().references(() => assets.id),
  customerId: varchar("customer_id", { length: 36 }).references(() => customers.id),
  documentType: varchar("document_type", { length: 50 }).notNull(), // 'invoice' | 'warranty' | 'amc_contract' | 'report' | 'photo'
  documentName: varchar("document_name", { length: 255 }).notNull(),
  documentUrl: varchar("document_url", { length: 500 }).notNull(),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_cad_asset_id").on(table.assetId),
  index("idx_cad_customer_id").on(table.customerId),
]);

// ==========================================
// 31. MAINTENANCE SCHEDULE TABLE (Upcoming Preventive Maintenance)
// ==========================================
export const maintenanceSchedule = mssqlTable("maintenance_schedule", {
  id: varchar("id", { length: 36 }).primaryKey(),
  assetId: varchar("asset_id", { length: 36 }).notNull().references(() => assets.id),
  organizationId: varchar("organization_id", { length: 36 }).references(() => organizations.id),
  serviceName: varchar("service_name", { length: 255 }).notNull(),
  scheduledDate: varchar("scheduled_date", { length: 10 }).notNull(), // YYYY-MM-DD
  status: varchar("status", { length: 20 }).notNull().default("scheduled"), // 'scheduled' | 'in_progress' | 'completed' | 'overdue'
  assignedEngineerId: varchar("assigned_engineer_id", { length: 36 }).references(() => engineers.id),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_ms_asset_id").on(table.assetId),
  index("idx_ms_status").on(table.status),
  index("idx_ms_scheduled_date").on(table.scheduledDate),
]);

// ==========================================
// 32. TICKET FEEDBACK & CSAT TABLE (Customer Ratings & Reviews)
// ==========================================
export const ticketFeedback = mssqlTable("ticket_feedback", {
  id: varchar("id", { length: 36 }).primaryKey(),
  bookingId: varchar("booking_id", { length: 36 }).notNull().references(() => bookings.id),
  customerId: varchar("customer_id", { length: 36 }),
  rating: int("rating").notNull().default(5), // 1 - 5 stars
  feedbackText: text("feedback_text"),
  technicianRating: int("technician_rating").notNull().default(5),
  isPublic: bit("is_public").notNull().default(true),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_tf_booking_id").on(table.bookingId),
  index("idx_tf_rating").on(table.rating),
]);

// ==========================================
// 33. KNOWLEDGE BASE ARTICLES TABLE (Customer Self-Service FAQ & Guides)
// ==========================================
export const knowledgeBaseArticles = mssqlTable("knowledge_base_articles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull().default("General"), // 'General' | 'Hardware' | 'Network' | 'Software' | 'Billing'
  content: text("content").notNull(),
  tags: varchar("tags", { length: 255 }),
  views: int("views").notNull().default(0),
  helpfulCount: int("helpful_count").notNull().default(0),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_kb_category").on(table.category),
  index("idx_kb_title").on(table.title),
]);

// ==========================================
// 34. TECHNICIAN DEVICES TABLE (Mobile Device Registration & Push Tokens)
// ==========================================
export const technicianDevices = mssqlTable("technician_devices", {
  id: varchar("id", { length: 36 }).primaryKey(),
  engineerId: varchar("engineer_id", { length: 36 }).notNull().references(() => engineers.id),
  deviceToken: varchar("device_token", { length: 500 }).notNull(),
  platform: varchar("platform", { length: 20 }).notNull().default("android"), // 'android' | 'ios'
  appVersion: varchar("app_version", { length: 20 }).notNull().default("1.0.0"),
  isRegistered: bit("is_registered").notNull().default(true),
  lastSyncAt: datetime2("last_sync_at").notNull().default(sql`(getdate())`),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_td_engineer_id").on(table.engineerId),
  index("idx_td_platform").on(table.platform),
]);

// ==========================================
// 35. OFFLINE SYNC QUEUE TABLE (Mobile Offline Work Queue & Sync Engine)
// ==========================================
export const offlineSyncQueue = mssqlTable("offline_sync_queue", {
  id: varchar("id", { length: 36 }).primaryKey(),
  engineerId: varchar("engineer_id", { length: 36 }).notNull().references(() => engineers.id),
  actionType: varchar("action_type", { length: 50 }).notNull(), // 'status_update' | 'signature_upload' | 'photo_upload' | 'qr_scan' | 'work_log'
  payloadJson: text("payload_json").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending' | 'synced' | 'failed' | 'conflict'
  retryCount: int("retry_count").notNull().default(0),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_osq_engineer_id").on(table.engineerId),
  index("idx_osq_status").on(table.status),
]);

// ==========================================
// 36. CUSTOMER DEVICES TABLE (Customer Mobile App & FCM Device Registration)
// ==========================================
export const customerDevices = mssqlTable("customer_devices", {
  id: varchar("id", { length: 36 }).primaryKey(),
  customerId: varchar("customer_id", { length: 36 }).references(() => customers.id),
  email: varchar("email", { length: 255 }).notNull(),
  deviceToken: varchar("device_token", { length: 500 }).notNull(),
  platform: varchar("platform", { length: 20 }).notNull().default("android"), // 'android' | 'ios'
  appVersion: varchar("app_version", { length: 20 }).notNull().default("1.0.0"),
  isRegistered: bit("is_registered").notNull().default(true),
  lastActiveAt: datetime2("last_active_at").notNull().default(sql`(getdate())`),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_cd_customer_id").on(table.customerId),
  index("idx_cd_email").on(table.email),
]);

// ==========================================
// 37. PUSH NOTIFICATIONS TABLE (Real-time FCM / APNs Push Dispatch Engine)
// ==========================================
export const pushNotifications = mssqlTable("push_notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  recipientType: varchar("recipient_type", { length: 20 }).notNull(), // 'customer' | 'engineer' | 'admin'
  recipientId: varchar("recipient_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  payloadJson: text("payload_json"),
  isRead: bit("is_read").notNull().default(false),
  sentAt: datetime2("sent_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_pn_recipient").on(table.recipientType, table.recipientId),
  index("idx_pn_sent_at").on(table.sentAt),
]);

// ==========================================
// 38. OFFLINE SYNC CONFLICTS TABLE (Conflict Resolution & Server Priority Rules)
// ==========================================
export const offlineSyncConflicts = mssqlTable("offline_sync_conflicts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  engineerId: varchar("engineer_id", { length: 36 }).notNull().references(() => engineers.id),
  queueItemId: varchar("queue_item_id", { length: 36 }).notNull(),
  conflictReason: varchar("conflict_reason", { length: 255 }).notNull(), // 'simultaneous_edit' | 'version_mismatch' | 'deleted_record'
  clientTimestamp: datetime2("client_timestamp").notNull(),
  serverTimestamp: datetime2("server_timestamp").notNull().default(sql`(getdate())`),
  resolvedPayloadJson: text("resolved_payload_json"),
  status: varchar("status", { length: 20 }).notNull().default("resolved"), // 'resolved' | 'escalated'
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_osc_engineer_id").on(table.engineerId),
  index("idx_osc_status").on(table.status),
]);

// ==========================================
// 39. TECHNICIAN LOCAL INVENTORY TABLE (Offline Mobile Parts Stock & Reservation)
// ==========================================
export const technicianLocalInventory = mssqlTable("technician_local_inventory", {
  id: varchar("id", { length: 36 }).primaryKey(),
  engineerId: varchar("engineer_id", { length: 36 }).notNull().references(() => engineers.id),
  partNumber: varchar("part_number", { length: 50 }).notNull(),
  partName: varchar("part_name", { length: 255 }).notNull(),
  quantityOnHand: int("quantity_on_hand").notNull().default(0),
  quantityReserved: int("quantity_reserved").notNull().default(0),
  lastSyncedAt: datetime2("last_synced_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_tli_engineer_id").on(table.engineerId),
  index("idx_tli_part_number").on(table.partNumber),
]);

// ==========================================
// 40. MOBILE SECURITY AUDITS TABLE (SSL Pinning, Anti-Tamper & Root/Jailbreak Detection)
// ==========================================
export const mobileSecurityAudits = mssqlTable("mobile_security_audits", {
  id: varchar("id", { length: 36 }).primaryKey(),
  engineerId: varchar("engineer_id", { length: 36 }),
  deviceToken: varchar("device_token", { length: 500 }).notNull(),
  platform: varchar("platform", { length: 20 }).notNull().default("android"), // 'android' | 'ios'
  isRooted: bit("is_rooted").notNull().default(false),
  isJailbroken: bit("is_jailbroken").notNull().default(false),
  appIntegrityHash: varchar("app_integrity_hash", { length: 128 }).notNull(),
  securityCheckPassed: bit("security_check_passed").notNull().default(true),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_msa_device_token").on(table.deviceToken),
  index("idx_msa_platform").on(table.platform),
]);

// ==========================================
// 41. MOBILE RELEASE BUILDS TABLE (App Store & Play Store OTA Bundle Distribution)
// ==========================================
export const mobileReleaseBuilds = mssqlTable("mobile_release_builds", {
  id: varchar("id", { length: 36 }).primaryKey(),
  platform: varchar("platform", { length: 20 }).notNull(), // 'android' | 'ios'
  buildVersion: varchar("build_version", { length: 20 }).notNull(), // e.g. "1.2.0"
  bundleUrl: varchar("bundle_url", { length: 500 }).notNull(),
  releaseNotes: text("release_notes"),
  isMandatoryUpdate: bit("is_mandatory_update").notNull().default(false),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_mrb_platform").on(table.platform),
  index("idx_mrb_version").on(table.buildVersion),
]);

// ==========================================
// 42. AI ORCHESTRATOR LOGS TABLE (Observability, Latency & Cost Audit)
// ==========================================
export const aiOrchestratorLogs = mssqlTable("ai_orchestrator_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  requestType: varchar("request_type", { length: 50 }).notNull(),
  providerUsed: varchar("provider_used", { length: 50 }).notNull(),
  modelUsed: varchar("model_used", { length: 100 }).notNull(),
  promptVersion: varchar("prompt_version", { length: 20 }).notNull().default("v1.0"),
  promptTokens: int("prompt_tokens").notNull().default(0),
  completionTokens: int("completion_tokens").notNull().default(0),
  totalTokens: int("total_tokens").notNull().default(0),
  latencyMs: int("latency_ms").notNull().default(0),
  estimatedCostUsd: varchar("estimated_cost_usd", { length: 20 }).notNull().default("0.0000"),
  cacheHit: bit("cache_hit").notNull().default(false),
  fallbackUsed: bit("fallback_used").notNull().default(false),
  toolsExecuted: text("tools_executed"),
  tenantId: varchar("tenant_id", { length: 36 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_aol_request_type").on(table.requestType),
  index("idx_aol_provider").on(table.providerUsed),
  index("idx_aol_created_at").on(table.createdAt),
]);

// ==========================================
// 43. AI MEMORY STORE TABLE (Conversation & Session Memory Abstraction)
// ==========================================
export const aiMemoryStore = mssqlTable("ai_memory_store", {
  id: varchar("id", { length: 36 }).primaryKey(),
  memoryType: varchar("memory_type", { length: 50 }).notNull(), // 'session' | 'conversation' | 'customer' | 'asset' | 'tenant'
  memoryKey: varchar("memory_key", { length: 255 }).notNull(),
  memoryValueJson: text("memory_value_json").notNull(),
  tenantId: varchar("tenant_id", { length: 36 }),
  expiresAt: datetime2("expires_at"),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
}, (table) => [
  index("idx_ams_type_key").on(table.memoryType, table.memoryKey),
  index("idx_ams_tenant").on(table.tenantId),
]);
