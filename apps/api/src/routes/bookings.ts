import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db.js";
import { bookings, customers, users, bookingImages, engineers } from "@remotefix/database";
import { BookingCreateSchema, BookingUpdateStatusSchema } from "@remotefix/types";
import { requireAuth, AppEnv } from "../middleware/auth.js";
import { uploadToAzureBlob } from "../azureStorage.js";

const bookingsRouter = new Hono<AppEnv>();

// ==========================================
// 1. CREATE BOOKING (Public / Optional Auth)
// ==========================================
bookingsRouter.post("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  // Try to parse authorization token if present
  let authUser = null;
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const { verifyJWT } = await import("@remotefix/auth");
    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token, c.env.JWT_SECRET);
    if (decoded) {
      authUser = decoded;
    }
  }

  try {
    const body = await c.req.json();
    const result = BookingCreateSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    const input = result.data;
    let customerId = "";
    
    if (authUser) {
      // Find customer record for authenticated user
      const customerRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, authUser.id));
        
      if (customerRecord.length > 0) {
        customerId = customerRecord[0].id;
      } else {
        // Fallback: Create customer profile for existing user
        customerId = crypto.randomUUID();
        await db.insert(customers).values({
          id: customerId,
          userId: authUser.id,
          phone: input.phone,
          companyName: input.company || null,
          billingAddress: input.address || null,
        });
      }
    } else {
      // Guest Booking: Check if user exists by email, if not create guest user
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));
        
      let userId = "";
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
        
        // Find existing customer ID
        const customerRecord = await db
          .select()
          .from(customers)
          .where(eq(customers.userId, userId));
          
        if (customerRecord.length > 0) {
          customerId = customerRecord[0].id;
        } else {
          customerId = crypto.randomUUID();
          await db.insert(customers).values({
            id: customerId,
            userId,
            phone: input.phone,
            companyName: input.company || null,
            billingAddress: input.address || null,
          });
        }
      } else {
        // Create Guest User and Customer Profile
        userId = crypto.randomUUID();
        customerId = crypto.randomUUID();
        
        await db.transaction(async (tx) => {
          await tx.insert(users).values({
            id: userId,
            email: input.email,
            fullName: input.name,
            role: "customer",
            status: "active",
            passwordHash: null, // No password for guests until they claim account
          });
          
          await tx.insert(customers).values({
            id: customerId,
            userId,
            phone: input.phone,
            companyName: input.company || null,
            billingAddress: input.address || null,
          });
        });
      }
    }
    
    const bookingId = crypto.randomUUID();
    
    // Insert Booking
    await db.insert(bookings).values({
      id: bookingId,
      customerId,
      serviceId: input.serviceId || null,
      type: input.type,
      status: "pending",
      name: input.name,
      phone: input.phone,
      email: input.email,
      company: input.company || null,
      address: input.address || null,
      problemDescription: input.problemDescription,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      operatingSystem: input.operatingSystem,
    });
    
    // Handle base64 image uploads if provided
    const uploadedImages: string[] = [];
    if (input.images && input.images.length > 0) {
      for (let i = 0; i < input.images.length; i++) {
        try {
          const base64Data = input.images[i];
          const fileName = `booking-${bookingId}-${i}-${Date.now()}.jpg`;
          const url = await uploadToAzureBlob(
            c.env.AZURE_STORAGE_CONNECTION_STRING,
            c.env.AZURE_STORAGE_CONTAINER,
            fileName,
            base64Data
          );
          
          await db.insert(bookingImages).values({
            id: crypto.randomUUID(),
            bookingId,
            imageUrl: url,
          });
          uploadedImages.push(url);
        } catch (storageErr) {
          console.error("Azure Storage upload failed for booking image:", storageErr);
        }
      }
    }
    
    return c.json({
      success: true,
      message: "Booking created successfully",
      bookingId,
      images: uploadedImages,
    }, 201);
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to create booking" }, 500);
  }
});

