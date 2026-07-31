import { Hono } from "hono";
import { requireAuth, AppEnv } from "../middleware/auth.js";
import { AIRagEngine } from "../services/ai/index.js";

const aiRagRouter = new Hono<AppEnv>();

// ==========================================
// 1. RAG KNOWLEDGE BASE VECTOR SEARCH
// ==========================================
aiRagRouter.post("/search", requireAuth, async (c) => {
  try {
    const { query, limit } = await c.req.json();
    if (!query) {
      return c.json({ success: false, error: "Search query is required." }, 400);
    }

    const docs = AIRagEngine.searchKnowledgeBase(query, limit || 3);
    return c.json({
      success: true,
      query,
      docCount: docs.length,
      documents: docs,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "RAG search failed." }, 500);
  }
});

// ==========================================
// 2. CONTEXTUAL RAG GENERATION CHAT
// ==========================================
aiRagRouter.post("/chat", requireAuth, async (c) => {
  try {
    const { query } = await c.req.json();
    if (!query) {
      return c.json({ success: false, error: "Query text is required." }, 400);
    }

    const result = await AIRagEngine.chatWithRag(query);
    return c.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "RAG generation failed." }, 500);
  }
});

export { aiRagRouter };
