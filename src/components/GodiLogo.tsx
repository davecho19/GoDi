import React from "react";

interface GodiLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
  lightMode?: boolean;
}

export function GodiLogo({
  size = "md",
  className = "",
  lightMode = false,
}: GodiLogoProps) {
  const heightMap = {
    sm: "h-7 sm:h-8",
    md: "h-9 sm:h-11",
    lg: "h-12 sm:h-14",
    xl: "h-16 sm:h-18",
    "2xl": "h-20 sm:h-22",
    "3xl": "h-24 sm:h-28",
  };

  return (
    <div className={`inline-flex items-center justify-center select-none ${heightMap[size] || "h-28"} ${className}`}>
      <svg
        viewBox="0 0 520 140"
        className="h-full w-auto max-w-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Navy Blue Gradient */}
          <linearGradient id="godiTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lightMode ? "#FFFFFF" : "#1B3A68"} />
            <stop offset="50%" stopColor={lightMode ? "#0B2545" : "#0B2545"} />
            <stop offset="100%" stopColor={lightMode ? "#CBD5E1" : "#051326"} />
          </linearGradient>

          {/* Soft drop shadow */}
          <filter id="godiTextShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#041226" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#godiTextShadow)">
          {/* "GoDi" Text rendered with exact casing: G (capital), o (lower), D (capital), i (lower) */}
          <text
            x="260"
            y="72"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="78"
            letterSpacing="-1"
            fill="url(#godiTextGrad)"
          >
            GoDi
          </text>

          {/* Slogan line: — SOLUCIONES INTELIGENTES — */}
          <g transform="translate(260, 108)">
            <line x1="-210" y1="-5" x2="-160" y2="-5" stroke={lightMode ? "#94A3B8" : "#0B2545"} strokeWidth="2.5" strokeLinecap="round" />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontWeight="800"
              fontSize="16"
              letterSpacing="4"
              fill={lightMode ? "#E2E8F0" : "#0B2545"}
            >
              SOLUCIONES INTELIGENTES
            </text>
            <line x1="160" y1="-5" x2="210" y2="-5" stroke={lightMode ? "#94A3B8" : "#0B2545"} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}


