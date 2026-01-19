import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const revalidate = 86400;

const size = {
  width: 1200,
  height: 630,
};

const clampText = (value: string, maxLength: number) => {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, Math.max(0, maxLength - 1))}…`;
};

const getParam = (params: URLSearchParams, key: string, fallback: string, max = 80) => {
  const value = params.get(key);
  if (!value) {
    return fallback;
  }
  return clampText(value, max);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const theme = searchParams.get("theme") === "light" ? "light" : "dark";

  const eyebrow = getParam(searchParams, "eyebrow", "Competitive Programming", 36);
  const title = getParam(searchParams, "title", "CP Progress", 56);
  const subtitle = getParam(
    searchParams,
    "subtitle",
    "Track your competitive programming journey",
    96,
  );

  const palette =
    theme === "light"
      ? {
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 60%, #cbd5f5 100%)",
          card: "rgba(255, 255, 255, 0.72)",
          text: "#0f172a",
          subtle: "#475569",
          accent: "#2563eb",
          frame: "rgba(15, 23, 42, 0.08)",
        }
      : {
          background: "linear-gradient(135deg, #0b1120 0%, #111827 45%, #1e293b 100%)",
          card: "rgba(15, 23, 42, 0.85)",
          text: "#f8fafc",
          subtle: "#cbd5f5",
          accent: "#38bdf8",
          frame: "rgba(148, 163, 184, 0.18)",
        };

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: palette.background,
        fontFamily: "Inter, system-ui, sans-serif",
        color: palette.text,
        padding: "64px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "28px",
          padding: "56px",
          background: palette.card,
          border: `1px solid ${palette.frame}`,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "22px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: palette.subtle,
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "999px",
              background: palette.accent,
            }}
          />
          {eyebrow}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "28px",
              lineHeight: 1.4,
              color: palette.subtle,
              maxWidth: "80%",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              fontSize: "18px",
              color: palette.subtle,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                background: palette.accent,
                borderRadius: "999px",
              }}
            />
            CP
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: palette.subtle,
            }}
          >
            Competitive Programming
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
