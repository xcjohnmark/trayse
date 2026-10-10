"use client";

import React, { useRef, useState, useEffect } from "react";

interface Fluid3DTiltNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface SpringState {
  pos: number;
  vel: number;
  target: number;
}

export default function Fluid3DTiltNav({
  activeTab,
  setActiveTab,
}: Fluid3DTiltNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Physics simulation state for the suspended cloth membrane
  const springs = useRef({
    rotX: { pos: 0, vel: 0, target: 0 } as SpringState,
    rotY: { pos: 0, vel: 0, target: 0 } as SpringState,
    scale: { pos: 1, vel: 0, target: 1 } as SpringState,
    glareX: { pos: 50, vel: 0, target: 50 } as SpringState,
    glareY: { pos: 50, vel: 0, target: 50 } as SpringState,
    glareOpacity: { pos: 0, vel: 0, target: 0 } as SpringState,
    glareRadius: { pos: 180, vel: 0, target: 180 } as SpringState,
    borderGlow: { pos: 0.1, vel: 0, target: 0.1 } as SpringState,
    isHovering: false,
    rafId: 0,
    lastTime: 0,
  });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    let isRunning = true;

    // Numerical integration of damped harmonic oscillator
    const stepSpring = (
      s: SpringState,
      k: number,
      c: number,
      dt: number
    ) => {
      const displacement = s.pos - s.target;
      const springForce = -k * displacement;
      const dampingForce = -c * s.vel;
      const force = springForce + dampingForce;

      s.vel += force * dt;
      s.pos += s.vel * dt;
    };

    const updatePhysics = (currentTime: number) => {
      if (!isRunning) return;

      const sp = springs.current;
      if (!sp.lastTime) sp.lastTime = currentTime;

      // Delta time capped at 32ms to prevent spiral of death during lag
      const dt = Math.min((currentTime - sp.lastTime) / 1000, 0.032);
      sp.lastTime = currentTime;

      // Dynamic physical constants:
      // While cursor presses down: high tension, moderate damping (feels weighted & responsive)
      // When cursor leaves: lower damping (underdamped harmonic oscillator produces the organic "wobble" settle)
      const kTilt = sp.isHovering ? 200 : 130;
      const cTilt = sp.isHovering ? 24 : 11;

      const kScale = sp.isHovering ? 180 : 120;
      const cScale = sp.isHovering ? 22 : 12;

      // Glare follows with fluid liquid lag
      const kLight = 160;
      const cLight = 18;

      stepSpring(sp.rotX, kTilt, cTilt, dt);
      stepSpring(sp.rotY, kTilt, cTilt, dt);
      stepSpring(sp.scale, kScale, cScale, dt);
      stepSpring(sp.glareX, kLight, cLight, dt);
      stepSpring(sp.glareY, kLight, cLight, dt);
      stepSpring(sp.glareOpacity, 140, 16, dt);
      stepSpring(sp.glareRadius, 140, 16, dt);
      stepSpring(sp.borderGlow, 140, 16, dt);

      if (nav) {
        // 1. 3D DEFORMATION: Membrane tilt & elastic stretch
        nav.style.transform = `perspective(1000px) rotateX(${sp.rotX.pos.toFixed(
          2
        )}deg) rotateY(${sp.rotY.pos.toFixed(
          2
        )}deg) scale3d(${sp.scale.pos.toFixed(3)}, ${sp.scale.pos.toFixed(
          3
        )}, 1)`;

        // 2. SOFT REACTIVE SHADOW: Floor underneath moves opposite to tilt
        // If cursor pushes down on right (positive rotY), shadow shifts left (negative X)
        // If cursor pushes down on top (positive rotX), shadow shifts down
        const shadowOffsetX = (-sp.rotY.pos * 2.2).toFixed(1);
        const shadowOffsetY = (22 + sp.rotX.pos * 1.8).toFixed(1);
        const distanceFactor = Math.hypot(
          sp.rotX.pos / 12,
          sp.rotY.pos / 12
        );
        const shadowBlur = (35 + distanceFactor * 18).toFixed(1);
        const shadowAlpha = (0.45 + distanceFactor * 0.15).toFixed(2);

        nav.style.boxShadow = `
          ${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha}),
          0 8px 18px rgba(0, 0, 0, 0.35),
          inset 0 0 ${(14 + distanceFactor * 8).toFixed(1)}px rgba(255, 255, 255, ${(
          0.06 +
          distanceFactor * 0.08
        ).toFixed(2)})
        `;

        // 3. SPECULAR REALISM: CSS variables for surface glare & border light
        nav.style.setProperty("--glare-x", `${sp.glareX.pos.toFixed(1)}%`);
        nav.style.setProperty("--glare-y", `${sp.glareY.pos.toFixed(1)}%`);
        nav.style.setProperty(
          "--glare-opacity",
          `${Math.max(0, sp.glareOpacity.pos).toFixed(3)}`
        );
        nav.style.setProperty(
          "--glare-radius",
          `${sp.glareRadius.pos.toFixed(0)}px`
        );
        nav.style.setProperty(
          "--border-glow-opacity",
          `${Math.max(0, sp.borderGlow.pos).toFixed(3)}`
        );
      }

      sp.rafId = requestAnimationFrame(updatePhysics);
    };

    const currentSprings = springs.current;
    currentSprings.rafId = requestAnimationFrame(updatePhysics);

    return () => {
      isRunning = false;
      cancelAnimationFrame(currentSprings.rafId);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const nav = navRef.current;
    if (!nav) return;

    const rect = nav.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalized coordinates from center: -1.0 to +1.0
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    // Physical distance from center (0.0 to ~1.41 at corners)
    const distFromCenter = Math.min(1.3, Math.hypot(normX, normY));

    // DYNAMIC TILTING (Sinking membrane under cursor):
    // Top-left cursor (normX < 0, normY < 0) sinks top-left corner into screen:
    // Sinking top: rotateX tilts backward (+rotX)
    // Sinking left: rotateY tilts left backward (-rotY)
    const maxTiltAngle = 12; // degrees
    springs.current.rotX.target = -normY * maxTiltAngle;
    springs.current.rotY.target = normX * maxTiltAngle;

    // ELASTIC SCALING: Fabric stretches under weight; stretches more near edges
    springs.current.scale.target = 1.025 + 0.015 * distFromCenter;

    // GLARE POSITION & SPECULAR INTENSITY:
    // Moves towards cursor; faint (10%) at center, intensifying to 28%-34% at edges
    springs.current.glareX.target = (x / rect.width) * 100;
    springs.current.glareY.target = (y / rect.height) * 100;

    // Sharpness scales: 180px diffuse at center -> 110px concentrated at edges
    springs.current.glareRadius.target = 180 - distFromCenter * 65;

    // Opacity: 0.10 near center -> 0.32 near edges
    springs.current.glareOpacity.target = 0.10 + 0.22 * distFromCenter;

    // Border light catches the specular reflection
    springs.current.borderGlow.target = 0.15 + 0.35 * distFromCenter;
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
    springs.current.isHovering = true;
    springs.current.scale.target = 1.03;
    springs.current.glareOpacity.target = 0.12;
    springs.current.borderGlow.target = 0.2;
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    springs.current.isHovering = false;

    // THE RETURN: Target equilibrium 0, underdamped physics generates the organic wobble/settle
    springs.current.rotX.target = 0;
    springs.current.rotY.target = 0;
    springs.current.scale.target = 1.0;
    springs.current.glareOpacity.target = 0;
    springs.current.borderGlow.target = 0.08;
    springs.current.glareRadius.target = 180;
  };

  return (
    <header className="pt-6 md:pt-8 px-4 flex justify-center w-full [perspective:1000px]">
      <nav
        ref={navRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="relative inline-flex items-center gap-6 sm:gap-8 bg-[#18191e]/90 text-white rounded-full px-2.5 py-1.5 backdrop-blur-md overflow-hidden select-none cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform, box-shadow",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* 
          1. SPECULAR GLARE REFLECTION
          Soft radial spotlight that moves with the cursor, scaling from faint (10%)
          at the center to sharp and bright (30%+) at the edges where cloth curvature peaks
        */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-200"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle var(--glare-radius, 160px) at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.12) 35%, rgba(255, 255, 255, 0.03) 60%, transparent 85%)",
            opacity: "var(--glare-opacity, 0)",
          }}
        />

        {/* 
          2. DYNAMIC BORDER GLOW
          Hairline edge of the cloth catching ambient light as the surface tilts
        */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full p-[1px] transition-opacity duration-200"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle 200px at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.15) 45%, rgba(255, 255, 255, 0.04) 80%, transparent 100%)",
            opacity: "var(--border-glow-opacity, 0.1)",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {/* 
          3. INNER CONTENT WITH MULTI-PLANE 3D PARALLAX
          Elevated along Z-axis to separate optical glass from the floating tactile elements
        */}
        {/* Brand Emblem */}
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          aria-label="Trayse Home"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#23252c] flex items-center justify-center border border-white/15 hover:border-white/35 transition-all shadow-inner group relative z-10 shrink-0"
          style={{ transform: "translateZ(14px)" }}
        >
          <svg
            className="w-[22px] h-[18.5px] sm:w-[26px] sm:h-[21.5px] text-white group-hover:scale-105 transition-transform"
            viewBox="0 0 60 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Column 1 (Left) */}
            <rect x="0" y="0" width="20" height="10" fill="currentColor" />
            <rect x="0" y="20" width="20" height="10" fill="currentColor" />
            <rect x="0" y="40" width="20" height="10" fill="currentColor" />

            {/* Column 2 (Center) */}
            <rect x="20" y="10" width="20" height="10" fill="currentColor" />
            <rect x="20" y="30" width="20" height="10" fill="currentColor" />

            {/* Column 3 (Right) */}
            <rect x="40" y="0" width="20" height="10" fill="currentColor" />
            <rect x="40" y="20" width="20" height="10" fill="currentColor" />
            <rect x="40" y="40" width="20" height="10" fill="currentColor" />
          </svg>
        </button>

        {/* Navigation Links (Urbanist Medium + Tight Tracking) */}
        <div
          className="font-sans flex items-center gap-5 sm:gap-7 text-[13px] font-medium tracking-[-0.03em] relative z-10"
          style={{ transform: "translateZ(9px)" }}
        >
          <button
            onClick={() => setActiveTab("explore")}
            className={`transition-colors ${
              activeTab === "explore"
                ? "text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`transition-colors ${
              activeTab === "resources"
                ? "text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`transition-colors ${
              activeTab === "faq"
                ? "text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            FAQ
          </button>
        </div>

        {/* Right Action Button (Urbanist SemiBold) */}
        <button
          onClick={() => {
            window.location.href = "/terminal";
          }}
          className="font-sans bg-white text-black font-semibold text-[13px] tracking-[-0.02em] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.2)] whitespace-nowrap relative z-10"
          style={{ transform: "translateZ(12px)" }}
        >
          Terminal
        </button>
      </nav>
    </header>
  );
}
