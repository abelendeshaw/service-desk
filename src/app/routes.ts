import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Tickets } from "./pages/Tickets";
import { TicketDetail } from "./pages/TicketDetail";
import { CreateTicket } from "./pages/CreateTicket";
import { Contacts } from "./pages/Contacts";
import { ContactDetail } from "./pages/ContactDetail";
import { Companies } from "./pages/Companies";
import { CompanyDetail } from "./pages/CompanyDetail";
import { Employees } from "./pages/Employees";
import { EmployeeDetail } from "./pages/EmployeeDetail";
import { EmployeeTeamManagement } from "./pages/EmployeeTeamManagement";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { ArticleDetail } from "./pages/ArticleDetail";
import { CreateArticle } from "./pages/CreateArticle";
import { Support } from "./pages/Support";
import { SupportDetail } from "./pages/SupportDetail";
import { CreateSupport } from "./pages/CreateSupport";
import { EmailSupport } from "./pages/EmailSupport";
import { EmailSupportDetail } from "./pages/EmailSupportDetail";
import { CreateEmailSupport } from "./pages/CreateEmailSupport";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "tickets", Component: Tickets },
      { path: "tickets/:id", Component: TicketDetail },
      { path: "tickets/new", Component: CreateTicket },
      { path: "contacts", Component: Contacts },
      { path: "contacts/:id", Component: ContactDetail },
      { path: "companies", Component: Companies },
      { path: "companies/:id", Component: CompanyDetail },
      { path: "employees", Component: Employees },
      { path: "employees/teams", Component: EmployeeTeamManagement },
      { path: "employees/:id", Component: EmployeeDetail },
      { path: "knowledge", Component: KnowledgeBase },
      { path: "knowledge/new", Component: CreateArticle },
      { path: "knowledge/:id", Component: ArticleDetail },
      { path: "knowledge/edit/:id", Component: CreateArticle },
      { path: "support", Component: Support },
      { path: "support/new", Component: CreateSupport },
      { path: "support/:id", Component: SupportDetail },
      { path: "email-support", Component: EmailSupport },
      { path: "email-support/new", Component: CreateEmailSupport },
      { path: "email-support/:id", Component: EmailSupportDetail },
      { path: "settings", Component: Settings },
    ],
  },
]);
