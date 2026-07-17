"use client";

import { useEffect } from "react";

export default function Effects() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    // Reveal on scroll
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.18 }
    );
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = matchMedia("(pointer: fine)").matches;

    // Nav active-section highlight
    const navLinks = [...document.querySelectorAll<HTMLAnchorElement>(".nav-links a")];
    const secIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = "#" + e.target.id;
          navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((s) => secIO.observe(s));
    cleanups.push(() => secIO.disconnect());

    // Dock magnification on the hero icon row.
    // Targets update from the mouse; visuals chase them with spring-like
    // interpolation so the motion has momentum instead of snapping.
    const iconRow = document.querySelector<HTMLElement>(".icon-row");
    if (iconRow && finePointer && !reduce) {
      iconRow.classList.add("dock");
      const icons = [...iconRow.querySelectorAll<HTMLElement>(".app-icon")];
      const cur = icons.map(() => ({ y: 0, s: 1 }));
      const tgt = icons.map(() => ({ y: 0, s: 1 }));
      let raf = 0;
      const tick = () => {
        let settled = true;
        icons.forEach((ic, i) => {
          const c = cur[i];
          const t = tgt[i];
          c.y += (t.y - c.y) * 0.22;
          c.s += (t.s - c.s) * 0.22;
          if (Math.abs(t.y - c.y) > 0.1 || Math.abs(t.s - c.s) > 0.002) {
            settled = false;
          } else {
            c.y = t.y;
            c.s = t.s;
          }
          ic.style.transform =
            c.y === 0 && c.s === 1 ? "" : `translateY(${c.y}px) scale(${c.s})`;
        });
        raf = settled ? 0 : requestAnimationFrame(tick);
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(tick);
      };
      const onMove = (e: MouseEvent) => {
        icons.forEach((ic, i) => {
          const r = ic.getBoundingClientRect();
          const d = Math.abs(e.clientX - (r.left + r.width / 2));
          const f = Math.max(0, 1 - d / 190);
          const boost = f * f;
          tgt[i].y = -24 * boost;
          tgt[i].s = 1 + 0.36 * boost;
        });
        kick();
      };
      const onLeave = () => {
        tgt.forEach((t) => {
          t.y = 0;
          t.s = 1;
        });
        kick();
      };
      iconRow.addEventListener("mousemove", onMove);
      iconRow.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        iconRow.removeEventListener("mousemove", onMove);
        iconRow.removeEventListener("mouseleave", onLeave);
        if (raf) cancelAnimationFrame(raf);
      });
    }

    // Phone 3D tilt + glare, spring-interpolated for the same reason.
    if (finePointer && !reduce) {
      document.querySelectorAll<HTMLElement>(".stage").forEach((stage) => {
        const phone = stage.querySelector<HTMLElement>(".phone");
        if (!phone) return;
        const glare = document.createElement("div");
        glare.className = "glare";
        phone.appendChild(glare);
        const cur = { x: 0, y: 0 };
        const tgt = { x: 0, y: 0 };
        let raf = 0;
        const tick = () => {
          cur.x += (tgt.x - cur.x) * 0.16;
          cur.y += (tgt.y - cur.y) * 0.16;
          const settled =
            Math.abs(tgt.x - cur.x) < 0.002 && Math.abs(tgt.y - cur.y) < 0.002;
          if (settled) {
            cur.x = tgt.x;
            cur.y = tgt.y;
          }
          phone.style.transform =
            cur.x === 0 && cur.y === 0
              ? ""
              : `rotateY(${cur.x * 10}deg) rotateX(${-cur.y * 7}deg)`;
          glare.style.setProperty("--gx", `${(cur.x + 0.5) * 100}%`);
          glare.style.setProperty("--gy", `${(cur.y + 0.5) * 100}%`);
          raf = settled ? 0 : requestAnimationFrame(tick);
        };
        const kick = () => {
          if (!raf) raf = requestAnimationFrame(tick);
        };
        const onMove = (e: MouseEvent) => {
          const r = phone.getBoundingClientRect();
          tgt.x = (e.clientX - r.left) / r.width - 0.5;
          tgt.y = (e.clientY - r.top) / r.height - 0.5;
          kick();
        };
        const onLeave = () => {
          tgt.x = 0;
          tgt.y = 0;
          kick();
        };
        stage.addEventListener("mousemove", onMove);
        stage.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          stage.removeEventListener("mousemove", onMove);
          stage.removeEventListener("mouseleave", onLeave);
          if (raf) cancelAnimationFrame(raf);
          glare.remove();
        });
      });
    }

    // Scroll parallax: phones drift slower than copy
    if (!reduce) {
      const stages = [...document.querySelectorAll<HTMLElement>(".stage")];
      let ticking = false;
      const parallax = () => {
        const mid = innerHeight / 2;
        for (const st of stages) {
          const r = st.getBoundingClientRect();
          const delta = r.top + r.height / 2 - mid;
          const ty = Math.max(-26, Math.min(26, delta * -0.055));
          st.style.transform = `translateY(${ty}px)`;
        }
        ticking = false;
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(parallax);
        }
      };
      addEventListener("scroll", onScroll, { passive: true });
      parallax();
      cleanups.push(() => removeEventListener("scroll", onScroll));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
