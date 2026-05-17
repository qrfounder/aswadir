import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import i18n from "@/i18n/index.js";
import "@/index.css";

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err, info) {
    console.error("Massar render error:", err, info);
  }

  render() {
    if (this.state.err) {
      const dir = document.documentElement.dir || "ltr";
      return (
        <div
          dir={dir}
          style={{
            fontFamily: "system-ui,sans-serif",
            padding: "2rem",
            maxWidth: 640,
            margin: "0 auto",
            color: "#fecaca",
            background: "#0a0e1a",
            minHeight: "100vh",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
            {i18n.t("appErrors.boundaryTitle")}
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "1rem" }}>
            {i18n.t("appErrors.boundaryHint")}
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "0.75rem",
              background: "#000",
              padding: "1rem",
              borderRadius: 8,
              overflow: "auto",
            }}
          >
            {String(this.state.err)}
            {"\n\n"}
            {this.state.err?.stack || ""}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error(i18n.t("appErrors.rootMissing"));
}

ReactDOM.createRoot(rootEl).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>,
);
