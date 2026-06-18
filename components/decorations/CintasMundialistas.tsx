"use client";

import { motion } from "framer-motion";

interface Props {
  variant?: "horizontal-flow" | "vertical-block" | "corner-burst" | "radial-explosion" | "card-border";
  colorScheme?: "warm" | "cool" | "mixed" | "mundial-full";
  animated?: boolean;
  className?: string;
}

const SCHEMES = {
  "warm": [
    "var(--color-mundial-red-dark)",
    "var(--color-mundial-red)",
    "var(--color-mundial-orange)",
    "var(--color-mundial-yellow)"
  ],
  "cool": [
    "var(--color-mundial-purple)",
    "var(--color-mundial-blue)",
    "var(--color-mundial-teal)",
    "var(--color-mundial-lime)"
  ],
  "mixed": [
    "var(--color-mundial-red)",
    "var(--color-mundial-purple)",
    "var(--color-mundial-lime)",
    "var(--color-mundial-orange)"
  ],
  "mundial-full": [
    "var(--color-mundial-red)",
    "var(--color-mundial-orange)",
    "var(--color-mundial-yellow)",
    "var(--color-mundial-lime)",
    "var(--color-mundial-teal)",
    "var(--color-mundial-blue)",
    "var(--color-mundial-purple)"
  ]
};

export function CintasMundialistas({ variant = "horizontal-flow", colorScheme = "mundial-full", animated = true, className = "" }: Props) {
  const colors = SCHEMES[colorScheme];

  if (variant === "card-border") {
    return (
      <div className={`absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden ${className}`}>
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${colorScheme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {colors.map((color, i) => (
                <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={color} />
              ))}
            </linearGradient>
          </defs>
          <motion.rect
            x="0" y="0" width="100%" height="100%"
            fill="none"
            stroke={`url(#gradient-${colorScheme})`}
            strokeWidth="8"
            className="rounded-[inherit]"
            initial={animated ? { strokeDasharray: "0 2000", strokeDashoffset: 0 } : {}}
            animate={animated ? { strokeDasharray: ["0 2000", "2000 0"], strokeDashoffset: [0, -2000] } : {}}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>
    );
  }

  if (variant === "radial-explosion") {
    return (
      <div className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden ${className}`}>
        <svg viewBox="0 0 1000 1000" className="w-[150%] h-[150%] origin-center">
          {colors.map((color, i) => {
            const angle = (i * 360) / colors.length;
            const delay = animated ? i * 0.1 : 0;
            return (
              <motion.path
                key={i}
                d={`M500,500 Q${500 + Math.cos(angle)*200},${500 + Math.sin(angle)*200} ${500 + Math.cos(angle)*600},${500 + Math.sin(angle)*600}`}
                stroke={color}
                strokeWidth={80 + (i * 20)}
                strokeLinecap="butt"
                fill="none"
                initial={animated ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, delay, ease: [0.16, 1, 0.3, 1] }}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  if (variant === "corner-burst") {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {colors.slice(0, 4).map((color, i) => (
            <motion.path
              key={i}
              d={`M0,0 Q${200 + i*100},0 ${400 + i*100},400`}
              stroke={color}
              strokeWidth={100}
              strokeLinecap="butt"
              fill="none"
              initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
            />
          ))}
        </svg>
      </div>
    );
  }

  if (variant === "vertical-block") {
    return (
      <div className={`w-full h-full pointer-events-none ${className}`}>
        <svg viewBox="0 0 400 1200" preserveAspectRatio="none" className="w-full h-full">
          {colors.slice(0, 3).map((color, i) => {
            const width = 120;
            const offset = i * 110; // Cintas masivas que se superponen/encajan
            return (
              <motion.path
                key={i}
                d={`M${offset},-100 Q${offset + 100},600 ${offset},1300`}
                stroke={color}
                strokeWidth={width}
                strokeLinecap="butt"
                fill="none"
                initial={animated ? { y: -20 } : {}}
                animate={animated ? { y: [0, -20, 0] } : {}}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut" }}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  // default: horizontal-flow
  return (
    <div className={`w-full h-full pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 1600 400"
        preserveAspectRatio="none"
        className="w-[120%] h-full -ml-[10%]"
      >
        {/* Usamos un mask-image via inline style en el div que lo contiene si es necesario */}
        {colors.map((color, i) => {
          const strokeWidth = 100;
          const yOffset = 50 + (i * 80); // Cintas masivas casi sin espacio
          return (
            <motion.path
              key={i}
              d={`M-200,${yOffset} C300,${yOffset - 100} 1000,${yOffset + 200} 1800,${yOffset}`}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              fill="none"
              initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}
      </svg>
    </div>
  );
}
