import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { ClientLayout } from "./components/ClientLayout";
import { EngineerLayout } from "./components/EngineerLayout";
import { RequireStaff } from "./components/RequireAuth";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Tickets } from "./pages/Tickets";
import { TicketDetail } from "./pages/TicketDetail";
import { CreateTicket } from "./pages/CreateTicket";
import { EditTicket } from "./pages/EditTicket";
import { Contacts } from "./pages/Contacts";
import { ContactDetail } from "./pages/ContactDetail";
import { Employees } from "./pages/Employees";
import { UserManagement } from "./pages/UserManagement";
import { EmployeeDetail } from "./pages/EmployeeDetail";
import { EmployeeTeamManagement } from "./pages/EmployeeTeamManagement";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { ArticleDetail } from "./pages/ArticleDetail";
import { CreateArticle } from "./pages/CreateArticle";
import { SLAManagement } from "./pages/SLAManagement";
import { CreateSLA } from "./pages/CreateSLA";
import { SLADetail } from "./pages/SLADetail";
import { ProjectDetail } from "./pages/ProjectDetail";
import { EmailSupportDetail } from "./pages/EmailSupportDetail";
import { CreateEmailSupport } from "./pages/CreateEmailSupport";
import { Settings } from "./pages/Settings";
import { Reports } from "./pages/Reports";
import { ReportDetail } from "./pages/ReportDetail";
import { ClientDashboard } from "./pages/ClientDashboard";
import { EngineerDashboard } from "./pages/EngineerDashboard";
import { ClientTickets } from "./pages/client/ClientTickets";
import { ClientCreateTicket } from "./pages/client/ClientCreateTicket";
import { ClientTicketDetail } from "./pages/client/ClientTicketDetail";
import { ClientKnowledgeBase } from "./pages/client/ClientKnowledgeBase";
import { ClientArticleDetail } from "./pages/client/ClientArticleDetail";
import { ClientAccount } from "./pages/client/ClientAccount";
import { EngineerTickets } from "./pages/engineer/EngineerTickets";
import { EngineerTicketDetail } from "./pages/engineer/EngineerTicketDetail";
import { EngineerKnowledgeBase } from "./pages/engineer/EngineerKnowledgeBase";
import { EngineerAccount } from "./pages/engineer/EngineerAccount";

function StaffShell() {
  return (
    <RequireStaff>
      <MainLayout />
    </RequireStaff>
  );
}

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    path: "/client",
    Component: ClientLayout,
    children: [
      { index: true, Component: ClientDashboard },
      { path: "tickets", Component: ClientTickets },
      { path: "tickets/new", Component: ClientCreateTicket },
      { path: "tickets/:id", Component: ClientTicketDetail },
      { path: "knowledge", Component: ClientKnowledgeBase },
      { path: "knowledge/:id", Component: ClientArticleDetail },
      { path: "account", Component: ClientAccount },
    ],
  },
  {
    path: "/engineer",
    Component: EngineerLayout,
    children: [
      { index: true, Component: EngineerDashboard },
      { path: "tickets", Component: EngineerTickets },
      { path: "tickets/:id", Component: EngineerTicketDetail },
      { path: "knowledge", Component: EngineerKnowledgeBase },
      { path: "knowledge/ticket/:ticketId", Component: ArticleDetail },
      { path: "knowledge/edit/:ticketId", Component: CreateArticle },
      { path: "account", Component: EngineerAccount },
    ],
  },
  {
    path: "/",
    Component: StaffShell,
    children: [
      { index: true, Component: Dashboard },
      { path: "tickets", Component: Tickets },
      { path: "tickets/:id", Component: TicketDetail },
      { path: "tickets/:id/edit", Component: EditTicket },
      { path: "tickets/new", Component: CreateTicket },
      { path: "email-support", element: <Navigate to="/tickets?tab=email" replace /> },
      { path: "clients", Component: Contacts },
      { path: "clients/:id", Component: ContactDetail },
      { path: "contacts", element: <Navigate to="/clients" replace /> },
      { path: "contacts/:id", Component: ContactDetail },
      { path: "employees", Component: UserManagement },
      { path: "employees-list", Component: Employees },
      { path: "employees/teams", Component: EmployeeTeamManagement },
      { path: "employees/:id", Component: EmployeeDetail },
      { path: "knowledge", Component: KnowledgeBase },
      { path: "knowledge/project/:project", Component: KnowledgeBase },
      { path: "knowledge/ticket/:ticketId", Component: ArticleDetail },
      { path: "knowledge/edit/:ticketId", Component: CreateArticle },
      { path: "sla", Component: SLAManagement },
      { path: "sla/new", Component: CreateSLA },
      { path: "sla/:id", Component: SLADetail },
      { path: "projects/:id", Component: ProjectDetail },
      { path: "email-support/new", Component: CreateEmailSupport },
      { path: "email-support/:id", Component: EmailSupportDetail },
      { path: "reports", Component: Reports },
      { path: "reports/:id", Component: ReportDetail },
      { path: "client-dashboard", element: <Navigate to="/client" replace /> },
      { path: "engineer-dashboard", element: <Navigate to="/engineer" replace /> },
      { path: "settings", Component: Settings },
    ],
  },
]);
