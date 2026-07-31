import {
  EmbeddingFactory,
  VectorStoreFactory,
  DocumentIngestionPipeline,
  EnterpriseMemoryManager,
  EnterpriseRAGEngine,
} from "../apps/api/src/services/ai/index.js";

async function runPhase8Step4EnterpriseTests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 8 STEP 8.4 - ENTERPRISE RAG & MEMORY TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  async function assert(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASSED: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAILED: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Embedding Provider Test
  await assert("Embedding Provider Abstraction", async () => {
    const provider = EmbeddingFactory.getProvider("Mock");
    const vec = await provider.embedQuery("Test query");
    if (!Array.isArray(vec) || vec.length !== provider.dimensions) {
      throw new Error("Embedding generation failed");
    }
  });

  // 2. Document Chunking & Ingestion Pipeline Test
  await assert("Document Ingestion & Chunking Pipeline", async () => {
    const doc = {
      id: "doc-101",
      title: "Cisco Catalyst Router SOP",
      category: "network",
      content: "This is a comprehensive SOP manual for configuring Cisco Catalyst 9300 enterprise switches and default gateway routing.",
      tenantId: "tenant-acme",
    };

    const chunkCount = await DocumentIngestionPipeline.ingestDocument(doc);
    if (chunkCount === 0) throw new Error("Document ingestion failed");
  });

  // 3. Vector Database Cosine Similarity & Tenant Isolation Search Test
  await assert("Vector Store Cosine Similarity & Tenant Isolation Filter", async () => {
    const vectorStore = VectorStoreFactory.getStore();
    const provider = EmbeddingFactory.getProvider();
    const queryVec = await provider.embedQuery("Cisco switch routing");

    const results = await vectorStore.search(queryVec, { tenantId: "tenant-acme", limit: 3 });
    if (results.length === 0 || results[0].tenantId !== "tenant-acme") {
      throw new Error("Vector search or tenant isolation failed");
    }
  });

  // 4. Enterprise Memory Manager Test
  await assert("Enterprise Memory Manager (Multi-Scope Storage & Conversation Summary)", async () => {
    EnterpriseMemoryManager.saveMemory("customer", "cust-101", { preferredTech: "eng-101", vip: true }, { tenantId: "tenant-acme" });
    const memory = EnterpriseMemoryManager.getMemory("customer", "cust-101", "tenant-acme");

    if (!memory || !memory.vip) throw new Error("Memory retrieval failed");

    const summary = EnterpriseMemoryManager.summarizeConversation([
      { role: "user", content: "Printer spooler crash on Drive C" },
      { role: "assistant", content: "Restart services.msc spooler task" },
    ]);
    if (!summary.includes("Printer spooler crash")) throw new Error("Conversation summarization failed");
  });

  // 5. Enterprise RAG Engine Hybrid Search with Citations Test
  await assert("Enterprise RAG Engine Execution & Citation Generation", async () => {
    const ragResult = await EnterpriseRAGEngine.query("RAM memory fault BSOD page fault", { tenantId: "tenant-acme" });
    if (!ragResult.answer || ragResult.citations.length === 0 || ragResult.confidenceScore < 0.5) {
      throw new Error("Enterprise RAG query execution or citation generation failed");
    }
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Step4EnterpriseTests().catch((err) => {
  console.error("Phase 8 Step 8.4 Enterprise Tests Failed:", err);
  process.exit(1);
});
