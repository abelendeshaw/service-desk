import React from "react";
import { toast } from "sonner";
import { buildClientFromPM, getPMCompany, seedServiceDeskClients, type ClientContactInput, type ServiceDeskClient } from "../lib/clientsData";
import { enrichTicket } from "../lib/ticketProjects";
import { seedClientArticles, seedEmailThreads, seedEngineers, seedNotifications, seedSLAs, seedTickets } from "./seed";
import type {
  Attachment,
  ClientArticle,
  ClientArticleStatus,
  EmailThread,
  Engineer,
  EscalationTarget,
  Notification,
  SLA,
  Ticket,
  TicketArticle,
  TicketArticleStatus,
  TicketPriority,
  TicketStatus,
} from "./types";

type State = {
  engineers: Engineer[];
  tickets: Ticket[];
  emailThreads: EmailThread[];
  notifications: Notification[];
  ticketArticles: Record<string, TicketArticle>;
  clientArticles: ClientArticle[];
  slas: SLA[];
  clients: ServiceDeskClient[];
};

type Actions = {
  createTicket(input: {
    project: string;
    projectName?: string;
    slaId?: string | null;
    category?: string | null;
    contactName: string;
    supportType: string;
    subject: string;
    description: string;
    priority: TicketPriority;
    resolutionDueDate: string | null;
    issues: Array<{ title: string; description: string; attachments: Attachment[] }>;
    initialAssignmentEngineerId: string | null;
    initialAssignmentAt: string | null;
    createdBy?: Ticket["createdBy"];
  }): string;
  updateTicket(input: {
    ticketId: string;
    subject: string;
    description: string;
    project: string;
    contactName: string;
    supportType: string;
    priority: TicketPriority;
    resolutionDueDate: string | null;
    assignedEngineerIds: string[];
  }): void;
  updateTicketStatus(input: { ticketId: string; status: TicketStatus; reason?: string }): void;
  assignTicket(input: { ticketId: string; engineerId: string }): void;
  setTicketEngineers(input: { ticketId: string; engineerIds: string[] }): void;
  escalateTicket(input: { ticketId: string; target: EscalationTarget; reason: string }): void;
  addTicketComment(input: {
    ticketId: string;
    body: string;
    internal: boolean;
    attachments: Attachment[];
    author?: { name: string; initials: string; role: "Client Contact" | "Field Engineer" | "Support Coordinator" | "System" };
  }): void;
  markNotificationsRead(): void;
  markNotificationRead(id: string): void;
  dismissNotification(id: string): void;
  convertEmailToTicket(input: {
    emailId: string;
    project: string;
    projectName: string;
    slaId?: string | null;
    subject: string;
    description: string;
    priority: TicketPriority;
    category: string | null;
    supportType: string;
  }): string;
  confirmTicketResolution(input: { ticketId: string; author: { name: string; initials: string } }): void;
  rejectTicketResolution(input: { ticketId: string; reason: string; author: { name: string; initials: string } }): void;
  addInboundEmail(input: {
    fromName: string;
    fromEmail: string;
    subject: string;
    body: string;
    priority: Exclude<TicketPriority, null>;
    tag?: string | null;
    attachments: Attachment[];
  }): string;
  linkEmailToTicket(input: { emailId: string; ticketId: string }): void;
  getOrCreateTicketArticle(input: { ticketId: string }): TicketArticle;
  updateTicketArticle(input: {
    ticketId: string;
    title: string;
    content: string;
    status: TicketArticleStatus;
  }): void;
  resetToSeed(): void;
  createSLA(input: { companyName: string; projectName: string; startDate: string; endDate: string; notes: string }): string;
  updateSLA(input: { id: string; companyName: string; projectName: string; startDate: string; endDate: string; notes: string }): void;
  deleteSLA(id: string): void;
  importSLAs(rows: Array<{ companyName: string; projectName: string; startDate: string; endDate: string }>): number;
  createClientArticle(input: {
    company: string;
    authorId: string;
    authorName: string;
    title: string;
    category?: string;
    content: string;
    status: ClientArticleStatus;
  }): string;
  updateClientArticle(input: {
    id: string;
    title: string;
    category: string;
    content: string;
    status: ClientArticleStatus;
  }): void;
  incrementClientArticleViews(id: string): void;
  addClientFromPM(pmCompanyId: string, contact?: ClientContactInput): string | null;
  updateClientContact(clientId: string, contact: ClientContactInput): string | null;
};

