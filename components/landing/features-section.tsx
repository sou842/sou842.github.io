"use client";

import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/lib/portfolio";

const features = [
  {
    number: "01",
    title: "AI Browser Automation",
    description: "Developed chrome-based AI tools for scraping and workflow execution at 100x Bot.",
    stats: { value: "100x", label: "efficiency boost" },
  },
  {
    number: "02",
    title: "Healthcare Scalability",
    description: "Built large-scale healthcare platforms with React and TypeScript at InspironLabs.",
    stats: { value: "10k+", label: "data points managed" },
  },
  {
    number: "03",
    title: "Real-time Architecture",
    description: "Implementing seamless communication with Socket.IO and advanced backend integration.",
    stats: { value: "<50ms", label: "latency achieved" },
  },
  {
    number: "04",
    title: "Global Localization",
    description: "Architecting multi-language systems for diverse user bases across the globe.",
    stats: { value: "15+", label: "languages supported" },
  },
];

// Floating dot particles visualization
function ParticleVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    // Generate stable particle positions
    const COUNT = 70;
    const particles = Array.from({ length: COUNT }, (_, i) => {
      const seed = i * 1.618;
      return {
        bx: ((seed * 127.1) % 1),
        by: ((seed * 311.7) % 1),
        phase: seed * Math.PI * 2,
        speed: 0.4 + (seed % 0.4),
        radius: 1.2 + (seed % 2.2),
      };
    });

    let time = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        const flowX = Math.sin(time * p.speed * 0.4 + p.phase) * 38;
        const flowY = Math.cos(time * p.speed * 0.3 + p.phase * 0.7) * 24;

        const bx = p.bx * w;
        const by = p.by * h;
        const dx = p.bx - mx;
        const dy = p.by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist * 2.8);

        const x = bx + flowX + influence * Math.cos(time + p.phase) * 36;
        const y = by + flowY + influence * Math.sin(time + p.phase) * 36;

        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
        const alpha = 0.08 + pulse * 0.18 + influence * 0.3;

        ctx.beginPath();
        ctx.arc(x, y, p.radius + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      time += 0.016;
      frameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Full width with diagonal layout */}
        <div className="relative mb-24 lg:mb-32">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
                <span className="w-12 h-px bg-foreground/30" />
                About Me
              </span>
              <h2
                className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                The Vision
                <br />
                <span className="text-muted-foreground">Behind the Work.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-4">
              <p className={`text-xl text-muted-foreground leading-relaxed transition-all duration-1000 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                {portfolio.about.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout - Repurposed for Strengths */}
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
          {features.map((feature, idx) => (
            <div 
              key={feature.number}
              className={`${idx === 0 ? "lg:col-span-8" : "lg:col-span-4"} relative bg-black border border-foreground/10 min-h-[400px] overflow-hidden group transition-all duration-700 flex flex-col ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
              onMouseEnter={() => setActiveFeature(idx)}
            >
              {/* Particle visualization only for the first large card */}
              {idx === 0 && <ParticleVisualization />}
              
              <div className="relative z-10 p-8 lg:p-12 flex flex-col h-full bg-black/40 backdrop-blur-sm lg:bg-transparent">
                <span className="font-mono text-sm text-muted-foreground">{feature.number}</span>
                <h3 className="text-2xl lg:text-3xl font-display mt-4 mb-6 group-hover:translate-x-2 transition-transform duration-500">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-auto">
                  {feature.description}
                </p>
                <div className="mt-8">
                  <span className="text-4xl lg:text-5xl font-display">{feature.stats.value}</span>
                  <span className="block text-xs text-muted-foreground font-mono mt-1 uppercase tracking-wider">{feature.stats.label}</span>
                </div>
              </div>

              {/* Background accent for smaller cards */}
              {idx > 0 && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
