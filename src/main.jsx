import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/i18n/index.js";
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
      return (
        <div
          dir="rtl"
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
          <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>تعذّر تشغيل الواجهة</h1>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "1rem" }}>
            انسخ النص أدناه أو التقط شاشة لدعم المطوّر. جرّب أيضاً فتح الموقع في نافذة متصفّح عادية خارج
            معاينة Cursor.
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
  throw new Error('عنصر #root غير موجود في index.html');
}

ReactDOM.createRoot(rootEl).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>,
);
