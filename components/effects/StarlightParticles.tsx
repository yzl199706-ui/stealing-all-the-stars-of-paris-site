"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StarIcon } from "./StarIcon";

type Scene = "burning" | "paris" | "return" | string | undefined;

type DomParticle = {
  id: number;
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  duration: number;
  kind: "burst" | "center" | "trail" | "meteor";
  tone: string;
};

type TrailParticle = {
  active: boolean;
  born: number;
  duration: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  rotation: number;
  spin: number;
  opacity: number;
  stretch: number;
  tone: string;
};

type TrailPointer = {
  ready: boolean;
  x: number;
  y: number;
  time: number;
  distanceUntilNext: number;
};

const MAX_DOM_PARTICLES = 36;
const MAX_TRAIL_PARTICLES = 60;
const TRAIL_MEDIA = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";
const STAR_PATH = "M50 1C56 35 65 44 99 50C65 56 56 65 50 99C44 65 35 56 1 50C35 44 44 35 50 1Z";
const TONES = ["#E5C786", "#FFF2D5", "#D8B978", "#FFF9ED"];
const PARIS_TONES = ["#FFF9ED", "#FFF2D5", "#E5C786"];

const blankTrailParticle = (): TrailParticle => ({
  active: false,
  born: 0,
  duration: 0,
  x: 0,
  y: 0,
  velocityX: 0,
  velocityY: 0,
  size: 0,
  rotation: 0,
  spin: 0,
  opacity: 0,
  stretch: 1,
  tone: TONES[0],
});

function sceneAt(x: number, y: number): Scene {
  return document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-scene]")?.dataset.scene;
}

function randomTone(scene: Scene) {
  const palette = scene === "paris" ? PARIS_TONES : TONES;
  return palette[Math.floor(Math.random() * palette.length)];
}

function randomSpacing(speed: number, scene: Scene) {
  let minimum = 15;
  let maximum = 25;

  if (speed >= 1.25) {
    minimum = 8;
    maximum = 15;
  } else if (speed >= 0.55) {
    minimum = 12;
    maximum = 19;
  }

  const quietMultiplier = scene === "burning" ? 1.75 : 1;
  return (minimum + Math.random() * (maximum - minimum)) * quietMultiplier;
}

