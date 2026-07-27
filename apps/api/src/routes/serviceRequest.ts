import { Hono } from "hono";
import { eq, and, like, count } from "drizzle-orm";
import { getDb } from "../db.js";
import { bookings, customers, users, bookingImages, engineers } from "@remotefix/database";
import { ServiceRequestCreateSchema } from "@remotefix/types";
import { uploadToAzureBlob } from "../azureStorage.js";

const serviceRequestRouter = new Hono();

// ==========================================
// 1. SUBMIT GUEST SERVICE REQUEST
// ==========================================
serviceRequestRouter.post("/", async (c: any) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    const body = await c.req.json();
    const result = ServiceRequestCreateSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    const input = result.data;
    
    // Generate sequential Ticket ID: RF-YYYYMMDD-XXXXXX
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const prefix = `RF-${todayStr}-`;
    
    const countResult = await db
      .select({ count: count(bookings.id) })
      .from(bookings)
      .where(like(bookings.ticketId, `${prefix}%`));
      
    const nextSeq = String(countResult[0].count + 1).padStart(6, "0");
    const ticketId = `${prefix}${nextSeq}`;
    
    // Guest Linkage: Resolve or create customer profile by email
    let customerId = "";
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email));
      
    if (existingUser.length > 0) {
      const userId = existingUser[0].id;
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
          companyName: input.companyName || null,
          billingAddress: input.address || null,
        });
      }
    } else {
      const userId = crypto.randomUUID();
      customerId = crypto.randomUUID();
      
      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          id: userId,
          email: input.email,
          fullName: input.fullName,
          role: "customer",
          status: "active",
          passwordHash: null,
        });
        
        await tx.insert(customers).values({
          id: customerId,
          userId,
          phone: input.phone,
          companyName: input.companyName || null,
          billingAddress: input.address || null,
        });
      });
    }
    
    const bookingId = crypto.randomUUID();
    
    // Insert Guest Booking / Service Request
    await db.insert(bookings).values({
      id: bookingId,
      customerId,
      serviceId: null, // guest bookings are triage-first, no initial service ID
      type: input.priority === "emergency" ? "emergency" : "onsite",
      status: "pending",
      name: input.fullName,
      phone: input.phone,
      email: input.email,
      company: input.companyName || null,
      address: `${input.address}, ${input.city}, ${input.state} - ${input.pinCode}`,
      city: input.city,
      state: input.state,
      pinCode: input.pinCode,
      deviceType: input.deviceType,
      brand: input.brand,
      model: input.model,
      serialNumber: input.serialNumber || null,
      priority: input.priority,
      problemDescription: input.problemDescription,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      operatingSystem: "Other",
      ticketId,
    });
    
    // Upload images if provided
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
          console.error("Azure Storage upload failed for service request image:", storageErr);
        }
      }
    }
    
    return c.json({
      success: true,
      message: "Service request submitted successfully",
      ticketId,
      bookingId,
      images: uploadedImages,
    }, 201);
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to submit request" }, 500);
  }
});

// ==========================================
// 2. TRACK GUEST SERVICE REQUEST
// ==========================================
serviceRequestRouter.get("/track", async (c: any) => {
  const db = getDb(c.env.DATABASE_URL);
  const ticketId = c.req.query("ticketId");
  const phone = c.req.query("phone");
  
  if (!ticketId || !phone) {
    return c.json({ success: false, error: "Missing ticketId or phone parameter" }, 400);
  }
  
  try {
    const bookingRecord = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.ticketId, ticketId), eq(bookings.phone, phone)));
      
    if (bookingRecord.length === 0) {
      return c.json({ success: false, error: "No matching request found for this Ticket ID and Mobile Number." }, 404);
    }
    
    const booking = bookingRecord[0];
    
    // Fetch technician/engineer details if assigned
    let technician = null;
    if (booking.engineerId) {
      const engRecord = await db
        .select()
        .from(engineers)
        .where(eq(engineers.id, booking.engineerId));
        
      if (engRecord.length > 0) {
        const engUser = await db
          .select()
          .from(users)
          .where(eq(users.id, engRecord[0].userId));
          
        if (engUser.length > 0) {
          technician = {
            name: engUser[0].fullName,
            phone: engRecord[0].phone,
            bio: engRecord[0].bio || "",
          };
        }
      }
    }
    
    // Build status timeline based on booking.status
    // Timeline stages: Submitted -> Verified -> Technician Assigned -> On The Way -> Work Started -> Completed
    const statusTimeline = [
      { stage: "Submitted", isCompleted: true, date: booking.createdAt },
      { stage: "Verified", isCompleted: booking.status !== "pending", date: booking.status !== "pending" ? booking.updatedAt : null },
      { stage: "Technician Assigned", isCompleted: !!booking.engineerId, date: booking.engineerId ? booking.updatedAt : null },
      { stage: "On The Way", isCompleted: ["in_progress", "completed"].includes(booking.status), date: ["in_progress", "completed"].includes(booking.status) ? booking.updatedAt : null },
      { stage: "Work Started", isCompleted: ["in_progress", "completed"].includes(booking.status), date: ["in_progress", "completed"].includes(booking.status) ? booking.updatedAt : null },
      { stage: "Completed", isCompleted: booking.status === "completed", date: booking.status === "completed" ? booking.updatedAt : null },
    ];
    
    return c.json({
      success: true,
      booking: {
        id: booking.id,
        ticketId: booking.ticketId,
        status: booking.status,
        device: `${booking.brand} ${booking.model} (${booking.deviceType})`,
        priority: booking.priority,
        visitDate: booking.preferredDate,
        visitTime: booking.preferredTime,
        problemDescription: booking.problemDescription,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
      technician,
      timeline: statusTimeline,
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { serviceRequestRouter };
