/* eslint-disable @next/next/no-img-element */
import MsLogo from "./MsLogo";
import { apps } from "@/data/apps";

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="brand-mark rv">
        <MsLogo label="Mind Studio logo" />
      </div>
      <p className="eyebrow rv">Mind Studio · Independent App Workshop</p>
      <h1 className="rv rv-d1">
        One maker.
        <br />
        <span className="shimmer">A family of apps.</span>
      </h1>
      <p className="sub rv rv-d2">
        Small, honest apps for iPhone, crafted at Mind Studio — a one-person workshop where every
        app is designed, built and polished by the same pair of hands.
      </p>
      <div className="icon-row rv rv-d2">
        {apps.map((app) => (
          <a key={app.id} className="app-icon" href={`#${app.id}`} aria-label={app.name}>
            <img src={app.icon} alt={`${app.name} icon`} />
          </a>
        ))}
      </div>
      <span className="scroll-hint">Scroll</span>
    </header>
  );
}
