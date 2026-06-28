import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

try {
  ReactDOM.createRoot(rootElement).render(
    
      <App />
    
  );
} catch (error) {
  rootElement.innerHTML = `
    <div style="padding: 24px; font-family: Arial, sans-serif;">
      <h1>BidFlow could not start</h1>
      <pre style="white-space: pre-wrap;">${error.message}</pre>
    </div>
  `;
}
