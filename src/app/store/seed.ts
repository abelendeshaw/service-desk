import type { ClientArticle, EmailThread, Engineer, Role, SLA, Ticket } from "./types";

const now = () => new Date().toISOString();

function defaultCreatedBy(contactName: string, email = ""): Ticket["createdBy"] {
  const parts = contactName.trim().split(/\s+/).filter(Boolean);
  return {
    name: contactName,
    email,
    initials: ((parts[0]?.[0] ?? "C") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase(),
    role: "Client Contact" as Role,
  };
}

function withCreator(ticket: Omit<Ticket, "createdBy"> & { createdBy?: Ticket["createdBy"] }): Ticket {
  return {
    ...ticket,
    createdBy: ticket.createdBy ?? defaultCreatedBy(ticket.contactName),
  };
}

export const seedEngineers: Engineer[] = [
  { id: "eng-ww", name: "Wongel Wondyifraw", initials: "WW", email: "wongel@ienetworks.co" },
  { id: "eng-ss", name: "Sisay Shiferaw", initials: "SS", email: "sisay@ienetworks.co" },
  { id: "eng-mm", name: "Masresha Melese", initials: "MM", email: "masresha@ienetworks.co" },
  { id: "eng-db", name: "Dawit Bekele", initials: "DB", email: "dawit@ienetworks.co" },
  { id: "eng-md", name: "Mebrate Degu", initials: "MD", email: "mebrate@ienetworks.co" },
];

const rawSeedTickets: Omit<Ticket, "createdBy">[] = [
  {
    id: "00135",
    createdAt: "2026-02-06T09:00:00.000Z",
    updatedAt: "2026-02-06T09:00:00.000Z",
    project: "EPSS",
    contactName: "EPSS Client",
    supportType: "Technical Support",
    subject: "FortiGate, Cisco Switch and server access through WiFi",
    description:
      "All active devices are accessed through only through cables so, now we want to access through WIFI.",
    status: "Open",
    priority: null,
    resolutionDueDate: "2026-02-04",
    assignedEngineerIds: ["eng-ww"],
    assignedEngineerId: "eng-ww",
    assignedAt: "2026-02-06T09:05:00.000Z",
    escalation: null,
    issues: [
      {
        id: "iss-00135-1",
        title: "FortiGate, Cisco Switch and server access through WiFi issue",
        description:
          "Enable secure wireless management access for FortiGate, Cisco switches, and servers.",
        attachments: [],
      },
    ],
    comments: [],
    activity: [
      {
        id: "act-00135-created",
        type: "created",
        createdAt: "2026-02-06T09:00:00.000Z",
        author: { name: "EPSS Client", initials: "EC", role: "Client Contact" },
        detail:
          "All active devices are accessed through only through cables so, now we want to access through WIFI.",
      },
      {
        id: "act-00135-assigned",
        type: "assigned",
        createdAt: "2026-02-06T09:05:00.000Z",
        author: { name: "System", initials: "SY", role: "System" },
        engineer: { id: "eng-ww", name: "Wongel Wondyifraw", initials: "WW" },
      },
    ],
    source: { type: "manual" },
  },
  {
    id: "00136",
    createdAt: "2026-02-07T08:20:00.000Z",
    updatedAt: "2026-02-08T12:10:00.000Z",
    project: "MoTI",
    contactName: "MoTI Client",
    supportType: "Network Support",
    subject: "Branch connectivity flapping on IPSec tunnel (peak hours)",
    description:
      "IPSec tunnel to the branch is flapping between 09:00–12:00. Users report intermittent access to ERP and file shares.",
    status: "In Progress",
    priority: "High",
    resolutionDueDate: "2026-02-10",
    assignedEngineerIds: ["eng-db"],
    assignedEngineerId: "eng-db",
    assignedAt: "2026-02-07T08:45:00.000Z",
    escalation: null,
    issues: [
      {
        id: "iss-00136-1",
        title: "Intermittent IPSec tunnel drops",
        description: "Identify root cause (ISP vs device) and stabilize the tunnel.",
        attachments: [],
      },
    ],
    comments: [],
    activity: [
      {
        id: "act-00136-created",
        type: "created",
        createdAt: "2026-02-07T08:20:00.000Z",
        author: { name: "MoTI Client", initials: "MC", role: "Client Contact" },
        detail: "Tunnel drops intermittently; impact on ERP access.",
      },
      {
        id: "act-00136-assigned",
        type: "assigned",
        createdAt: "2026-02-07T08:45:00.000Z",
        author: { name: "Support Coordinator", initials: "SC", role: "Support Coordinator" },
        engineer: { id: "eng-db", name: "Dawit Bekele", initials: "DB" },
      },
      {
        id: "act-00136-status",
        type: "status",
        createdAt: "2026-02-07T09:10:00.000Z",
        author: { name: "System", initials: "SY", role: "System" },
        from: "Open",
        to: "In Progress",
        reason: "Engineer started investigation",
      },
    ],
    source: { type: "manual" },
  },
  {
    id: "00137",
    createdAt: "2026-02-08T07:05:00.000Z",
    updatedAt: "2026-02-08T15:30:00.000Z",
    project: "MinT",
    contactName: "MinT Client",
    supportType: "Technical Support",
    subject: "New user onboarding: create AD accounts for 5 staff",
    description:
      "Create AD accounts and mailbox access for 5 new staff. Provide initial password policy and group membership.",
    status: "Resolved",
    priority: "Medium",
    resolutionDueDate: "2026-02-09",
    assignedEngineerIds: ["eng-ss"],
    assignedEngineerId: "eng-ss",
    assignedAt: "2026-02-08T07:20:00.000Z",
    escalation: null,
    issues: [
      {
        id: "iss-00137-1",
        title: "Provision accounts + groups",
        description: "Create users, assign groups, and confirm login.",
        attachments: [],
      },
    ],
    comments: [],
    activity: [
      {
        id: "act-00137-created",
        type: "created",
        createdAt: "2026-02-08T07:05:00.000Z",
        author: { name: "MinT Client", initials: "MI", role: "Client Contact" },
      },
      {
        id: "act-00137-assigned",
        type: "assigned",
        createdAt: "2026-02-08T07:20:00.000Z",
        author: { name: "Support Coordinator", initials: "SC", role: "Support Coordinator" },
        engineer: { id: "eng-ss", name: "Sisay Shiferaw", initials: "SS" },
      },
      {
        id: "act-00137-status-1",
        type: "status",
        createdAt: "2026-02-08T07:25:00.000Z",
        author: { name: "System", initials: "SY", role: "System" },
        from: "Open",
        to: "In Progress",
      },
      {
        id: "act-00137-status-2",
        type: "status",
        createdAt: "2026-02-08T15:30:00.000Z",
        author: { name: "System", initials: "SY", role: "System" },
        from: "In Progress",
        to: "Resolved",
      },
    ],
    source: { type: "manual" },
  },
  {
    id: "00138",
    createdAt: "2026-02-09T10:12:00.000Z",
    updatedAt: "2026-02-09T13:40:00.000Z",
    project: "ERA/MOTL",
    contactName: "ERA/MOTL Client",
    supportType: "Maintenance Support",
    subject: "UPS batteries near end-of-life (alarms + short runtime)",
    description:
      "UPS runtime dropped below 5 minutes; frequent alarms. Request assessment and replacement plan.",
    status: "Escalated",
    priority: "Critical",
    resolutionDueDate: "2026-02-09",
    assignedEngineerIds: ["eng-md"],
    assignedEngineerId: "eng-md",
    assignedAt: "2026-02-09T10:20:00.000Z",
    escalation: { target: "Operations Manager", escalatedAt: "2026-02-09T11:05:00.000Z", reason: "Critical power risk" },
    issues: [
      { id: "iss-00138-1", title: "UPS runtime failure", description: "Assess load + battery health; propose replacement.", attachments: [] },
    ],
    comments: [],
    activity: [
      {
        id: "act-00138-created",
        type: "created",
        createdAt: "2026-02-09T10:12:00.000Z",
        author: { name: "ERA/MOTL Client", initials: "ER", role: "Client Contact" },
      },
      {
        id: "act-00138-assigned",
        type: "assigned",
        createdAt: "2026-02-09T10:20:00.000Z",
        author: { name: "Support Coordinator", initials: "SC", role: "Support Coordinator" },
        engineer: { id: "eng-md", name: "Mebrate Degu", initials: "MD" },
      },
      {
        id: "act-00138-escalated",
        type: "escalated",
        createdAt: "2026-02-09T11:05:00.000Z",
        author: { name: "Support Coordinator", initials: "SC", role: "Support Coordinator" },
        target: "Operations Manager",
        reason: "Critical power risk",
      },
    ],
    source: { type: "manual" },
  },
  {
    id: "00139",
    createdAt: "2026-02-10T09:00:00.000Z",
    updatedAt: "2026-02-12T16:15:00.000Z",
    project: "EPSS",
    contactName: "EPSS Client",
    supportType: "General Support",
    subject: "Printer queue stuck on shared office printer",
    description: "Print jobs stuck in queue for multiple users; restart spooler and check drivers.",
    status: "Closed",
    priority: "Low",
    resolutionDueDate: null,
    assignedEngineerIds: ["eng-mm"],
    assignedEngineerId: "eng-mm",
    assignedAt: "2026-02-10T09:10:00.000Z",
    escalation: null,
    issues: [{ id: "iss-00139-1", title: "Stuck print queue", description: "Clear queue and validate printing.", attachments: [] }],
    comments: [],
    activity: [
      { id: "act-00139-created", type: "created", createdAt: "2026-02-10T09:00:00.000Z", author: { name: "EPSS Client", initials: "EC", role: "Client Contact" } },
      { id: "act-00139-assigned", type: "assigned", createdAt: "2026-02-10T09:10:00.000Z", author: { name: "Support Coordinator", initials: "SC", role: "Support Coordinator" }, engineer: { id: "eng-mm", name: "Masresha Melese", initials: "MM" } },
      { id: "act-00139-status-1", type: "status", createdAt: "2026-02-10T09:12:00.000Z", author: { name: "System", initials: "SY", role: "System" }, from: "Open", to: "In Progress" },
      { id: "act-00139-status-2", type: "status", createdAt: "2026-02-10T10:05:00.000Z", author: { name: "System", initials: "SY", role: "System" }, from: "In Progress", to: "Resolved" },
      { id: "act-00139-status-3", type: "status", createdAt: "2026-02-12T16:15:00.000Z", author: { name: "System", initials: "SY", role: "System" }, from: "Resolved", to: "Closed" },
    ],
    source: { type: "manual" },
  },
  {
    id: "00140",
    createdAt: "2026-02-12T08:30:00.000Z",
    updatedAt: "2026-02-12T08:30:00.000Z",
    project: "CSA",
    contactName: "CSA Client",
    supportType: "Security Support",
    subject: "Certificate renewal required for SSL gateway",
    description: "SSL certificate expiring soon; schedule renewal and validate client connectivity.",
    status: "Open",
    priority: "High",
    resolutionDueDate: "2026-02-15",
    assignedEngineerIds: [],
    assignedEngineerId: null,
    assignedAt: null,
    escalation: null,
    issues: [{ id: "iss-00140-1", title: "SSL cert renewal", description: "Renew and deploy cert; validate handshake.", attachments: [] }],
    comments: [],
    activity: [{ id: "act-00140-created", type: "created", createdAt: "2026-02-12T08:30:00.000Z", author: { name: "CSA Client", initials: "CS", role: "Client Contact" } }],
    source: { type: "manual" },
  },
];

export const seedTickets: Ticket[] = rawSeedTickets.map(withCreator);

export const seedEmailThreads: EmailThread[] = [
  {
    id: "EM-001",
    createdAt: "2026-04-15T10:32:00.000Z",
    updatedAt: "2026-04-15T11:52:00.000Z",
    status: "Open",
    priority: "Critical",
    tag: "Network",
    assignedEngineerId: "eng-ww",
    starred: false,
    unread: true,
    linkedTicketId: null,
    messages: [
      {
        id: "msg-em001-1",
        createdAt: "2026-04-15T10:32:00.000Z",
        from: { name: "EPSS Client", email: "epss@gmail.com", initials: "EP" },
        to: [{ name: "Support", email: "support@ienetworks.co" }],
        cc: [],
        subject: "Urgent: FortiGate firewall dropping VPN sessions intermittently",
        body: `Dear Support Team,

We are experiencing frequent VPN session drops on our FortiGate firewall at the Addis Ababa data center. This is affecting remote staff.

Specifically:
- VPN sessions drop approximately every 20-30 minutes
- Re-connection attempts sometimes take 3-5 minutes to succeed
- Affects all users connecting via SSL-VPN on port 10443

Please prioritize this issue.

Best regards,
EPSS Client`,
        attachments: [{ id: "att-log-1", name: "fortigate-logs-20260415.txt", sizeBytes: 245 * 1024 }],
      },
    ],
  },
  {
    id: "EM-002",
    createdAt: "2026-04-14T09:15:00.000Z",
    updatedAt: "2026-04-14T09:15:00.000Z",
    status: "Pending",
    priority: "Low",
    tag: "Access",
    assignedEngineerId: "eng-ss",
    starred: true,
    unread: false,
    linkedTicketId: null,
    messages: [
      {
        id: "msg-em002-1",
        createdAt: "2026-04-14T09:15:00.000Z",
        from: { name: "IE Client", email: "ie@gmail.com", initials: "IE" },
        to: [{ name: "Support", email: "support@ienetworks.co" }],
        cc: [],
        subject: "Request: New user account creation for 3 staff members",
        body: "Good morning, we need to create new Active Directory accounts for 3 new staff joining next Monday. Please find the details attached.",
        attachments: [],
      },
    ],
  },
  {
    id: "EM-003",
    createdAt: "2026-04-13T14:20:00.000Z",
    updatedAt: "2026-04-13T14:20:00.000Z",
    status: "Open",
    priority: "High",
    tag: "Network",
    assignedEngineerId: "eng-db",
    starred: false,
    unread: false,
    linkedTicketId: null,
    messages: [
      {
        id: "msg-em003-1",
        createdAt: "2026-04-13T14:20:00.000Z",
        from: { name: "MinT Client", email: "mint@gmail.com", initials: "MI" },
        to: [{ name: "Support", email: "support@ienetworks.co" }],
        cc: [],
        subject: "Follow-up on network latency issue reported last week",
        body: "We wanted to follow up on the network latency issue we reported last week. The problem persists during peak hours between 9AM and 12PM.",
        attachments: [{ id: "att-em003-1", name: "latency-trace.pcap", sizeBytes: 512 * 1024 }],
      },
    ],
  },
  {
    id: "EM-004",
    createdAt: "2026-04-12T11:00:00.000Z",
    updatedAt: "2026-04-12T11:00:00.000Z",
    status: "Open",
    priority: "Medium",
    tag: "Reporting",
    assignedEngineerId: null,
    starred: false,
    unread: true,
    linkedTicketId: null,
    messages: [
      {
        id: "msg-em004-1",
        createdAt: "2026-04-12T11:00:00.000Z",
        from: { name: "MoTI Client", email: "moti@gmail.com", initials: "MT" },
        to: [{ name: "Support", email: "support@ienetworks.co" }],
        cc: [],
        subject: "Monthly report request — Q1 2026 system uptime and incident summary",
        body: "Please provide the monthly uptime and incident report for Q1 2026. The management team needs this by end of week for their review.",
        attachments: [],
      },
    ],
  },
];

export const seedNotifications = [
  {
    id: "nt-1",
    createdAt: now(),
    title: "Ticket #00135 assigned to Wongel Wondyifraw",
    href: "/tickets/00135",
    unread: true,
    kind: "assignment" as const,
  },
];

export const seedSLAs: SLA[] = [
  {
    id: "SLA-001",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    companyName: "EPSS",
    projectName: "EPSS Enterprise Support",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    notes: "Annual enterprise support agreement covering network, server, and end-user support.",
  },
  {
    id: "SLA-002",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    companyName: "IE",
    projectName: "IE Managed Services",
    startDate: "2026-01-15",
    endDate: "2026-06-14",
    notes: "6-month managed services contract for infrastructure monitoring and maintenance.",
  },
  {
    id: "SLA-003",
    createdAt: "2025-07-01T00:00:00.000Z",
    updatedAt: "2025-07-01T00:00:00.000Z",
    companyName: "ERA/MOTL",
    projectName: "ERA Infrastructure Support",
    startDate: "2025-07-01",
    endDate: "2026-06-30",
    notes: "12-month infrastructure support for road authority network and server systems.",
  },
  {
    id: "SLA-004",
    createdAt: "2025-10-01T00:00:00.000Z",
    updatedAt: "2025-10-01T00:00:00.000Z",
    companyName: "MinT",
    projectName: "MinT Network Support",
    startDate: "2025-10-01",
    endDate: "2026-05-31",
    notes: "Ministry of Innovation & Technology network support and NOC services.",
  },
  {
    id: "SLA-005",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    companyName: "ESLSE",
    projectName: "ESLSE Logistics IT Support",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    notes: "Ethiopian Shipping & Logistics IT support — completed contract.",
  },
  {
    id: "SLA-006",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
    companyName: "MoTI",
    projectName: "MoTI General IT Support",
    startDate: "2026-02-01",
    endDate: "2026-07-31",
    notes: "Ministry of Trade & Industry helpdesk and general IT support.",
  },
  {
    id: "SLA-007",
    createdAt: "2026-05-10T00:00:00.000Z",
    updatedAt: "2026-05-10T00:00:00.000Z",
    companyName: "CBE",
    projectName: "CBE Branch Network Rollout",
    startDate: "2026-06-01",
    endDate: "2027-05-31",
    notes: "Commercial Bank of Ethiopia branch network rollout and 12-month support contract.",
  },
  {
    id: "SLA-008",
    createdAt: "2025-10-01T00:00:00.000Z",
    updatedAt: "2025-10-01T00:00:00.000Z",
    companyName: "Ethio Telecom",
    projectName: "EthioTel Data Centre Support",
    startDate: "2025-10-01",
    endDate: "2026-03-31",
    notes: "Data centre co-location and support services — expired contract pending renewal.",
  },
];

export const seedClientArticles: ClientArticle[] = [
  {
    id: "ca-001",
    company: "EPSS",
    authorId: "client-1",
    authorName: "Alemu Bekele",
    title: "How to reset your network credentials",
    category: "Network",
    content:
      "If you are locked out of the corporate network, contact the helpdesk first. For routine password resets, use the self-service portal at portal.epss.local and follow the verification steps sent to your registered mobile number.",
    status: "Published",
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-02-15T11:30:00.000Z",
    views: 142,
  },
  {
    id: "ca-002",
    company: "EPSS",
    authorId: "client-1",
    authorName: "Alemu Bekele",
    title: "FortiGate VPN setup guide",
    category: "VPN",
    content:
      "Download the FortiClient VPN application, import the EPSS gateway profile, and authenticate with your AD credentials. Ensure split tunneling is enabled for internal resources only.",
    status: "Published",
    createdAt: "2026-01-18T14:00:00.000Z",
    updatedAt: "2026-03-01T08:45:00.000Z",
    views: 98,
  },
  {
    id: "ca-003",
    company: "EPSS",
    authorId: "client-1",
    authorName: "Alemu Bekele",
    title: "Escalation process explained",
    category: "Process",
    content:
      "Critical incidents are escalated automatically after 2 hours without resolution. For high-priority issues, your account manager and IE Networks NOC are notified in parallel.",
    status: "Draft",
    createdAt: "2026-02-20T10:00:00.000Z",
    updatedAt: "2026-02-20T10:00:00.000Z",
    views: 12,
  },
];

