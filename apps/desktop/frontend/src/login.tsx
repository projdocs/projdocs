import { useEffect, useRef, useState } from "react";
import { cn } from "@packages/ui/lib/utils";
import Logo from "@packages/ui/branding/logo/logo";
import { ButtonGroup } from "@packages/ui/components/button-group";
import { Button } from "@packages/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@packages/ui/components/input-group";
import { toast } from "sonner";
import { Browser } from '@wailsio/runtime';
import { Events } from '@wailsio/runtime'
// import { UserLogin, MonitorStats } from './bindings/events'

const validIpAddress = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

const validHostname = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

function normalizeUrl(input: string): string | null {
  if (validIpAddress.test(input) || validHostname.test(input)) {
    return `https://${input}`;
  }
  return null; // neither a valid IP nor hostname
}

export default function LoginPage() {

  const [input, setInput] = useState("");

  return (
    <StarfieldBackground>

      <div className="flex h-dvh w-dvw flex-col items-center">
        <div className="flex-1 h-1/3" />
        <Logo className="w-1/3" />
        <div className="flex flex-1 flex-col items-center pt-8 gap-1">
          <ButtonGroup>
            <InputGroup>
              <InputGroupInput value={input} onChange={(e) => setInput(e.target.value)} placeholder="dms.projdocs.com" />
              <InputGroupAddon>
                {"https://"}
              </InputGroupAddon>
            </InputGroup>
            <Button
              variant="outline"
              onClick={async () => {
                const fqdn = normalizeUrl(input);
                if (fqdn === null) {
                  toast.error("Invalid URL!");
                  return;
                }

                const url = new URL(fqdn);
                url.pathname = "/";

                try {
                  await Browser.OpenURL(url);
                  await Events.Emit("projdocs:window:set-visible", false)
                } catch {
                  toast.error("Unable to Open Browser!", {
                    description: `Enter the following URL in a browser window to continue: ${url.toString()}`
                  })
                }
              }}
            >{"Login"}</Button>
          </ButtonGroup>
          <p className={"text-muted-foreground text-xs"}>{"Enter a server hostname to continue."}</p>
        </div>
      </div>

    </StarfieldBackground>
  );

}


export interface StarfieldBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  /** Number of stars */
  count?: number;
  /** Travel speed */
  speed?: number;
  /** Star color */
  starColor?: string;
  /** Enable twinkling */
  twinkle?: boolean;
}

interface Star {
  x: number;
  y: number;
  z: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export function StarfieldBackground({
                                      className,
                                      children,
                                      count = 400,
                                      speed = 0.5,
                                      starColor = "#ffffff",
                                      twinkle = true,
                                    }: StarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;
    canvas.width = width;
    canvas.height = height;

    let animationId: number;
    let tick = 0;
    const maxDepth = 1500;

    // Create stars
    const createStar = (initialZ?: number): Star => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: initialZ ?? Math.random() * maxDepth,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2,
    });

    const stars: Star[] = Array.from({ length: count }, () => createStar());

    // Resize handler
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width;
      canvas.height = height;
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // Animation
    const animate = () => {
      tick++;

      // Fade effect for trails
      ctx.fillStyle = "rgba(10, 10, 15, 0.2)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (const star of stars) {
        // Move star toward camera
        star.z -= speed * 2;

        // Reset if passed camera
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.z = maxDepth;
        }

        // Project to 2D
        const scale = 400 / star.z;
        const x = cx + star.x * scale;
        const y = cy + star.y * scale;

        // Skip if off screen
        if (x < -10 || x > width + 10 || y < -10 || y > height + 10) continue;

        // Size based on depth (closer = bigger)
        const size = Math.max(0.5, (1 - star.z / maxDepth) * 3);

        // Opacity based on depth (closer = brighter)
        let opacity = (1 - star.z / maxDepth) * 0.9 + 0.1;

        // Twinkle effect
        if (twinkle && star.twinkleSpeed > 0.015) {
          opacity *= 0.7 + 0.3 * Math.sin(tick * star.twinkleSpeed + star.twinkleOffset);
        }

        // Draw star
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.globalAlpha = opacity;
        ctx.fill();

        // Draw subtle streak for fast/close stars
        if (star.z < maxDepth * 0.3 && speed > 0.3) {
          const streakLength = (1 - star.z / maxDepth) * speed * 8;
          const angle = Math.atan2(star.y, star.x);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - Math.cos(angle) * streakLength, y - Math.sin(angle) * streakLength);
          ctx.strokeStyle = starColor;
          ctx.globalAlpha = opacity * 0.3;
          ctx.lineWidth = size * 0.5;
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    // Initial clear
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, width, height);

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      ro.disconnect();
    };
  }, [ count, speed, starColor, twinkle ]);

  return (
    <div ref={containerRef} className={cn("fixed inset-0 overflow-hidden bg-[#0a0a0f]", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Subtle blue nebula glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(56, 100, 180, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(100, 60, 150, 0.1) 0%, transparent 50%)",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(5,5,10,0.9) 100%)",
        }}
      />

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}
