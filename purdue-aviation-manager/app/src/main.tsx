
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";

  // Only run in environments where `document` exists (web). Prevents Expo native bundles from crashing.
  if (typeof document !== "undefined") {
    const rootEl = document.getElementById("root");
    if (rootEl) {
      createRoot(rootEl).render(<App />);
    }
  }
  export default App;