export interface KnowledgeDocument {
  id: string;
  title: string;
  category: "hardware" | "network" | "os" | "security" | "amc" | string;
  content: string;
  score?: number;
}

export class RagStore {
  private static docs: KnowledgeDocument[] = [
    {
      id: "kb-001",
      title: "Windows Kernel BSOD Memory Fault Diagnostic",
      category: "hardware",
      content: "When encountering BSOD crashes (PAGE_FAULT_IN_NONPAGED_AREA), run mdsched.exe to test RAM SODIMM modules. Replace defective DDR4/DDR5 sticks. Clear CPU heatsink thermal paste if temps exceed 85°C.",
    },
    {
      id: "kb-002",
      title: "Wi-Fi & DHCP IP Conflict Resolution",
      category: "network",
      content: "For wireless disconnection or invalid IP configuration, launch elevated CMD and run: ipconfig /flushdns && netsh winsock reset. Verify DHCP lease on default gateway 192.168.1.1.",
    },
    {
      id: "kb-003",
      title: "Thermal Throttling & Fan Noise Maintenance",
      category: "hardware",
      content: "Excessive laptop fan noise is caused by dust buildup or dried thermal compound. Clean heatsink fins using compressed air and apply Arctic MX-4 thermal paste.",
    },
    {
      id: "kb-004",
      title: "Enterprise AMC Hardware Warranty SLA Policy",
      category: "amc",
      content: "Platinum AMC contracts guarantee 15-minute response SLA and 4-hour on-site hardware component replacement including NVMe SSDs, motherboards, and power supply units.",
    },
    {
      id: "kb-005",
      title: "Ransomware & Malware Security Isolation Protocol",
      category: "security",
      content: "In case of suspicious file encryption or ransomware alerts, immediately isolate the endpoint device from Wi-Fi and ethernet. Run Windows Defender offline scan and revoke active OAuth tokens.",
    },
  ];

  public static search(query: string, limit = 3): KnowledgeDocument[] {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    const scored = this.docs.map(doc => {
      const text = `${doc.title} ${doc.content}`.toLowerCase();
      let matchCount = 0;
      for (const term of terms) {
        if (text.includes(term)) matchCount++;
      }
      return { ...doc, score: matchCount / (terms.length || 1) };
    });

    return scored
      .filter(d => (d.score || 0) > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  }
}
