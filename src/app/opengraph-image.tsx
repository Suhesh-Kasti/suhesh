import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SCHIZO — Suhesh Kasti's Cybersecurity Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#fafaf5",
          fontFamily: "Inter, sans-serif",
          position: "relative",
        }}
      >
        {/* Brutalist border frame */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "4px solid #0a0a0a",
          }}
        />

        {/* Pink accent bar top */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            width: "100%",
            height: 8,
            background: "#ff2d95",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "60px 80px",
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#0a0a0a",
              lineHeight: 1,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Suhesh Kasti
          </h1>

          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#ff2d95",
              marginTop: 16,
              marginBottom: 0,
              textTransform: "uppercase",
            }}
          >
            Application Security Engineer
          </p>

          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 40,
            }}
          >
            {["Web Security", "Exploit Dev", "Malware Analysis", "Red Team"].map(
              (tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0a0a0a",
                    border: "3px solid #0a0a0a",
                    padding: "8px 20px",
                    textTransform: "uppercase",
                  }}
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <p
            style={{
              fontSize: 20,
              color: "#555",
              marginTop: 48,
              marginBottom: 0,
            }}
          >
            suhesh.com.np
          </p>
        </div>

        {/* Bottom yellow accent */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 200,
            height: 8,
            background: "#ffdd00",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
