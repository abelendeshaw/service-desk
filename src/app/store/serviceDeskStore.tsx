import React from "react";
import { toast } from "sonner";
import { seedEmailThreads, seedEngineers, seedNotifications, seedTickets } from "./seed";
import type {
  Attachment,
  EmailThread,
  Engineer,
  EscalationTarget,
  Notification,
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
};

type Actions = {
  createTicket(input: {
    project: string;
    contactName: string;
    supportType: string;
    subject: string;
    description: string;
    priority: TicketPriority;
    resolutionDueDate: string | null;
    issues: Array<{ title: string; description: string; attachments: Attachment[] }>;
    initialAssignmentEngineerId: string | null;
    initialAssignmentAt: string | null;
  }): string;
  updateTicketStatus(input: { ticketId: string; status: TicketStatus; reason?: string }): void;
  assignTicket(input: { ticketId: string; engineerId: string }): void;
  setTicketEngineers(input: { ticketId: string; engineerIds: string[] }): void;
  escalateTicket(input: { ticketId: string; target: EscalationTarget; reason: string }): void;
  addTicketComment(input: {
    ticketId: string;
    body: string;
    internal: boolean;
    attachments: Attachment[];
  }): void;
  markNotificationsRead(): void;
  convertEmailToTicket(input: { emailId: string; project: string; supportType: string }): string;
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

function loadInitialState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no-store");
    const parsed = JSON.parse(raw) as State;
    if (!parsed?.tickets || !parsed?.emailThreads || !parsed?.engineers) throw new Error("invalid-store");
    const normalizedTickets = parsed.tickets.map((ticket) => ({
      ...ticket,
      assignedEngineerIds:
        Array.isArray((ticket as Ticket & { assignedEngineerIds?: string[] }).assignedEngineerIds)
          ? (ticket as Ticket & { assignedEngineerIds?: string[] }).assignedEngineerIds!
          : ticket.assignedEngineerId
            ? [ticket.assignedEngineerId]
            : [],
    }));
    return {
      engineers: parsed.engineers,
      tickets: normalizedTickets,
      emailThreads: parsed.emailThreads,
      notifications: parsed.notifications ?? [],
      ticketArticles: parsed.ticketArticles ?? {},
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
    };
  }
}

function persistState(state: State) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const ServiceDeskContext = React.createContext<Store | null>(null);

export function ServiceDeskProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(() => loadInitialState());

  const setAndPersist = React.useCallback((updater: (prev: State) => State) => {
    setState((prev) => {
      const next = updater(prev);
      persistState(next);
      return next;
    });
  }, []);

  const notify = React.useCallback(
    (n: Omit<Notification, "id" | "createdAt">) => {
      const id = uid("nt");
      const createdAt = new Date().toISOString();
      setAndPersist((prev) => ({
        ...prev,
        notifications: [{ ...n, id, createdAt }, ...prev.notifications],
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
        const createdBy = { name: input.contactName, initials: initials(input.contactName), role: "Client Contact" as const };
        const newTicket: Ticket = {
          id,
          createdAt: now,
          updatedAt: now,
          project: input.project,
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
        };

        setAndPersist((prev) => {
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

      addTicketComment: ({ ticketId, body, internal, attachments }) => {
        setAndPersist((prev) => {
          const t = prev.tickets.find((x) => x.id === ticketId);
          if (!t) return prev;
          const now = new Date().toISOString();
          const commentId = uid("cmt");
          const updated: Ticket = {
            ...t,
            updatedAt: now,
            comments: [
              {
                id: commentId,
                createdAt: now,
                author: { name: "Field Engineer", initials: "FE", role: "Field Engineer" },
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

      markNotificationsRead: () => {
        setAndPersist((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => ({ ...n, unread: false })),
        }));
      },

      convertEmailToTicket: ({ emailId, project, supportType }) => {
        const created = new Date().toISOString();
        let ticketId = "";

        setAndPersist((prev) => {
          const thread = prev.emailThreads.find((e) => e.id === emailId);
          if (!thread) return prev;
          const first = thread.messages[0];
          const att = first?.attachments ?? [];

          ticketId = String(Math.floor(10000 + Math.random() * 89999)).slice(-5);
          const now = created;

          const newTicket: Ticket = {
            id: ticketId,
            createdAt: now,
            updatedAt: now,
            project,
            contactName: first?.from.name ?? "Client Contact",
            supportType,
            subject: first?.subject ?? `Email intake: ${emailId}`,
            description: first?.body ?? `Converted from email thread ${emailId}`,
            status: "Open",
            priority: thread.priority,
            resolutionDueDate: null,
            assignedEngineerIds: thread.assignedEngineerId ? [thread.assignedEngineerId] : [],
            assignedEngineerId: thread.assignedEngineerId,
            assignedAt: thread.assignedEngineerId ? now : null,
            escalation: null,
            issues: [
              {
                id: uid("iss"),
                title: "Email-reported issue",
                description: "Initial issue captured from inbound email.",
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
          };

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
    }),
    [notify, setAndPersist],
  );

  const store = React.useMemo<Store>(() => ({ ...state, ...actions }), [actions, state]);

  return <ServiceDeskContext.Provider value={store}>{children}</ServiceDeskContext.Provider>;
}

export function useServiceDesk() {
  const ctx = React.useContext(ServiceDeskContext);
  if (!ctx) throw new Error("useServiceDesk must be used within ServiceDeskProvider");
  return ctx;
}