type Store = State & Actions;

const STORAGE_KEY = "serviceDesk.store.v1";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "");
}

function canTransition(from: TicketStatus, to: TicketStatus) {
  const allowed: Record<TicketStatus, TicketStatus[]> = {
    Open: ["In Progress", "Escalated", "Resolved", "Closed"],
    "In Progress": ["Escalated", "Resolved", "Closed"],
    Escalated: ["In Progress", "Resolved", "Closed"],
    Resolved: ["Closed", "In Progress"],
    Closed: [],
  };
  return allowed[from].includes(to);
}

function normalizeTicket(ticket: Ticket & { createdBy?: Ticket["createdBy"] }, slas: SLA[] = seedSLAs): Ticket {
  const assignedEngineerIds =
    Array.isArray(ticket.assignedEngineerIds) && ticket.assignedEngineerIds.length > 0
      ? ticket.assignedEngineerIds
      : ticket.assignedEngineerId
        ? [ticket.assignedEngineerId]
        : [];
  const createdBy =
    ticket.createdBy ??
    ({
      name: ticket.contactName,
      email: "",
      initials: initials(ticket.contactName),
      role: "Client Contact",
    } satisfies Ticket["createdBy"]);
  return enrichTicket({ ...ticket, assignedEngineerIds, createdBy }, slas);
}

function loadInitialState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no-store");
    const parsed = JSON.parse(raw) as State;
    if (!parsed?.tickets || !parsed?.emailThreads || !parsed?.engineers) throw new Error("invalid-store");
    const normalizedTickets = parsed.tickets.map((ticket) =>
      normalizeTicket(ticket as Ticket, (parsed as State).slas ?? seedSLAs),
    );
    return {
      engineers: parsed.engineers,
      tickets: normalizedTickets,
      emailThreads: parsed.emailThreads,
      notifications: parsed.notifications ?? [],
      ticketArticles: parsed.ticketArticles ?? {},
      clientArticles: (parsed as State).clientArticles ?? seedClientArticles,
      slas: (parsed as State).slas ?? seedSLAs,
      clients: (parsed as State).clients ?? seedServiceDeskClients,
    };
  } catch {
    const seedTicketArticles: Record<string, TicketArticle> = Object.fromEntries(
      seedTickets.map((t) => [
        t.id,
        {
          ticketId: t.id,
          project: t.project,
          title: t.subject,
          content: t.description,
          status: "Draft",
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        } satisfies TicketArticle,
      ]),
    );
    return {
      engineers: seedEngineers,
      tickets: seedTickets,
      emailThreads: seedEmailThreads,
      notifications: seedNotifications,
      ticketArticles: seedTicketArticles,
      clientArticles: seedClientArticles,
      slas: seedSLAs,
      clients: seedServiceDeskClients,
    };
  }
}