// ==========================================
// 2. GET BOOKINGS LIST (Auth Required)
// ==========================================
bookingsRouter.get("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  try {
    let resultList: any[] = [];
    
    if (user.role === "admin") {
      resultList = await db.select().from(bookings);
    } else if (user.role === "engineer") {
      // Find engineer record
      const engRecord = await db
        .select()
        .from(engineers)
        .where(eq(engineers.userId, user.id));
        
      if (engRecord.length > 0) {
        resultList = await db
          .select()
          .from(bookings)
          .where(eq(bookings.engineerId, engRecord[0].id));
      }
    } else if (user.role === "customer") {
      // Find customer record
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
        
      if (custRecord.length > 0) {
        resultList = await db
          .select()
          .from(bookings)
          .where(eq(bookings.customerId, custRecord[0].id));
      }
    }
    
    return c.json({ success: true, bookings: resultList });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 3. GET BOOKING BY ID (Auth Required)
// ==========================================
bookingsRouter.get("/:id", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const id = c.req.param("id");
  
  try {
    const bookingList = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
      
    if (bookingList.length === 0) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    const booking = bookingList[0];
    
    // Check permission
    if (user.role === "customer") {
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
        
      if (custRecord.length === 0 || booking.customerId !== custRecord[0].id) {
        return c.json({ success: false, error: "Unauthorized access to booking" }, 403);
      }
    } else if (user.role === "engineer") {
      const engRecord = await db
        .select()
        .from(engineers)
        .where(eq(engineers.userId, user.id));
        
      if (engRecord.length === 0 || booking.engineerId !== engRecord[0].id) {
        return c.json({ success: false, error: "Unauthorized access to booking" }, 403);
      }
    }
    
    // Fetch associated images
    const images = await db
      .select()
      .from(bookingImages)
      .where(eq(bookingImages.bookingId, booking.id));
      
    return c.json({
      success: true,
      booking: {
        ...booking,
        images: images.map(img => img.imageUrl),
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 4. UPDATE STATUS / ASSIGN (Auth Required)
// ==========================================
bookingsRouter.put("/:id/status", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const id = c.req.param("id");
  
  try {
    const body = await c.req.json();
    const result = BookingUpdateStatusSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    const bookingList = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
      
    if (bookingList.length === 0) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    const booking = bookingList[0];
    const { status, engineerId } = result.data;
    
    // Role-based status modifications
    if (user.role === "customer") {
      // Customers can only cancel their own pending bookings
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
        
      if (custRecord.length === 0 || booking.customerId !== custRecord[0].id) {
        return c.json({ success: false, error: "Unauthorized" }, 403);
      }
      
      if (status !== "cancelled" || booking.status !== "pending") {
        return c.json({ success: false, error: "Customers can only cancel pending bookings." }, 400);
      }
      
      await db.update(bookings).set({ status: "cancelled", updatedAt: new Date() }).where(eq(bookings.id, id));
    } else if (user.role === "engineer") {
      // Engineers can update status of assigned bookings, but cannot reassign engineer
      const engRecord = await db
        .select()
        .from(engineers)
        .where(eq(engineers.userId, user.id));
        
      if (engRecord.length === 0 || booking.engineerId !== engRecord[0].id) {
        return c.json({ success: false, error: "Unauthorized: Booking is not assigned to you." }, 403);
      }
      
      if (status === "pending" || status === "assigned") {
        return c.json({ success: false, error: "Invalid status update for engineer." }, 400);
      }
      
      await db.update(bookings).set({ status, updatedAt: new Date() }).where(eq(bookings.id, id));
    } else if (user.role === "admin") {
      // Admins can change status to anything, and assign/reassign engineers
      const updatePayload: any = { status, updatedAt: new Date() };
      
      if (engineerId !== undefined) {
        updatePayload.engineerId = engineerId || null;
        if (engineerId && status === "pending") {
          updatePayload.status = "assigned"; // Auto transition to assigned if engineer provided
        }
      }
      
      await db.update(bookings).set(updatePayload).where(eq(bookings.id, id));
    }
    
    return c.json({
      success: true,
      message: "Booking status updated successfully",
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 5. UPLOAD EXTRA PHOTOS TO BOOKING
// ==========================================
bookingsRouter.post("/:id/images", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const id = c.req.param("id");
  
  try {
    const { image } = await c.req.json();
    if (!image) {
      return c.json({ success: false, error: "Missing base64 image data" }, 400);
    }
    
    const bookingList = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
      
    if (bookingList.length === 0) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    const booking = bookingList[0];
    
    // Check permission: Admin, assigned Engineer, or owning Customer
    let hasAccess = false;
    if (user.role === "admin") {
      hasAccess = true;
    } else if (user.role === "engineer") {
      const engRecord = await db
        .select()
        .from(engineers)
        .where(eq(engineers.userId, user.id));
      hasAccess = engRecord.length > 0 && booking.engineerId === engRecord[0].id;
    } else if (user.role === "customer") {
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
      hasAccess = custRecord.length > 0 && booking.customerId === custRecord[0].id;
    }
    
    if (!hasAccess) {
      return c.json({ success: false, error: "Unauthorized to upload photos for this booking" }, 403);
    }
    
    const fileName = `booking-${booking.id}-extra-${Date.now()}.jpg`;
    const url = await uploadToAzureBlob(
      c.env.AZURE_STORAGE_CONNECTION_STRING,
      c.env.AZURE_STORAGE_CONTAINER,
      fileName,
      image
    );
    
    await db.insert(bookingImages).values({
      id: crypto.randomUUID(),
      bookingId: booking.id,
      imageUrl: url,
    });
    
    return c.json({
      success: true,
      imageUrl: url,
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 6. LINK GUEST BOOKING TO LOGGED-IN CUSTOMER (Auth Required)
// ==========================================
bookingsRouter.post("/link", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  if (user.role !== "customer") {
    return c.json({ success: false, error: "Only customer accounts can link previous guest bookings." }, 403);
  }
  
  try {
    const { ticketId, phone } = await c.req.json();
    
    if (!ticketId || !phone) {
      return c.json({ success: false, error: "Missing ticketId or phone coordinates" }, 400);
    }
    
    // Find customer record for current user
    const custRecord = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id));
      
    if (custRecord.length === 0) {
      return c.json({ success: false, error: "Customer profile not found." }, 404);
    }
    
    const customerId = custRecord[0].id;
    
    // Find the guest booking
    const bookingList = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.ticketId, ticketId), eq(bookings.phone, phone)));
      
    if (bookingList.length === 0) {
      return c.json({ success: false, error: "No guest booking found matching the provided Ticket ID and Mobile Number." }, 404);
    }
    
    const booking = bookingList[0];
    
    // Check if already linked
    if (booking.customerId === customerId) {
      return c.json({ success: false, error: "This booking is already linked to your account." }, 400);
    }
    
    // Link it!
    await db
      .update(bookings)
      .set({ customerId, updatedAt: new Date() })
      .where(eq(bookings.id, booking.id));
      
    return c.json({
      success: true,
      message: "Guest booking successfully linked to your profile!",
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { bookingsRouter };
