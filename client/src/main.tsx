// Temporarily disable HMR to isolate WebSocket issues
if (import.meta.hot) {
  import.meta.hot.decline();
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);