function persistState(state: State) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function draftTicketArticle(ticket: Ticket): TicketArticle {
  return {
    ticketId: ticket.id,
    project: ticket.project,
    title: ticket.subject,
    content: ticket.description,
    status: "Draft",
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

const MAX_NOTIFICATIONS = 100;
const PERSIST_DEBOUNCE_MS = 300;

const ServiceDeskStateContext = React.createContext<State | null>(null);
const ServiceDeskActionsContext = React.createContext<Actions | null>(null);

type NotificationsValue = {
  notifications: Notification[];
  markNotificationsRead: Actions["markNotificationsRead"];
  markNotificationRead: Actions["markNotificationRead"];
  dismissNotification: Actions["dismissNotification"];
};

const NotificationsContext = React.createContext<NotificationsValue | null>(null);

export function ServiceDeskProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(() => loadInitialState());
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const setAndPersist = React.useCallback((updater: (prev: State) => State) => {
    setState(updater);
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      persistState(state);
    }, PERSIST_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  React.useEffect(() => {
    const flush = () => persistState(stateRef.current);
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, []);

  const notify = React.useCallback(
    (n: Omit<Notification, "id" | "createdAt">) => {
      const id = uid("nt");
      const createdAt = new Date().toISOString();
      setAndPersist((prev) => ({
        ...prev,
        notifications: [{ ...n, id, createdAt }, ...prev.notifications].slice(0, MAX_NOTIFICATIONS),
      }));
    },
    [setAndPersist],
  );

  const actions: Actions = React.useMemo(
    () => ({
      createTicket: (input) => {
        const id = String(Math.floor(10000 + Math.random() * 89999)).slice(-5);
        const now = new Date().toISOString();
        const assignedAt = input.initialAssignmentEngineerId ? (input.initialAssignmentAt ?? now) : null;
        const createdBy =
          input.createdBy ??
          ({
            name: input.contactName,
            email: "",
            initials: initials(input.contactName),
            role: "Client Contact",
          } satisfies Ticket["createdBy"]);

        setAndPersist((prev) => {
          const newTicket = enrichTicket({
            id,
            createdAt: now,
            updatedAt: now,
            project: input.project,
            projectName: input.projectName ?? input.project,
            slaId: input.slaId ?? null,
            category: input.category ?? null,
            contactName: input.contactName,
            supportType: input.supportType,
            subject: input.subject,
            description: input.description,
            status: "Open",
            priority: input.priority,
            resolutionDueDate: input.resolutionDueDate,
            assignedEngineerIds: input.initialAssignmentEngineerId ? [input.initialAssignmentEngineerId] : [],
            assignedEngineerId: input.initialAssignmentEngineerId,
            assignedAt,
            escalation: null,
            issues: input.issues.map((iss) => ({
              id: uid("iss"),
              title: iss.title,
              description: iss.description,
              attachments: iss.attachments,
            })),
            comments: [],
            activity: [
              {
                id: uid("act"),
                type: "created",
                createdAt: now,
                author: createdBy,
                detail: input.description,
              },
            ],
            source: { type: "manual" },
            createdBy,
          }, prev.slas);

          const nextTicket = { ...newTicket };
          if (input.initialAssignmentEngineerId) {
            const eng = prev.engineers.find((e) => e.id === input.initialAssignmentEngineerId);
            if (eng) {
              nextTicket.activity = [
                ...nextTicket.activity,
                {
                  id: uid("act"),
                  type: "assigned",
                  createdAt: assignedAt ?? now,
                  author: { name: "System", initials: "SY", role: "System" },
                  engineer: { id: eng.id, name: eng.name, initials: eng.initials },
                },
              ];
            }
          }
          const article: TicketArticle = {
            ticketId: nextTicket.id,
            project: nextTicket.project,
            title: nextTicket.subject,
            content: nextTicket.description,
            status: "Draft",
            createdAt: now,
            updatedAt: now,
          };
          return {
            ...prev,
            tickets: [nextTicket, ...prev.tickets],
            ticketArticles: { ...prev.ticketArticles, [nextTicket.id]: prev.ticketArticles[nextTicket.id] ?? article },
          };
        });

        toast.success(`Ticket #${id} created`);
        notify({
          title: `New ticket #${id} created`,
          detail: input.subject,
          href: `/tickets/${id}`,
          unread: true,
          kind: "system",
        });
        return id;
      },

      updateTicket: ({ ticketId, subject, description, project, contactName, supportType, priority, resolutionDueDate, assignedEngineerIds }) => {
        setAndPersist((prev) => {
          const idx = prev.tickets.findIndex((x) => x.id === ticketId);
          if (idx === -1) return prev;
          const t = prev.tickets[idx]!;
          const updated: Ticket = {
            ...t,
            subject,
            description,
            project,
            contactName,
            supportType,
            priority,
            resolutionDueDate,
            assignedEngineerIds,
            updatedAt: new Date().toISOString(),
          };
          const tickets = [...prev.tickets];
          tickets[idx] = updated;
          return { ...prev, tickets };
        });
        toast.success(`Ticket #${ticketId} updated`);
      },

      updateTicketStatus: ({ ticketId, status: nextStatus, reason }) => {
        setAndPersist((prev) => {
          const t = prev.tickets.find((x) => x.id === ticketId);
          if (!t) return prev;
          if (t.status === nextStatus) return prev;
          if (!canTransition(t.status, nextStatus)) {
            toast.error(`Invalid status transition: ${t.status} → ${nextStatus}`);
            return prev;
          }
          const now = new Date().toISOString();
          const updated: Ticket = {
            ...t,
            status: nextStatus,
            updatedAt: now,
            activity: [
              {
                id: uid("act"),
                type: "status",
                createdAt: now,
                author: { name: "System", initials: "SY", role: "System" },
                from: t.status,
                to: nextStatus,
                reason,
              },
              ...t.activity,
            ],
          };
          notify({
            title: `Ticket #${t.id} status changed`,
            detail: `${t.status} → ${nextStatus}`,
            href: `/tickets/${t.id}`,
            unread: true,
            kind: "status",
          });
          return { ...prev, tickets: prev.tickets.map((x) => (x.id === ticketId ? updated : x)) };
        });
      },

      assignTicket: ({ ticketId, engineerId }) => {
        setAndPersist((prev) => {
          const t = prev.tickets.find((x) => x.id === ticketId);
          const eng = prev.engineers.find((e) => e.id === engineerId);
          if (!t || !eng) return prev;
          const now = new Date().toISOString();
          const updated: Ticket = {
            ...t,
            assignedEngineerIds: [eng.id],
            assignedEngineerId: eng.id,
            assignedAt: now,
            updatedAt: now,
            activity: [
              {
                id: uid("act"),
                type: "assigned",
                createdAt: now,
                author: { name: "Support Coordinator", initials: "SC", role: "Support Coordinator" },
                engineer: { id: eng.id, name: eng.name, initials: eng.initials },
              },
              ...t.activity,
            ],
          };
          toast.success(`Assigned to ${eng.name}`);
          notify({
            title: `Ticket #${t.id} assigned`,
            detail: `Assigned to ${eng.name}`,
            href: `/tickets/${t.id}`,
            unread: true,
            kind: "assignment",
          });
          return { ...prev, tickets: prev.tickets.map((x) => (x.id === ticketId ? updated : x)) };
        });
      },

      setTicketEngineers: ({ ticketId, engineerIds }) => {
        setAndPersist((prev) => {
          const t = prev.tickets.find((x) => x.id === ticketId);
          if (!t) return prev;
          const normalizedIds = Array.from(new Set(engineerIds));
          const now = new Date().toISOString();
          const nextAssignedAt = normalizedIds.length > 0 ? (t.assignedAt ?? now) : null;
          const nextPrimary = normalizedIds[0] ?? null;
          const addedIds = normalizedIds.filter((id) => !t.assignedEngineerIds.includes(id));
          const assignmentActivities = addedIds
            .map((id) => prev.engineers.find((e) => e.id === id))
            .filter((eng): eng is Engineer => Boolean(eng))
            .map((eng) => ({
              id: uid("act"),
              type: "assigned" as const,
              createdAt: now,
              author: { name: "Support Coordinator", initials: "SC", role: "Support Coordinator" as const },
              engineer: { id: eng.id, name: eng.name, initials: eng.initials },
            }));

          const updated: Ticket = {
            ...t,
            assignedEngineerIds: normalizedIds,
            assignedEngineerId: nextPrimary,
            assignedAt: nextAssignedAt,
            updatedAt: now,
            activity: [...assignmentActivities, ...t.activity],
          };
          return { ...prev, tickets: prev.tickets.map((x) => (x.id === ticketId ? updated : x)) };
        });
      },

      escalateTicket: ({ ticketId, target, reason }) => {
        setAndPersist((prev) => {
          const t = prev.tickets.find((x) => x.id === ticketId);
          if (!t) return prev;
          const now = new Date().toISOString();
          const updated: Ticket = {
            ...t,
            status: t.status === "Closed" ? t.status : "Escalated",
            escalation: { target, escalatedAt: now, reason },
            updatedAt: now,
            activity: [
              {
                id: uid("act"),
                type: "escalated",
                createdAt: now,
                author: { name: "Support Coordinator", initials: "SC", role: "Support Coordinator" },
                target,
                reason,
              },
              ...t.activity,
            ],
          };
          toast.message("Ticket escalated", { description: `${target}` });
          notify({
            title: `Ticket #${t.id} escalated`,
            detail: `${target}`,
            href: `/tickets/${t.id}`,
            unread: true,
            kind: "escalation",
          });
          return { ...prev, tickets: prev.tickets.map((x) => (x.id === ticketId ? updated : x)) };
        });
      },

      addTicketComment: ({ ticketId, body, internal, attachments, author }) => {
        setAndPersist((prev) => {
          const t = prev.tickets.find((x) => x.id === ticketId);
          if (!t) return prev;
          const now = new Date().toISOString();
          const commentId = uid("cmt");
          const commentAuthor = author ?? { name: "Field Engineer", initials: "FE", role: "Field Engineer" as const };
          const updated: Ticket = {
            ...t,
            updatedAt: now,
            comments: [
              {
                id: commentId,
                createdAt: now,
                author: commentAuthor,
                body,
                internal,
                attachments,
              },
              ...t.comments,
            ],
            activity: [
              { id: uid("act"), type: "comment", createdAt: now, commentId },
              ...t.activity,
            ],
          };
          notify({
            title: `New comment on ticket #${t.id}`,
            detail: internal ? "Internal note added" : "Client-visible comment added",
            href: `/tickets/${t.id}`,
            unread: true,
            kind: "system",
          });
          return { ...prev, tickets: prev.tickets.map((x) => (x.id === ticketId ? updated : x)) };
        });
        toast.success(internal ? "Internal note added" : "Comment sent");
      },

      confirmTicketResolution: ({ ticketId, author }) => {
        setAndPersist((prev) => {
          const t = prev.tickets.find((x) => x.id === ticketId);
          if (!t || t.status !== "Resolved") return prev;
          const now = new Date().toISOString();
          const updated: Ticket = {
            ...t,
            status: "Closed",
            resolutionConfirmedAt: now,
            updatedAt: now,
            activity: [
              {
                id: uid("act"),
                type: "status",
                createdAt: now,
                author: { name: author.name, initials: author.initials, role: "Client Contact" },
                from: "Resolved",
                to: "Closed",
                reason: "Client confirmed resolution",
              },
              ...t.activity,
            ],
          };
          notify({
            title: `Ticket #${t.id} closed`,
            detail: "Client confirmed resolution",
            href: `/tickets/${t.id}`,
            unread: true,
            kind: "status",
          });
          return { ...prev, tickets: prev.tickets.map((x) => (x.id === ticketId ? updated : x)) };
        });
        toast.success("Resolution confirmed — ticket closed");
      },

      rejectTicketResolution: ({ ticketId, reason, author }) => {
        setAndPersist((prev) => {
          const t = prev.tickets.find((x) => x.id === ticketId);
          if (!t || t.status !== "Resolved") return prev;
          const now = new Date().toISOString();
          const commentId = uid("cmt");
          const updated: Ticket = {
            ...t,
            status: "In Progress",
            updatedAt: now,
            comments: [
              {
                id: commentId,
                createdAt: now,
                author: { name: author.name, initials: author.initials, role: "Client Contact" },
                body: reason,
                internal: false,
                attachments: [],
              },
              ...t.comments,
            ],
            activity: [
              { id: uid("act"), type: "comment", createdAt: now, commentId },
              {
                id: uid("act"),
                type: "status",
                createdAt: now,
                author: { name: author.name, initials: author.initials, role: "Client Contact" },
                from: "Resolved",
                to: "In Progress",
                reason: "Client rejected resolution",
              },
              ...t.activity,
            ],
          };
          notify({
            title: `Ticket #${t.id} reopened`,
            detail: "Client rejected resolution",
            href: `/tickets/${t.id}`,
            unread: true,
            kind: "status",
          });
          return { ...prev, tickets: prev.tickets.map((x) => (x.id === ticketId ? updated : x)) };
        });
        toast.message("Resolution rejected — ticket reopened");
      },

      markNotificationsRead: () => {
        setAndPersist((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => ({ ...n, unread: false })),
        }));
      },

      markNotificationRead: (id: string) => {
        setAndPersist((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => n.id === id ? { ...n, unread: false } : n),
        }));
      },

      dismissNotification: (id: string) => {
        setAndPersist((prev) => ({
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== id),
        }));
      },

      convertEmailToTicket: ({
        emailId,
        project,
        projectName,
        slaId,
        subject,
        description,
        priority,
        category,
        supportType,
      }) => {
        const created = new Date().toISOString();
        let ticketId = "";

        setAndPersist((prev) => {
          const thread = prev.emailThreads.find((e) => e.id === emailId);
          if (!thread) return prev;
          const first = thread.messages[0];
          const att = first?.attachments ?? [];

          ticketId = String(Math.floor(10000 + Math.random() * 89999)).slice(-5);
          const now = created;

          const newTicket = enrichTicket({
            id: ticketId,
            createdAt: now,
            updatedAt: now,
            project,
            projectName,
            slaId: slaId ?? null,
            category,
            contactName: first?.from.name ?? "Client Contact",
            supportType,
            subject,
            description,
            status: "Open",
            priority,
            resolutionDueDate: null,
            assignedEngineerIds: thread.assignedEngineerId ? [thread.assignedEngineerId] : [],
            assignedEngineerId: thread.assignedEngineerId,
            assignedAt: thread.assignedEngineerId ? now : null,
            escalation: null,
            issues: [
              {
                id: uid("iss"),
                title: subject,
                description: description.slice(0, 500),
                attachments: att,
              },
            ],
            comments: [],
            activity: [
              {
                id: uid("act"),
                type: "created",
                createdAt: now,
                author: { name: first?.from.name ?? "Client Contact", initials: first?.from.initials ?? "CC", role: "Client Contact" },
                detail: `Converted from ${emailId}`,
              },
            ],
            source: { type: "email", emailId },
            createdBy: {
              name: first?.from.name ?? "Client Contact",
              email: first?.from.email ?? "",
              initials: first?.from.initials ?? "CC",
              role: "Client Contact",
            },
          }, prev.slas);

          const updatedThread: EmailThread = {
            ...thread,
            linkedTicketId: ticketId,
            updatedAt: now,
          };

          const article: TicketArticle = {
            ticketId,
            project: newTicket.project,
            title: newTicket.subject,
            content: newTicket.description,
            status: "Draft",
            createdAt: now,
            updatedAt: now,
          };

          return {
            ...prev,
            tickets: [newTicket, ...prev.tickets],
            emailThreads: prev.emailThreads.map((e) => (e.id === emailId ? updatedThread : e)),
            ticketArticles: { ...prev.ticketArticles, [ticketId]: prev.ticketArticles[ticketId] ?? article },
          };
        });

        toast.success(`Converted ${emailId} → Ticket #${ticketId}`);
        notify({
          title: `${emailId} converted to ticket`,
          detail: `Ticket #${ticketId}`,
          href: `/tickets/${ticketId}`,
          unread: true,
          kind: "email",
        });
        return ticketId;
      },

      addInboundEmail: ({ fromName, fromEmail, subject, body, priority, tag, attachments }) => {
        const id = `EM-${String(Math.floor(1 + Math.random() * 999)).padStart(3, "0")}`;
        const now = new Date().toISOString();
        const thread: EmailThread = {
          id,
          createdAt: now,
          updatedAt: now,
          status: "Open",
          priority,
          tag: tag ?? null,
          assignedEngineerId: null,
          starred: false,
          unread: true,
          linkedTicketId: null,
          messages: [
            {
              id: uid("msg"),
              createdAt: now,
              from: { name: fromName, email: fromEmail, initials: initials(fromName) },
              to: [{ name: "Support", email: "support@ienetworks.co" }],
              cc: [],
              subject,
              body,
              attachments,
            },
          ],
        };
        setAndPersist((prev) => ({ ...prev, emailThreads: [thread, ...prev.emailThreads] }));
        toast.success(`Inbound email received (${id})`);
        notify({
          title: "New inbound support email",
          detail: subject,
          href: `/email-support/${id}`,
          unread: true,
          kind: "email",
        });
        return id;
      },

      linkEmailToTicket: ({ emailId, ticketId }) => {
        setAndPersist((prev) => ({
          ...prev,
          emailThreads: prev.emailThreads.map((e) =>
            e.id === emailId ? { ...e, linkedTicketId: ticketId, updatedAt: new Date().toISOString() } : e,
          ),
        }));
      },

      getOrCreateTicketArticle: ({ ticketId }) => {
        let article: TicketArticle | null = null;
        setAndPersist((prev) => {
          const existing = prev.ticketArticles[ticketId];
          if (existing) {
            article = existing;
            return prev;
          }
          const t = prev.tickets.find((x) => x.id === ticketId);
          const now = new Date().toISOString();
          const created: TicketArticle = {
            ticketId,
            project: t?.project ?? "Unknown",
            title: t?.subject ?? `Ticket #${ticketId} article`,
            content: t?.description ?? "",
            status: "Draft",
            createdAt: now,
            updatedAt: now,
          };
          article = created;
          return { ...prev, ticketArticles: { ...prev.ticketArticles, [ticketId]: created } };
        });
        // setAndPersist is sync for state update, but article is set in closure
        return article!;
      },

      updateTicketArticle: ({ ticketId, title, content, status }) => {
        setAndPersist((prev) => {
          const existing = prev.ticketArticles[ticketId];
          const now = new Date().toISOString();
          const t = prev.tickets.find((x) => x.id === ticketId);
          const next: TicketArticle = {
            ticketId,
            project: existing?.project ?? t?.project ?? "Unknown",
            title,
            content,
            status,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          };
          notify({
            title: `Knowledge article updated for #${ticketId}`,
            detail: status,
            href: `/knowledge/ticket/${ticketId}`,
            unread: true,
            kind: "system",
          });
          return { ...prev, ticketArticles: { ...prev.ticketArticles, [ticketId]: next } };
        });
        toast.success("Article saved");
      },

      resetToSeed: () => {
        localStorage.removeItem(STORAGE_KEY);
      },

      createSLA: ({ companyName, projectName, startDate, endDate, notes }) => {
        const id = `SLA-${String(Math.floor(100 + Math.random() * 900))}`;
        const now = new Date().toISOString();
        const isDuplicate = (prev: State) =>
          prev.slas.some(
            (s) =>
              s.companyName.toLowerCase() === companyName.toLowerCase() &&
              s.projectName.toLowerCase() === projectName.toLowerCase(),
          );
        let created = false;
        setAndPersist((prev) => {
          if (isDuplicate(prev)) return prev;
          created = true;
          const newSLA: SLA = { id, createdAt: now, updatedAt: now, companyName, projectName, startDate, endDate, notes };
          return { ...prev, slas: [newSLA, ...prev.slas] };
        });
        if (created) {
          toast.success(`SLA ${id} created`);
          notify({ title: `SLA created for ${companyName}`, detail: projectName, href: `/sla/${id}`, unread: true, kind: "system" });
        } else {
          toast.error("Duplicate SLA — same company and project already exists.");
        }
        return id;
      },

      updateSLA: ({ id, companyName, projectName, startDate, endDate, notes }) => {
        const now = new Date().toISOString();
        setAndPersist((prev) => ({
          ...prev,
          slas: prev.slas.map((s) =>
            s.id === id ? { ...s, companyName, projectName, startDate, endDate, notes, updatedAt: now } : s,
          ),
        }));
        toast.success("SLA updated");
      },

      deleteSLA: (id) => {
        setAndPersist((prev) => ({ ...prev, slas: prev.slas.filter((s) => s.id !== id) }));
        toast.success("SLA deleted");
      },

      importSLAs: (rows) => {
        const now = new Date().toISOString();
        let imported = 0;
        setAndPersist((prev) => {
          const next = [...prev.slas];
          for (const row of rows) {
            const duplicate = next.some(
              (s) =>
                s.companyName.toLowerCase() === row.companyName.toLowerCase() &&
                s.projectName.toLowerCase() === row.projectName.toLowerCase(),
            );
            if (duplicate) continue;
            const id = `SLA-${String(Math.floor(100 + Math.random() * 900))}-${Date.now().toString(16).slice(-4)}`;
            next.unshift({ id, createdAt: now, updatedAt: now, notes: "", ...row });
            imported++;
          }
          return { ...prev, slas: next };
        });
        if (imported > 0) toast.success(`Imported ${imported} SLA${imported !== 1 ? "s" : ""}`);
        else toast.warning("No new SLAs imported (duplicates skipped)");
        return imported;
      },

      createClientArticle: ({ company, authorId, authorName, title, category = "General", content, status }) => {
        const id = uid("ca");
        const now = new Date().toISOString();
        setAndPersist((prev) => ({
          ...prev,
          clientArticles: [
            {
              id,
              company,
              authorId,
              authorName,
              title,
              category,
              content,
              status,
              createdAt: now,
              updatedAt: now,
              views: 0,
            },
            ...prev.clientArticles,
          ],
        }));
        toast.success("Article created");
        return id;
      },

      updateClientArticle: ({ id, title, category, content, status }) => {
        const now = new Date().toISOString();
        setAndPersist((prev) => ({
          ...prev,
          clientArticles: prev.clientArticles.map((a) =>
            a.id === id ? { ...a, title, category, content, status, updatedAt: now } : a,
          ),
        }));
        toast.success("Article saved");
      },

      incrementClientArticleViews: (id) => {
        setAndPersist((prev) => ({
          ...prev,
          clientArticles: prev.clientArticles.map((a) =>
            a.id === id ? { ...a, views: a.views + 1 } : a,
          ),
        }));
      },

      addClientFromPM: (pmCompanyId, contact) => {
        const pm = getPMCompany(pmCompanyId);
        if (!pm) {
          toast.error("Company not found in PM");
          return null;
        }
        let createdId: string | null = null;
        let errorMessage: string | null = null;
        setAndPersist((prev) => {
          if (prev.clients.some((c) => c.pmCompanyId === pmCompanyId || c.company === pm.name)) {
            errorMessage = `${pm.name} is already in Service Desk`;
            return prev;
          }
          if (contact?.email.trim()) {
            const email = contact.email.trim().toLowerCase();
            if (prev.clients.some((c) => c.email === email)) {
              errorMessage = "A client with this contact email already exists";
              return prev;
            }
          }
          const client = buildClientFromPM(pm, { contact });
          createdId = client.id;
          return { ...prev, clients: [client, ...prev.clients] };
        });
        if (createdId) {
          toast.success(`${pm.name} added from PM`);
          return createdId;
        }
        toast.error(errorMessage ?? `${pm.name} could not be added`);
        return null;
      },

      updateClientContact: (clientId, contact) => {
        const name = contact.name.trim();
        const email = contact.email.trim().toLowerCase();
        const phone = contact.phone.trim();
        const role = contact.role.trim() || "Primary Contact";
        if (!name || !email) {
          toast.error("Contact name and email are required");
          return null;
        }

        let nextId: string | null = null;
        setAndPersist((prev) => {
          const index = prev.clients.findIndex((c) => c.id === clientId);
          if (index === -1) return prev;
          if (prev.clients.some((c) => c.id !== clientId && c.email === email)) {
            toast.error("A client with this contact email already exists");
            return prev;
          }

          const existing = prev.clients[index];
          const initials =
            name
              .split(/\s+/)
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || existing.initials;

          const updated: ServiceDeskClient = {
            ...existing,
            id: email,
            name,
            email,
            phone,
            role,
            initials,
          };
          nextId = updated.id;
          const clients = [...prev.clients];
          clients[index] = updated;
          return { ...prev, clients };
        });

        if (nextId) {
          toast.success("Contact information saved");
          return nextId;
        }
        return null;
      },
    }),
    [notify, setAndPersist],
  );

  const notificationsValue = React.useMemo<NotificationsValue>(
    () => ({
      notifications: state.notifications,
      markNotificationsRead: actions.markNotificationsRead,
      markNotificationRead: actions.markNotificationRead,
      dismissNotification: actions.dismissNotification,
    }),
    [
      state.notifications,
      actions.markNotificationsRead,
      actions.markNotificationRead,
      actions.dismissNotification,
    ],
  );

  return (
    <ServiceDeskStateContext.Provider value={state}>
      <ServiceDeskActionsContext.Provider value={actions}>
        <NotificationsContext.Provider value={notificationsValue}>
          {children}
        </NotificationsContext.Provider>
      </ServiceDeskActionsContext.Provider>
    </ServiceDeskStateContext.Provider>
  );
}

export function useNotifications() {
  const ctx = React.useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within ServiceDeskProvider");
  return ctx;
}

export function useServiceDesk() {
  const state = React.useContext(ServiceDeskStateContext);
  const actions = React.useContext(ServiceDeskActionsContext);
  if (!state || !actions) throw new Error("useServiceDesk must be used within ServiceDeskProvider");
  return { ...state, ...actions } as Store;
}

