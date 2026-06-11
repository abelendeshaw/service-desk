import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
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
import { EmailSupportDetail } from "./pages/EmailSupportDetail";
import { CreateEmailSupport } from "./pages/CreateEmailSupport";
import { Settings } from "./pages/Settings";
import { Reports } from "./pages/Reports";
import { ReportDetail } from "./pages/ReportDetail";
import { ClientDashboard } from "./pages/ClientDashboard";
import { EngineerDashboard } from "./pages/EngineerDashboard";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "tickets", Component: Tickets },
      { path: "tickets/:id", Component: TicketDetail },
      { path: "tickets/:id/edit", Component: EditTicket },
      { path: "tickets/new", Component: CreateTicket },
      { path: "contacts", Component: Contacts },
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
      { path: "email-support/new", Component: CreateEmailSupport },
      { path: "email-support/:id", Component: EmailSupportDetail },
      { path: "reports", Component: Reports },
      { path: "reports/:id", Component: ReportDetail },
      { path: "client-dashboard", Component: ClientDashboard },
      { path: "engineer-dashboard", Component: EngineerDashboard },
      { path: "settings", Component: Settings },
    ],
  },
]);
