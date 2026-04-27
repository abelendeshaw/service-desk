export type TicketStatus =
  | "Open"
  | "In Progress"
  | "Escalated"
  | "Resolved"
  | "Closed";

export type TicketPriority = "Critical" | "High" | "Medium" | "Low" | null;

export type EscalationTarget =
  | "Team Lead"
  | "Support Manager"
  | "Operations Manager"
  | "Vendor"
  | "Client Management";

export type Role = "Client Contact" | "Support Coordinator" | "Field Engineer" | "System";

export type Attachment = {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType?: string;
};

export type TicketIssue = {
  id: string;
  title: string;
  description: string;
  attachments: Attachment[];
};

export type TicketComment = {
  id: string;
  createdAt: string;
  author: { name: string; initials: string; role: Role };
  body: string;
  internal: boolean;
  attachments: Attachment[];
};

export type TicketActivity =
  | {
      id: string;
      type: "created";
      createdAt: string;
      author: { name: string; initials: string; role: Role };
      detail?: string;
    }
  | {
      id: string;
      type: "status";
      createdAt: string;
      author: { name: string; initials: string; role: Role };
      from: TicketStatus;
      to: TicketStatus;
      reason?: string;
    }
  | {
      id: string;
      type: "assigned";
      createdAt: string;
      author: { name: string; initials: string; role: Role };
      engineer: { id: string; name: string; initials: string };
    }
  | {
      id: string;
      type: "escalated";
      createdAt: string;
      author: { name: string; initials: string; role: Role };
      target: EscalationTarget;
      reason: string;
    }
  | {
      id: string;
      type: "comment";
      createdAt: string;
      commentId: string;
    };

export type Ticket = {
  id: string;
  createdAt: string;
  updatedAt: string;
  project: string;
  contactName: string;
  supportType: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  resolutionDueDate: string | null;
  assignedEngineerIds: string[];
  assignedEngineerId: string | null;
  assignedAt: string | null;
  escalation: { target: EscalationTarget; escalatedAt: string; reason: string } | null;
  issues: TicketIssue[];
  comments: TicketComment[];
  activity: TicketActivity[];
  source: { type: "manual" } | { type: "email"; emailId: string };
};

export type EmailStatus = "Open" | "Pending" | "Closed";

export type EmailMessage = {
  id: string;
  createdAt: string;
  from: { name: string; email: string; initials: string };
  to: { name: string; email: string }[];
  cc: { name: string; email: string }[];
  subject: string;
  body: string;
  attachments: Attachment[];
};

export type EmailThread = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: EmailStatus;
  priority: Exclude<TicketPriority, null>;
  tag: string | null;
  assignedEngineerId: string | null;
  starred: boolean;
  unread: boolean;
  messages: EmailMessage[];
  linkedTicketId: string | null;
};

export type Engineer = {
  id: string;
  name: string;
  initials: string;
  email: string;
};

export type Notification = {
  id: string;
  createdAt: string;
  title: string;
  detail?: string;
  href?: string;
  unread: boolean;
  kind: "assignment" | "status" | "escalation" | "email" | "system";
};

export type TicketArticleStatus = "Draft" | "Published";

export type TicketArticle = {
  ticketId: string;
  project: string;
  title: string;
  content: string;
  status: TicketArticleStatus;
  createdAt: string;
  updatedAt: string;
};

