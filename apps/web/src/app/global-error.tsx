"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

// Catches errors thrown by the root layout itself. It replaces the whole
// document, so it must render its own <html>/<body> and can't use the app's
// layout, fonts, or metadata export.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="sv">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <title>Något gick fel — Platsdela</title>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Något gick fel</h1>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>
            Ett allvarligt fel uppstod. Ladda om sidan och försök igen.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              marginTop: "1.5rem",
              padding: "0.6rem 1.2rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#2f6f57",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Försök igen
          </button>
        </div>
      </body>
    </html>
  );
}
