import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
        fontSize: 64,
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
