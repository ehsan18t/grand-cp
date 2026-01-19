import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const revalidate = 86400;

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: "-0.02em",
      }}
    >
      {siteConfig.name
        .split(" ")
        .map((word) => word[0])
        .join("")}
    </div>,
    {
      ...size,
    },
  );
}
