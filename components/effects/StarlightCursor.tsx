"use client";

import { useEffect, useRef } from "react";

const CURSOR_SIZE = 28;
const CLICKABLE_SELECTOR = "a[href], button:not(:disabled), [role='button'], [data-starlight-interactive]";
const TEXT_CURSOR_SELECTOR = "input, textarea, [contenteditable='true']";

function CursorStarIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <path
      d="M16 2.1 19.55 11.35 29.45 11.85 21.75 18.1 24.35 27.75 16 22.3 7.65 27.75 10.25 18.1 2.55 11.85 12.45 11.35Z"
      fill="#FFD700"
      stroke="#FFF8DC"
      strokeWidth="1.5"
      strokeLinejoin="round"
      paintOrder="stroke fill"
    />
  </svg>;
}

export function StarlightCursor() {
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const cursorElement = cursor.current;
    if (!media.matches || !cursorElement?.querySelector("svg")) return;
    document.documentElement.classList.add("star-cursor-active");
    let frame = 0, burstTimer = 0, x = -100, y = -100;
    const paint = () => { cursorElement.style.transform = `translate3d(${x}px, ${y}px, 0)`; frame = 0; };
    const move = (event: MouseEvent) => {
      cursorElement.classList.remove("is-hidden");
      const target = event.target instanceof Element ? event.target : null;
      const textTarget = Boolean(target?.closest(TEXT_CURSOR_SELECTOR));
      cursorElement.classList.toggle("is-text-target", textTarget);
      cursorElement.classList.toggle("is-interactive", !textTarget && Boolean(target?.closest(CLICKABLE_SELECTOR)));
      x = event.clientX - CURSOR_SIZE / 2;
      y = event.clientY - CURSOR_SIZE / 2;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const enter = () => cursorElement.classList.remove("is-hidden");
    const leave = () => cursorElement.classList.add("is-hidden");
    const down = (event: MouseEvent) => {
      if (event.button !== 0 || cursorElement.classList.contains("is-text-target")) return;
      cursorElement.classList.add("is-bursting");
      window.dispatchEvent(new CustomEvent("starlight-burst", { detail: { x: event.clientX, y: event.clientY } }));
      window.clearTimeout(burstTimer);
      burstTimer = window.setTimeout(() => cursorElement.classList.remove("is-bursting"), 260);
    };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseenter", enter); window.addEventListener("mouseleave", leave); window.addEventListener("mousedown", down);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(burstTimer); document.documentElement.classList.remove("star-cursor-active"); window.removeEventListener("mousemove", move); window.removeEventListener("mouseenter", enter); window.removeEventListener("mouseleave", leave); window.removeEventListener("mousedown", down); };
  }, []);
  return <div ref={cursor} className="star-cursor is-hidden" aria-hidden="true">
    <div className="star-cursor-visual"><CursorStarIcon /></div>
  </div>;
}
