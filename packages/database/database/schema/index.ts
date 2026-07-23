import { mssqlTable, varchar, text, int, decimal, datetime2, bit } from "drizzle-orm/mssql-core";
import { sql } from "drizzle-orm";

// ==========================================
// 1. USERS TABLE
// ==========================================
export const users = mssqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }), // Can be null for OAuth login
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'customer' | 'engineer' | 'admin'
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active' | 'suspended' | 'pending'
  googleId: varchar("google_id", { length: 255 }),
  microsoftId: varchar("microsoft_id", { length: 255 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
});

// ==========================================
// 2. CUSTOMERS TABLE
// ==========================================
export const customers = mssqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  phone: varchar("phone", { length: 20 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  billingAddress: varchar("billing_address", { length: 500 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
});

// ==========================================
// 3. ENGINEERS TABLE
// ==========================================
export const engineers = mssqlTable("engineers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  phone: varchar("phone", { length: 20 }).notNull(),
  bio: text("bio"),
  specialities: text("specialities"), // Store as a comma-separated list or serialized array
  status: varchar("status", { length: 20 }).notNull().default("available"), // 'available' | 'busy' | 'offline'
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
});

// ==========================================
// 4. SERVICES TABLE
// ==========================================
export const services = mssqlTable("services", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedDurationMinutes: int("estimated_duration_minutes").notNull(),
  isActive: bit("is_active").notNull().default(true),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
});

// ==========================================
// 5. BOOKINGS TABLE
// ==========================================
export const bookings = mssqlTable("bookings", {
  id: varchar("id", { length: 36 }).primaryKey(),
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
  problemDescription: text("problem_description").notNull(),
  preferredDate: varchar("preferred_date", { length: 10 }).notNull(), // YYYY-MM-DD
  preferredTime: varchar("preferred_time", { length: 5 }).notNull(), // HH:MM
  operatingSystem: varchar("operating_system", { length: 50 }).notNull(),
  engineerId: varchar("engineer_id", { length: 36 }).references(() => engineers.id),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
});

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
});

// ==========================================
// 7. INVOICES TABLE
// ==========================================
export const invoices = mssqlTable("invoices", {
  id: varchar("id", { length: 36 }).primaryKey(),
  bookingId: varchar("booking_id", { length: 36 })
    .notNull()
    .references(() => bookings.id),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("unpaid"), // 'unpaid' | 'paid' | 'refunded'
  pdfUrl: varchar("pdf_url", { length: 500 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
});

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
});

// ==========================================
// 9. SUPPORT TICKETS TABLE
// ==========================================
export const tickets = mssqlTable("tickets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  bookingId: varchar("booking_id", { length: 36 }).references(() => bookings.id),
  customerId: varchar("customer_id", { length: 36 })
    .notNull()
    .references(() => customers.id),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // 'low' | 'medium' | 'high' | 'urgent'
  status: varchar("status", { length: 20 }).notNull().default("open"), // 'open' | 'in_progress' | 'resolved' | 'closed'
  engineerId: varchar("engineer_id", { length: 36 }).references(() => engineers.id),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
  updatedAt: datetime2("updated_at").notNull().default(sql`(getdate())`),
});

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
});

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
});

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
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
});
