import type { EmailThread, Engineer, Ticket } from "./types";

const now = () => new Date().toISOString();

export const seedEngineers: Engineer[] = [
  { id: "eng-ww", name: "Wongel Wondyifraw", initials: "WW", email: "wongel@ienetworks.co" },
  { id: "eng-ss", name: "Sisay Shiferaw", initials: "SS", email: "sisay@ienetworks.co" },
  { id: "eng-mm", name: "Masresha Melese", initials: "MM", email: "masresha@ienetworks.co" },
  { id: "eng-db", name: "Dawit Bekele", initials: "DB", email: "dawit@ienetworks.co" },
  { id: "eng-md", name: "Mebrate Degu", initials: "MD", email: "mebrate@ienetworks.co" },
];

export const seedTickets: Ticket[] = [
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

