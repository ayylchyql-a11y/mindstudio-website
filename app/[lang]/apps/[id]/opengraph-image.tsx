import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { apps, getApp } from "@/data/apps";
import { locales } from "@/lib/i18n";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.flatMap((lang) => apps.map((app) => ({ lang, id: app.id })));
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { id } = await params;
  const app = getApp(id);
  if (!app) {
    return new ImageResponse(<div />, { ...size });
  }

  const iconData = await readFile(join(process.cwd(), "public", app.icon));
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;

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
          background: "linear-gradient(150deg, #f7f7f9 0%, #edeef1 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 620,
            height: 620,
            borderRadius: "50%",
            background: app.gradientCss.replace("linear-gradient(100deg,", "radial-gradient(circle,").replace(")", ", transparent 70%)"),
            opacity: 0.28,
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          width={180}
          height={180}
          style={{ borderRadius: 44, boxShadow: "0 24px 60px rgba(5,5,5,0.22)" }}
          alt=""
        />
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#1a1a1f",
            letterSpacing: -2,
            marginTop: 40,
          }}
        >
          {app.name}
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 500,
            color: "#6e6e73",
            marginTop: 12,
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          {app.tagline.en}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 44,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 26,
            color: "#86868b",
          }}
        >
          Mind Studio · mindstudioapps.com
        </div>
      </div>
    ),
    { ...size }
  );
}
