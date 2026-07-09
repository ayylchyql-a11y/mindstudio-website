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

    // Dock magnification on the hero icon row
    const iconRow = document.querySelector<HTMLElement>(".icon-row");
    if (iconRow && finePointer && !reduce) {
      iconRow.classList.add("dock");
      const icons = [...iconRow.querySelectorAll<HTMLElement>(".app-icon")];
      const onMove = (e: MouseEvent) => {
        for (const ic of icons) {
          const r = ic.getBoundingClientRect();
          const d = Math.abs(e.clientX - (r.left + r.width / 2));
          const f = Math.max(0, 1 - d / 190);
          const boost = f * f;
          ic.style.transform = `translateY(${-24 * boost}px) scale(${1 + 0.36 * boost})`;
        }
      };
      const onLeave = () => {
        for (const ic of icons) ic.style.transform = "";
      };
      iconRow.addEventListener("mousemove", onMove);
      iconRow.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        iconRow.removeEventListener("mousemove", onMove);
        iconRow.removeEventListener("mouseleave", onLeave);
      });
    }

    // Phone 3D tilt + glare
    if (finePointer && !reduce) {
      document.querySelectorAll<HTMLElement>(".stage").forEach((stage) => {
        const phone = stage.querySelector<HTMLElement>(".phone");
        if (!phone) return;
        const glare = document.createElement("div");
        glare.className = "glare";
        phone.appendChild(glare);
        const onMove = (e: MouseEvent) => {
          const r = phone.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          phone.style.transform = `rotateY(${nx * 10}deg) rotateX(${-ny * 7}deg)`;
          glare.style.setProperty("--gx", `${(nx + 0.5) * 100}%`);
          glare.style.setProperty("--gy", `${(ny + 0.5) * 100}%`);
        };
        const onLeave = () => {
          phone.style.transform = "";
        };
        stage.addEventListener("mousemove", onMove);
        stage.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          stage.removeEventListener("mousemove", onMove);
          stage.removeEventListener("mouseleave", onLeave);
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
