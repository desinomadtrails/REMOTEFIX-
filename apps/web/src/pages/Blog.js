import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Clock, Calendar, ArrowLeft, ArrowRight, User } from "lucide-react";
import { Button, Card } from "@remotefix/ui";
const POSTS = [
    {
        id: "blog-1",
        title: "5 Crucial Ways to Secure Your Home Office Network",
        summary: "With remote work becoming standard, home routers have become prime targets for hackers. Learn how to configure firewalls, partition DNS subnets, and audit connected IoT devices.",
        content: `Working from home has revolutionized the modern workforce, but it has also decentralized IT security perimeter controls. A standard residential router is often the weakest link in corporate data safety audits.

### 1. Change Factory Credentials
It sounds elementary, but thousands of routers still run on admin/admin. Always establish a complex, 16-character alphanumeric password for both router admin portals and Wi-Fi networks.

### 2. Segment Your WiFi Subnets
Modern routers allow you to configure 'Guest Networks'. Use this capability to isolate your work laptops from IoT smart devices (like TVs, lightbulbs, or smart plugs). If a smart plug is compromised, the attacker cannot bridge into your corporate subnet.

### 3. Implement WPA3 Encryption
WPA2 is highly vulnerable to offline dictionary password crack attacks. If your hardware supports it, switch your security profiles to WPA3. WPA3 uses SAE (Simultaneous Authentication of Equals) to provide forward secrecy, rendering captured handshakes useless.

### 4. Custom DNS Settings
Instead of using your ISP's default DNS servers (which are often slow and lack security filtering), bind your router to safe recursive resolvers like Cloudflare (1.1.1.3 for malware/family block) or Quad9 (9.9.9.9). This blocks connection attempts to blacklisted phishing nodes at the DNS resolution layer.`,
        author: "Elena Rostova (Cyber Security Architect)",
        date: "July 18, 2026",
        readTime: "5 min read",
        category: "Cyber Security",
    },
    {
        id: "blog-2",
        title: "Demystifying Wi-Fi 7: Is It Time to Upgrade Your Access Points?",
        summary: "An in-depth review of the newly ratified IEEE 802.11be standard. We inspect multi-link operations (MLO), 320MHz channel bounds, and whether your enterprise requires immediate upgrades.",
        content: `Wi-Fi 7 (IEEE 802.11be) has officially entered the enterprise hardware lifecycle. Promising peak data transfer speeds exceeding 40 Gbps, it claims to be a wired Ethernet replacement. But do you actually need it?

### Multi-Link Operation (MLO)
In previous Wi-Fi generations, devices could only transmit data across a single band (2.4GHz, 5GHz, or 6GHz) at any given moment. Wi-Fi 7 MLO enables devices to simultaneously transmit and receive data across multiple frequency bands. This drastically lowers latency jitter, making it perfect for real-time diagnostics and video calls.

### 320 MHz Channel Widths
Wi-Fi 7 doubles the channel width from 160MHz to 320MHz in the 6GHz spectrum. Think of it as doubling the lanes on a highway. This is a massive improvement in high-density office environments with hundreds of active client machines.

### 4096-QAM Modulation
Quadrature Amplitude Modulation (QAM) determines how many bits are encoded in a radio signal. Wi-Fi 7 upgrades this from 1024-QAM to 4096-QAM, yielding a 20% increase in data transmission density for close-range devices.

### Upgrade Recommendation
If your current infrastructure runs on Wi-Fi 6 (802.11ax), an immediate upgrade is likely unnecessary unless you suffer from severe congestion or require ultra-low latency VR/diagnostics. However, if you are still running Wi-Fi 5 (802.11ac), upgrading to Wi-Fi 7 access points will offer a massive, noticeable difference in bandwidth consistency.`,
        author: "Marcus Vance (Lead Network Engineer)",
        date: "July 12, 2026",
        readTime: "6 min read",
        category: "Networking",
    },
    {
        id: "blog-3",
        title: "The 3-2-1 Backup Strategy: Why RAID is Not a Backup",
        summary: "A common IT mistake is assuming RAID storage arrays protect against file deletion or ransomware. Discover the correct architectural approach to data protection.",
        content: `In IT administration, there is a common saying: 'There are two types of hard drives: those that have failed, and those that are going to fail.' Unfortunately, many business owners believe that having a RAID mirror in their server means their data is safe. This is a dangerous misconception.

### RAID is Not Backup
RAID (Redundant Array of Independent Disks) provides hardware fault tolerance. If a drive dies, the system stays online. However, if a user accidentally deletes a folder, or if ransomware encrypts the server, that deletion or encryption is instantly mirrored to all drives in the RAID array. RAID protects against hardware downtime, not data loss.

### The 3-2-1 Rule
To guarantee data survivability, you must follow the industry-standard 3-2-1 backup strategy:

1.  **3 Copies of Data:** Maintain your primary production database plus at least two independent backup copies.
2.  **2 Different Media:** Store your backups on different physical media types (e.g. one on a local NAS server, and one on high-performance NVMe disks).
3.  **1 Off-Site Location:** Keep at least one copy of your data completely outside your main physical facility. Typically, this is achieved by syncing to Azure Blob Storage or an immutable Cloud storage container.

### Immutable Cloud Vaults
When configuring your off-site Cloud backups, ensure you enable 'Object Lock' or 'Immutability'. This prevents backups from being deleted or modified by anyone—even an administrator—for a predefined retention period. This is the ultimate defense against active ransomware seeking to wipe out network backup vaults.`,
        author: "David Miller (Storage Specialist)",
        date: "July 05, 2026",
        readTime: "4 min read",
        category: "Storage",
    },
];
export const Blog = () => {
    const [selectedPostId, setSelectedPostId] = useState(null);
    const activePost = POSTS.find((p) => p.id === selectedPostId);
    return (_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: activePost ? (
        // DETAIL VIEW
        _jsxs("div", { className: "max-w-3xl mx-auto", children: [_jsxs(Button, { variant: "ghost", size: "sm", className: "flex items-center gap-1.5 mb-8", onClick: () => setSelectedPostId(null), children: [_jsx(ArrowLeft, { size: 16 }), "Back to Articles"] }), _jsxs("article", { className: "glass p-8 md:p-12 rounded-2xl border border-border/80", children: [_jsxs("div", { className: "flex flex-wrap gap-4 text-xs text-muted font-body mb-6 items-center", children: [_jsx("span", { className: "bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider font-display", children: activePost.category }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { size: 12 }), activePost.date] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { size: 12 }), activePost.readTime] })] }), _jsx("h1", { className: "text-3xl sm:text-4xl font-black font-display text-text leading-tight mb-6", children: activePost.title }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-text font-body mb-8 border-b border-border/40 pb-4", children: [_jsx(User, { size: 16, className: "text-primary" }), _jsxs("span", { children: ["By ", activePost.author] })] }), _jsx("div", { className: "font-body text-base text-muted leading-relaxed space-y-6 whitespace-pre-line", children: activePost.content })] })] })) : (
        // LIST VIEW
        _jsxs("div", { children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h1", { className: "text-4xl sm:text-5xl font-black font-display text-text", children: "Tech Audit Blog" }), _jsx("p", { className: "text-muted font-body mt-4 max-w-md mx-auto leading-relaxed", children: "IT guides, cybersecurity audits, backup strategies, and hardware reviews written by our certified technicians." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: POSTS.map((post) => (_jsxs(Card, { glowColor: "cyan", className: "flex flex-col h-full hover:-translate-y-1 transition-transform duration-300", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-muted font-body mb-4", children: [_jsx("span", { className: "text-primary font-semibold uppercase tracking-wider font-display", children: post.category }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { size: 12 }), post.date] })] }), _jsx("h3", { className: "text-xl font-bold font-display text-text mb-3 leading-snug", children: post.title }), _jsx("p", { className: "text-sm text-muted font-body leading-relaxed flex-grow mb-6", children: post.summary }), _jsxs("div", { className: "flex items-center justify-between border-t border-border/40 pt-4 mt-auto", children: [_jsxs("span", { className: "flex items-center gap-1 text-xs text-muted font-body", children: [_jsx(Clock, { size: 12 }), post.readTime] }), _jsxs(Button, { variant: "cyber", size: "sm", className: "flex items-center gap-1 text-xs group", onClick: () => setSelectedPostId(post.id), children: ["Read Article", _jsx(ArrowRight, { size: 12, className: "group-hover:translate-x-0.5 transition-transform" })] })] })] }, post.id))) })] })) }));
};
//# sourceMappingURL=Blog.js.map