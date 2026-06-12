import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { ThemeProvider } from "./app/components/theme-provider";
import { AuthProvider } from "./app/store/authStore";
import { ServiceDeskProvider } from "./app/store/serviceDeskStore";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <ServiceDeskProvider>
        <App />
      </ServiceDeskProvider>
    </AuthProvider>
  </ThemeProvider>,
);
  