export function StarlightParticles() {
  const [particles, setParticles] = useState<DomParticle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const serial = useRef(0);
  const removalTimers = useRef(new Map<number, number>());
  const touchPrevious = useRef({ x: 0, y: 0, time: 0 });

  const reducedMotion = useCallback(
    () => window.matchMedia(REDUCED_MOTION_MEDIA).matches,
    [],
  );

  const spawnDomParticles = useCallback((x: number, y: number, burst = false) => {
    if (reducedMotion()) return;

    const scene = sceneAt(x, y);
    const satelliteCount = scene === "burning" ? 3 : 6 + Math.floor(Math.random() * 5);
    const count = burst ? satelliteCount + 1 : 1;
    const created = Array.from({ length: count }, (_, index): DomParticle => {
      const center = burst && index === 0;
      const angle = Math.random() * Math.PI * 2;
      const distance = center ? 0 : burst ? 20 + Math.random() * 54 : 3 + Math.random() * 14;
      const meteor = scene === "paris" && burst && index === 1 && Math.random() > 0.7;
      const kind: DomParticle["kind"] = meteor ? "meteor" : center ? "center" : burst ? "burst" : "trail";

      return {
        id: ++serial.current,
        x,
        y,
        size: center ? 21 : burst ? 4 + Math.random() * 7 : 4 + Math.random() * 5,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - (scene === "return" ? 16 : 0),
        duration: center ? 920 : burst ? 800 + Math.random() * 350 : 460 + Math.random() * 190,
        kind,
        tone: randomTone(scene),
      };
    });

    setParticles((current) => [...current, ...created].slice(-MAX_DOM_PARTICLES));

    const ids = new Set(created.map((item) => item.id));
    const timer = window.setTimeout(() => {
      setParticles((current) => current.filter((item) => !ids.has(item.id)));
      removalTimers.current.delete(timer);
    }, Math.max(...created.map((item) => item.duration)) + 80);
    removalTimers.current.set(timer, timer);
  }, [reducedMotion]);

  useEffect(() => {
    const activeTimers = removalTimers.current;
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      if ((event.target as HTMLElement).closest("[data-no-starlight]")) return;
      spawnDomParticles(event.clientX, event.clientY, true);
    };

    const touchMove = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      const now = performance.now();
      const prior = touchPrevious.current;
      const distance = Math.hypot(event.clientX - prior.x, event.clientY - prior.y);
      if (distance < 31 || now - prior.time < 72) return;
      touchPrevious.current = { x: event.clientX, y: event.clientY, time: now };
      spawnDomParticles(event.clientX, event.clientY);
    };

    const burst = (event: Event) => {
      const point = (event as CustomEvent<{ x: number; y: number }>).detail;
      spawnDomParticles(point.x, point.y, true);
    };

    window.addEventListener("pointerdown", pointerDown, { passive: true });
    window.addEventListener("pointermove", touchMove, { passive: true });
    window.addEventListener("starlight-burst", burst);

    return () => {
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", touchMove);
      window.removeEventListener("starlight-burst", burst);
      activeTimers.forEach(window.clearTimeout);
      activeTimers.clear();
    };
  }, [spawnDomParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const precisePointer = window.matchMedia(TRAIL_MEDIA);
    const reduced = window.matchMedia(REDUCED_MOTION_MEDIA);
    if (!canvas || !precisePointer.matches || reduced.matches) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const starPath = new Path2D(STAR_PATH);
    const pool = Array.from({ length: MAX_TRAIL_PARTICLES }, blankTrailParticle);
    const pointer: TrailPointer = { ready: false, x: 0, y: 0, time: 0, distanceUntilNext: 18 };
    let activeCount = 0;
    let poolCursor = 0;
    let animationFrame = 0;
    let lastFrame = 0;
    let hiddenAt = 0;
    let cssWidth = 0;
    let cssHeight = 0;

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      canvas.width = Math.round(cssWidth * ratio);
      canvas.height = Math.round(cssHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawStar = (particle: TrailParticle, progress: number) => {
      const fadeIn = Math.min(1, progress / 0.1);
      const fadeOut = Math.pow(1 - progress, 1.25);
      const scale = particle.size * (1 - progress * 0.72) / 100;

      context.save();
      context.globalAlpha = particle.opacity * fadeIn * fadeOut;
      context.fillStyle = particle.tone;
      context.shadowColor = particle.tone;
      context.shadowBlur = 3;
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.scale(scale * particle.stretch, scale);
      context.translate(-50, -50);
      context.fill(starPath);
      context.restore();
    };

    const paint = (now: number) => {
      animationFrame = 0;
      const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.034) : 0;
      lastFrame = now;
      context.clearRect(0, 0, cssWidth, cssHeight);

      for (const particle of pool) {
        if (!particle.active) continue;
        const progress = (now - particle.born) / particle.duration;

        if (progress >= 1) {
          particle.active = false;
          activeCount -= 1;
          continue;
        }

        particle.x += particle.velocityX * delta;
        particle.y += particle.velocityY * delta;
        particle.rotation += particle.spin * delta;
        drawStar(particle, progress);
      }

      if (activeCount > 0 && !document.hidden) {
        animationFrame = requestAnimationFrame(paint);
      }
    };

    const startAnimation = () => {
      if (!animationFrame && !document.hidden) {
        lastFrame = performance.now();
        animationFrame = requestAnimationFrame(paint);
      }
    };

    const takeParticle = () => {
      if (activeCount >= MAX_TRAIL_PARTICLES) return null;
      for (let step = 0; step < MAX_TRAIL_PARTICLES; step += 1) {
        const index = (poolCursor + step) % MAX_TRAIL_PARTICLES;
        if (!pool[index].active) {
          poolCursor = (index + 1) % MAX_TRAIL_PARTICLES;
          activeCount += 1;
          return pool[index];
        }
      }
      return null;
    };

    const spawnTrailParticle = (
      x: number,
      y: number,
      directionX: number,
      directionY: number,
      speed: number,
      scene: Scene,
    ) => {
      const particle = takeParticle();
      if (!particle) return;

      const fast = speed >= 1.25;
      const backwardDrift = 5 + Math.min(speed * 4, 13);
      particle.active = true;
      particle.born = performance.now();
      particle.duration = 600 + Math.random() * 600;
      particle.x = x + (Math.random() - 0.5) * 3;
      particle.y = y + (Math.random() - 0.5) * 3;
      particle.velocityX = -directionX * backwardDrift + (Math.random() - 0.5) * 9;
      particle.velocityY = -directionY * backwardDrift - (scene === "return" ? 14 : 5) + (Math.random() - 0.5) * 8;
      particle.size = 3 + Math.random() * 7;
      particle.rotation = Math.random() * Math.PI * 2;
      particle.spin = (Math.random() - 0.5) * 2.4;
      particle.opacity = (scene === "burning" ? 0.4 : 0.56) + Math.random() * 0.28;
      particle.stretch = fast ? 1.1 + Math.random() * 0.48 : 0.9 + Math.random() * 0.22;
      particle.tone = randomTone(scene);
      startAnimation();
    };

    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      const now = performance.now();
      if (!pointer.ready) {
        pointer.ready = true;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.time = now;
        return;
      }

      const deltaX = event.clientX - pointer.x;
      const deltaY = event.clientY - pointer.y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance < 0.5) return;

      const elapsed = Math.max(now - pointer.time, 1);
      const speed = distance / elapsed;
      const directionX = deltaX / distance;
      const directionY = deltaY / distance;
      const scene = sceneAt(event.clientX, event.clientY);
      let alongSegment = pointer.distanceUntilNext;
      let spawned = 0;
      const perEventLimit = scene === "burning" ? 3 : speed >= 1.25 ? 8 : 5;

      while (alongSegment <= distance && spawned < perEventLimit) {
        const progress = alongSegment / distance;
        spawnTrailParticle(
          pointer.x + deltaX * progress,
          pointer.y + deltaY * progress,
          directionX,
          directionY,
          speed,
          scene,
        );
        spawned += 1;
        alongSegment += randomSpacing(speed, scene);
      }

      pointer.distanceUntilNext = Math.max(1, alongSegment - distance);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.time = now;
    };

    const pointerLeave = () => {
      pointer.ready = false;
    };

    const visibilityChange = () => {
      if (document.hidden) {
        hiddenAt = performance.now();
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        return;
      }

      if (hiddenAt) {
        const pausedFor = performance.now() - hiddenAt;
        for (const particle of pool) {
          if (particle.active) particle.born += pausedFor;
        }
        hiddenAt = 0;
      }
      if (activeCount > 0) startAnimation();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pointermove", pointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", pointerLeave);
    document.addEventListener("visibilitychange", visibilityChange);

    return () => {
      cancelAnimationFrame(animationFrame);
      context.clearRect(0, 0, cssWidth, cssHeight);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", pointerMove);
      document.documentElement.removeEventListener("mouseleave", pointerLeave);
      document.removeEventListener("visibilitychange", visibilityChange);
    };
  }, []);

  return (
    <div className="starlight-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="starlight-trail-canvas" />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={`starlight-particle ${particle.kind}`}
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            color: particle.tone,
            "--dx": `${particle.dx}px`,
            "--dy": `${particle.dy}px`,
            "--life": `${particle.duration}ms`,
          } as React.CSSProperties}
        >
          <StarIcon />
        </span>
      ))}
    </div>
  );
}
