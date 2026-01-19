import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "72px",
        background: "linear-gradient(135deg, #0a0a0a 0%, #111827 100%)",
        color: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          marginBottom: 24,
          letterSpacing: "-0.02em",
        }}
      >
        {siteConfig.name}
      </div>
      <div
        style={{
          fontSize: 28,
          maxWidth: "80%",
          lineHeight: 1.4,
          color: "#cbd5f5",
        }}
      >
        {siteConfig.description}
      </div>
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          fontSize: 22,
          color: "#94a3b8",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Master Competitive Programming
      </div>
    </div>,
    {
      ...size,
    },
  );
}
