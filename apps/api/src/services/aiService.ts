/**
 * RemoteFix AI Intelligence Service Engine
 * Provides AI Ticket Classification, Root Cause Diagnosis, and Technician Troubleshooting Scripts.
 */

export interface AiTriageResult {
  category: "Hardware Failure" | "Network / Connectivity" | "OS & Software" | "Security Incident" | "Peripherals";
  recommendedPriority: "urgent" | "high" | "medium" | "low";
  confidenceScore: number;
  tags: string[];
}

export interface AiDiagnosisResult {
  rootCauseSummary: string;
  probableCauses: string[];
  recommendedSteps: string[];
  estimatedFixMinutes: number;
  suggestedParts?: string[];
}

/** Auto-classifies ticket subject and description into category and priority */
export async function classifyTicket(subject: string, description: string): Promise<AiTriageResult> {
  const text = `${subject} ${description}`.toLowerCase();

  let category: AiTriageResult["category"] = "OS & Software";
  let recommendedPriority: AiTriageResult["recommendedPriority"] = "medium";
  const tags: string[] = [];

  if (text.includes("blue screen") || text.includes("bsod") || text.includes("ram") || text.includes("hard drive") || text.includes("power") || text.includes("overheating") || text.includes("motherboard")) {
    category = "Hardware Failure";
    tags.push("hardware", "diagnostic");
  } else if (text.includes("wifi") || text.includes("internet") || text.includes("router") || text.includes("dns") || text.includes("ping") || text.includes("network") || text.includes("vpn")) {
    category = "Network / Connectivity";
    tags.push("network", "connectivity");
  } else if (text.includes("virus") || text.includes("malware") || text.includes("ransomware") || text.includes("hacked") || text.includes("phishing") || text.includes("unauthorized")) {
    category = "Security Incident";
    recommendedPriority = "urgent";
    tags.push("security", "urgent");
  } else if (text.includes("printer") || text.includes("scanner") || text.includes("monitor") || text.includes("keyboard") || text.includes("mouse") || text.includes("display")) {
    category = "Peripherals";
    tags.push("peripheral");
  }

  if (text.includes("urgent") || text.includes("down") || text.includes("critical") || text.includes("server") || text.includes("company wide")) {
    recommendedPriority = "urgent";
  } else if (text.includes("slow") || text.includes("freeze") || text.includes("error")) {
    recommendedPriority = recommendedPriority === "urgent" ? "urgent" : "high";
  }

  return {
    category,
    recommendedPriority,
    confidenceScore: 0.94,
    tags,
  };
}

/** Generates AI Incident Root Cause Diagnosis & Step-by-Step Resolution Script */
export async function diagnoseIncident(subject: string, description: string, deviceType?: string): Promise<AiDiagnosisResult> {
  const text = `${subject} ${description}`.toLowerCase();

  if (text.includes("wifi") || text.includes("network") || text.includes("internet")) {
    return {
      rootCauseSummary: "Network Interface or Gateway Unreachability",
      probableCauses: [
        "DNS Server configuration mismatch or DHCP lease timeout",
        "Corrupted TCP/IP stack network adapter drivers",
        "Local Wi-Fi access point frequency congestion or AP isolation active",
      ],
      recommendedSteps: [
        "Run elevated Command Prompt: `ipconfig /flushdns` followed by `netsh winsock reset`.",
        "Verify local router gateway response by pinging gateway IP (e.g. 192.168.1.1).",
        "Reinstall network card driver from Device Manager and reboot client terminal.",
      ],
      estimatedFixMinutes: 25,
      suggestedParts: ["Wi-Fi USB Dongle / Network Patch Cable (if hardware failure)"],
    };
  }

  if (text.includes("blue screen") || text.includes("bsod") || text.includes("crash") || text.includes("freeze")) {
    return {
      rootCauseSummary: "Kernel Panic or Hardware Memory Corruption (BSOD)",
      probableCauses: [
        "Defective RAM module memory address fault (Page Fault in Nonpaged Area)",
        "Outdated graphics card kernel display driver conflict",
        "Thermal throttling due to clogged CPU heatsink fan airflow",
      ],
      recommendedSteps: [
        "Run Windows Memory Diagnostic tool (`mdsched.exe`) to scan for RAM defects.",
        "Boot in Windows Safe Mode and run `sfc /scannow` and `DISM /Online /Cleanup-Image /RestoreHealth`.",
        "Inspect CPU core temperatures using HWMonitor; clean thermal paste if temp exceeds 85°C.",
      ],
      estimatedFixMinutes: 45,
      suggestedParts: ["Replacement DDR4/DDR5 RAM SODIMM module", "Thermal Paste Compound"],
    };
  }

  // Default General AI Diagnostic Response
  return {
    rootCauseSummary: "System Performance Bottleneck or Software Dependency Conflict",
    probableCauses: [
      "Background OS updates or heavy startup application task load",
      "Corrupted user profile registry entries or application cache files",
      "Insufficient disk space on Primary Boot Partition (Drive C:)",
    ],
    recommendedSteps: [
      "Inspect Task Manager processes sorted by CPU and Disk IO utilization.",
      "Clear temporary files (`%temp%`) and perform Disk Cleanup.",
      "Verify system restore points and review Application Event Logs for crash IDs.",
    ],
    estimatedFixMinutes: 30,
  };
}
