import React from "react";
import godiLogoAsset from "../assets/images/godi_company_logo_1784743168269.jpg";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  lightMode?: boolean;
}

/**
  * Official Godi Logo Component
  * Renders the MD GoDi logo ("MD GoDi - TECNOLOGÍA QUE IMPULSA NEGOCIOS")
  */
export function GodiOfficialLogo({
  size = "md",
  className = "",
  lightMode = false,
}: LogoProps) {
  const heightMap = {
    sm: "h-9 sm:h-11",
    md: "h-12 sm:h-14",
    lg: "h-16 sm:h-20",
    xl: "h-20 sm:h-24",
    "2xl": "h-24 sm:h-32",
  };

  const navyBlue = lightMode ? "#FFFFFF" : "#0B2545";
  const silverGray = lightMode ? "#CBD5E1" : "#64748B";
  const lineNavy = lightMode ? "#FFFFFF" : "#0B2545";

  return (
    <div className={`inline-flex items-center justify-center select-none ${heightMap[size] || "h-16"} ${className}`}>
      <svg
        viewBox="0 0 980 100"
        className="h-full w-auto max-w-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>

        {/* Brand Name: MD GoDi on the left */}
        <text
          x="15"
          y="70"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
          fontWeight="900"
          fontSize="72"
          letterSpacing="-1"
          textAnchor="start"
        >
          <tspan fill={lightMode ? "#FFFFFF" : "#0B2545"}>M</tspan>
          <tspan fill="url(#silverGradient)">D</tspan>
          <tspan fill={lightMode ? "#FFFFFF" : "#0B2545"}> GoD</tspan>
          <tspan fill="url(#silverGradient)">i</tspan>
        </text>

        {/* Vertical Divider */}
        <line
          x1="355"
          y1="22"
          x2="355"
          y2="78"
          stroke={lightMode ? "#FFFFFF" : "#0B2545"}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Slogan Text to the right of MD GoDi */}
        <text
          x="380"
          y="62"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
          fontWeight="800"
          fontSize="23"
          letterSpacing="2.5"
          textAnchor="start"
          fill={lightMode ? "#E2E8F0" : "#0B2545"}
        >
          TECNOLOGÍA QUE IMPULSA NEGOCIOS
        </text>
      </svg>
    </div>
  );
}

// Fixed alias for UpContaLogo -> always renders official Godi logo as requested
export function UpContaLogo(props: LogoProps) {
  return <GodiOfficialLogo {...props} />;
}

/**
 * ANF / Firmas Electrónicas.ec Logo Component
 * Renders the official "Firmas Electrónicas.ec by: anf" logo
 */
export function AnfLogo({
  size = "md",
  className = "",
  lightMode = false,
}: LogoProps) {
  const heightMap = {
    sm: "h-7 sm:h-8",
    md: "h-9 sm:h-11",
    lg: "h-12 sm:h-14",
    xl: "h-16 sm:h-18",
    "2xl": "h-20 sm:h-22",
  };

  const navyColor = lightMode ? "#FFFFFF" : "#00407A";
  const goldColor = "#E5A900";

  return (
    <div className={`inline-flex items-center justify-center select-none ${heightMap[size] || "h-11"} ${className}`}>
      <svg
        viewBox="0 0 620 180"
        className="h-full w-auto max-w-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stylized Electronic Circuit Symbol (Left Icon) */}
        <g transform="translate(15, 10)">
          <path d="M 25 35 L 25 15" stroke={navyColor} strokeWidth="6" strokeLinecap="round" />
          <rect x="20" y="5" width="10" height="10" fill={navyColor} />

          <path d="M 50 35 L 50 10 L 60 10" stroke={navyColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="60" y="5" width="10" height="10" fill={navyColor} />

          <path d="M 75 45 L 75 30 L 85 30" stroke={navyColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="85" y="25" width="10" height="10" fill={navyColor} />

          <path d="M 25 35 L 25 65 L 85 65 L 85 45" stroke={navyColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 50 35 L 50 75 L 70 75" stroke={navyColor} strokeWidth="7" strokeLinecap="round" />

          <path d="M 20 80 L 52 135 L 84 80 Z" fill={navyColor} />
          <path d="M 32 80 L 52 115 L 72 80 Z" fill="#002D57" />
        </g>

        {/* Text: "Firmas" in Gold */}
        <text
          x="125"
          y="72"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
          fontWeight="900"
          fontSize="68"
          fill={goldColor}
        >
          Firmas
        </text>

        {/* Text: "Electrónicas" in Navy */}
        <text
          x="125"
          y="132"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
          fontWeight="900"
          fontSize="62"
          letterSpacing="-1"
          fill={navyColor}
        >
          Electrónicas
        </text>

        {/* Text: ".ec" in Gold */}
        <text
          x="500"
          y="132"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
          fontWeight="900"
          fontSize="36"
          fill={goldColor}
        >
          .ec
        </text>

        {/* Bottom Badge: "by: anf" */}
        <g transform="translate(300, 140)">
          <rect x="0" y="0" width="180" height="34" rx="10" fill={navyColor} />
          <text
            x="15"
            y="23"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
            fontWeight="700"
            fontSize="18"
            fill="#FFFFFF"
          >
            by:
          </text>
          <text
            x="52"
            y="24"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif"
            fontWeight="900"
            fontSize="22"
            letterSpacing="-0.5"
            fill="#FFFFFF"
          >
            anfac
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Co-Brand Logo Component (Godi + ANF) for Simulador Tab
 */
export function CoBrandLogo({
  size = "md",
  className = "",
  lightMode = false,
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 sm:gap-4 ${className}`}>
      <GodiOfficialLogo size={size} lightMode={lightMode} />
      <div className={`h-8 w-[2px] rounded-full ${lightMode ? "bg-white/30" : "bg-slate-300"}`} />
      <AnfLogo size={size} lightMode={lightMode} />
    </div>
  );
}

/**
 * Main Logo Switcher - Always renders GodiOfficialLogo for all tabs
 */
export function DynamicBrandLogo({
  activeTab,
  size = "lg",
  className = "",
  lightMode = false,
}: {
  activeTab?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  lightMode?: boolean;
}) {
  return <GodiOfficialLogo size={size} className={className} lightMode={lightMode} />;
}

export function GodiLogo(props: LogoProps) {
  return <GodiOfficialLogo {...props} />;
}
