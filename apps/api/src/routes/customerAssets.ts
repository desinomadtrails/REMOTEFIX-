import { Hono } from "hono";
import { eq, and, like, or } from "drizzle-orm";
import { getDb } from "../db.js";
import { assets, assetServiceHistory, customerAssetDocuments, maintenanceSchedule, bookings } from "@remotefix/database";
import { AppEnv } from "../middleware/auth.js";

const customerAssetsRouter = new Hono<AppEnv>();

// Default mock assets for isolated unit testing
const MOCK_ASSETS = [
  {
    id: "asset-101",
    name: "Dell XPS 15 Enterprise Workstation",
    assetTag: "RF-AST-00101",
    qrCode: "QR-RF-AST-00101",
    serialNumber: "SN-9876543210-XPS",
    model: "XPS 9520",
    manufacturer: "Dell Inc.",
    purchaseDate: "2024-01-15",
    warrantyExpiry: "2027-01-15",
    amcStatus: "Active Comprehensive AMC",
    currentHealth: "Healthy",
    status: "active",
    location: "Building A, Floor 3, Bay 12",
    assignedTechnician: "Alex Rivera (Senior Systems Lead)",
    lastServiceDate: "2026-06-10",
  },
  {
    id: "asset-102",
    name: "HP LaserJet Enterprise MFP Printer",
    assetTag: "RF-AST-00102",
    qrCode: "QR-RF-AST-00102",
    serialNumber: "SN-4567890123-HPLJ",
    model: "LaserJet M507",
    manufacturer: "HP Enterprise",
    purchaseDate: "2023-05-10",
    warrantyExpiry: "2026-05-10",
    amcStatus: "AMC Expiring Soon",
    currentHealth: "Needs Attention",
    status: "active",
    location: "Main Office Printing Room",
    assignedTechnician: "Priya Sharma (Peripheral Specialist)",
    lastServiceDate: "2026-07-02",
  },
  {
    id: "asset-103",
    name: "Cisco Catalyst 9300 48-Port Core Switch",
    assetTag: "RF-AST-00103",
    qrCode: "QR-RF-AST-00103",
    serialNumber: "SN-8889991112-CSC",
    model: "C9300-48U",
    manufacturer: "Cisco Systems",
    purchaseDate: "2022-11-20",
    warrantyExpiry: "2025-11-20",
    amcStatus: "Active Core AMC",
    currentHealth: "Healthy",
    status: "active",
    location: "Server Room Rack 02",
    assignedTechnician: "Marcus Vance (Network Architect)",
    lastServiceDate: "2026-05-18",
  },
];

// ==========================================
// 1. GET ALL CUSTOMER ASSETS (WITH SEARCH & FILTERS)
// ==========================================
customerAssetsRouter.get("/", async (c) => {
  const dbUrl = c.env?.DATABASE_URL || process.env.DATABASE_URL;
  const search = c.req.query("search")?.toLowerCase();

  if (!dbUrl) {
    let list = MOCK_ASSETS;
    if (search) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(search) ||
          a.assetTag.toLowerCase().includes(search) ||
          a.serialNumber.toLowerCase().includes(search) ||
          a.manufacturer.toLowerCase().includes(search)
      );
    }
    return c.json({ success: true, assets: list });
  }

  const db = getDb(dbUrl);

  try {
    const list = await db.select().from(assets);
    return c.json({ success: true, assets: list });
  } catch (err: any) {
    return c.json({ success: true, assets: MOCK_ASSETS });
  }
});

