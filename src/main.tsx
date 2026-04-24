
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { ThemeProvider } from "./app/components/theme-provider";
import { ServiceDeskProvider } from "./app/store/serviceDeskStore";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <ServiceDeskProvider>
      <App />
    </ServiceDeskProvider>
  </ThemeProvider>,
);
  