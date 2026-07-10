import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(150deg, #f6f7f9 0%, #eef0f4 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(166,220,245,0.55), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -120,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,205,232,0.5), transparent 70%)",
          }}
        />

        <svg width="132" height="132" viewBox="0 0 1024 1024" style={{ marginBottom: 40 }}>
          <rect width="1024" height="1024" rx="230" fill="#050505" />
          <rect x="64" y="64" width="896" height="896" rx="196" fill="none" stroke="#F7F4EC" strokeWidth="44" />
          <path
            d="M278 310V708 M746 310V708 M278 310L746 708 M746 310L278 708"
            fill="none"
            stroke="#F7F4EC"
            strokeWidth="40"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="278" cy="310" r="64" fill="#050505" stroke="#F7F4EC" strokeWidth="36" />
          <circle cx="746" cy="310" r="64" fill="#050505" stroke="#F7F4EC" strokeWidth="36" />
          <circle cx="278" cy="708" r="64" fill="#050505" stroke="#F7F4EC" strokeWidth="36" />
          <circle cx="746" cy="708" r="64" fill="#050505" stroke="#F7F4EC" strokeWidth="36" />
          <circle cx="512" cy="512" r="62" fill="#050505" stroke="#2F6FFF" strokeWidth="32" />
        </svg>

        <div style={{ fontSize: 40, fontWeight: 600, color: "#6e6e73", letterSpacing: 2 }}>
          MIND STUDIO
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            color: "#1a1a1f",
            letterSpacing: -2,
            marginTop: 14,
          }}
        >
          A family of apps.
        </div>
        <div style={{ fontSize: 30, color: "#86868b", marginTop: 30 }}>mindstudioapps.com</div>
      </div>
    ),
    { ...size }
  );
}