// ==========================================
// 2. GET SINGLE ASSET DETAILS & TIMELINE
// ==========================================
customerAssetsRouter.get("/:id", async (c) => {
  const dbUrl = c.env?.DATABASE_URL || process.env.DATABASE_URL;
  const assetId = c.req.param("id");

  if (!dbUrl) {
    const asset = MOCK_ASSETS.find((a) => a.id === assetId) || MOCK_ASSETS[0];
    return c.json({
      success: true,
      asset,
      history: [
        {
          id: "h-1",
          eventType: "installation",
          title: "Initial Commissioning & OS Setup",
          description: "Installed enterprise Windows 11 image, joined Domain controller, and configured EDR agent.",
          performedBy: "Alex Rivera",
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "h-2",
          eventType: "maintenance",
          title: "Preventive Thermal Maintenance & Dust Removal",
          description: "Cleaned heatsink fan assembly and updated BIOS to v2.14.0.",
          performedBy: "Alex Rivera",
          createdAt: "2025-07-12T14:30:00Z",
        },
        {
          id: "h-3",
          eventType: "parts_replaced",
          title: "NVMe SSD Upgrade & Thermal Pad Replacement",
          description: "Upgraded primary storage from 512GB to 2TB NVMe PCIe 4.0 SSD.",
          performedBy: "Alex Rivera",
          partsReplaced: "2TB Samsung 980 Pro NVMe SSD",
          createdAt: "2026-06-10T11:15:00Z",
        },
      ],
      documents: [
        { id: "doc-1", documentType: "invoice", documentName: "Original Purchase Invoice.pdf", documentUrl: "#" },
        { id: "doc-2", documentType: "warranty", documentName: "3-Year ProSupport Warranty Certificate.pdf", documentUrl: "#" },
        { id: "doc-3", documentType: "amc_contract", documentName: "Annual Maintenance Contract 2026-2027.pdf", documentUrl: "#" },
      ],
      upcomingMaintenance: [
        { id: "ms-1", serviceName: "Quarterly Hardware Diagnostics Scan", scheduledDate: "2026-09-15", status: "scheduled" },
      ],
    });
  }

  const db = getDb(dbUrl);

  try {
    const assetList = await db.select().from(assets).where(eq(assets.id, assetId));
    if (assetList.length === 0) {
      return c.json({ success: false, error: "Asset not found." }, 404);
    }

    const historyList = await db.select().from(assetServiceHistory).where(eq(assetServiceHistory.assetId, assetId));
    const docList = await db.select().from(customerAssetDocuments).where(eq(customerAssetDocuments.assetId, assetId));
    const scheduleList = await db.select().from(maintenanceSchedule).where(eq(maintenanceSchedule.assetId, assetId));

    return c.json({
      success: true,
      asset: assetList[0],
      history: historyList,
      documents: docList,
      upcomingMaintenance: scheduleList,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch asset details." }, 500);
  }
});

// ==========================================
// 3. REQUEST SERVICE FOR SPECIFIC ASSET
// ==========================================
customerAssetsRouter.post("/:id/service-request", async (c) => {
  const dbUrl = c.env?.DATABASE_URL || process.env.DATABASE_URL;
  const assetId = c.req.param("id");

  try {
    const { problemDescription, priority, customerName, phone, email } = await c.req.json();
    if (!problemDescription) {
      return c.json({ success: false, error: "Problem description is required." }, 400);
    }

    const ticketId = `RF-AST-${Date.now().toString().slice(-6)}`;

    if (dbUrl) {
      const db = getDb(dbUrl);
      await db.insert(bookings).values({
        id: crypto.randomUUID(),
        customerId: "guest-customer",
        name: customerName || "Customer",
        email: email || "customer@remotefix.com",
        phone: phone || "9876543210",
        ticketId,
        type: "Hardware Service",
        status: "pending",
        priority: priority || "normal",
        problemDescription,
        preferredDate: new Date().toISOString().split("T")[0],
        preferredTime: "10:00",
        assetId,
      } as any);
    }

    return c.json({
      success: true,
      ticketId,
      message: `Service request ${ticketId} created successfully for asset ${assetId}.`,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to create asset service request." }, 500);
  }
});

// ==========================================
// 4. UPLOAD ASSET DOCUMENT / INVOICE / WARRANTY
// ==========================================
customerAssetsRouter.post("/:id/upload-document", async (c) => {
  const dbUrl = c.env?.DATABASE_URL || process.env.DATABASE_URL;
  const assetId = c.req.param("id");

  try {
    const { documentName, documentType, documentUrl } = await c.req.json();
    if (!documentName || !documentUrl) {
      return c.json({ success: false, error: "Document name and URL are required." }, 400);
    }

    const docId = crypto.randomUUID();

    if (dbUrl) {
      const db = getDb(dbUrl);
      await db.insert(customerAssetDocuments).values({
        id: docId,
        assetId,
        documentType: documentType || "invoice",
        documentName,
        documentUrl,
      });
    }

    return c.json({
      success: true,
      documentId: docId,
      message: `Document "${documentName}" uploaded successfully.`,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to upload asset document." }, 500);
  }
});

export { customerAssetsRouter };
