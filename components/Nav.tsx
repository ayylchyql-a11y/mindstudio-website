import MsLogo from "./MsLogo";
import { apps } from "@/data/apps";

export default function Nav() {
  return (
    <nav>
      <div className="nav-inner">
        <a className="nav-logo" href="#top">
          <MsLogo />
          Mind Studio
        </a>
        <div className="nav-links">
          {apps.map((app) => (
            <a key={app.id} href={`#${app.id}`}>
              {app.name}
            </a>
          ))}
        </div>
        <span className="nav-lang">EN · 中文</span>
      </div>
    </nav>
  );
}
