import type { CSSProperties } from "react";

interface DecorProps {
  className?: string;
}

interface DustFieldProps {
  count?: number;
  className?: string;
}

function pseudo(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function DustField({ count = 14, className = "" }: DustFieldProps) {
  return (
    <span className={`dust-field ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const a = pseudo(index * 3 + 1);
        const b = pseudo(index * 3 + 2);
        const c = pseudo(index * 3 + 3);
        const size = (1.8 + c * 3.6).toFixed(1);
        return (
          <i
            key={index}
            style={
              {
                left: `${(a * 94).toFixed(1)}%`,
                top: `${(18 + b * 74).toFixed(1)}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDuration: `${(7 + a * 8).toFixed(1)}s`,
                animationDelay: `-${(b * 9).toFixed(1)}s`,
                "--dust-x": `${((c - 0.5) * 70).toFixed(0)}px`,
              } as CSSProperties
            }
          />
        );
      })}
    </span>
  );
}

const PETAL_ANGLES = Array.from({ length: 16 }, (_, i) => i * 22.5);
const INNER_PETAL_ANGLES = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5);
const DOT_ANGLES = Array.from({ length: 8 }, (_, i) => i * 45);

export function AlpanaMotif({ className }: DecorProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
      <circle cx="100" cy="100" r="89" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      {PETAL_ANGLES.map((angle) => (
        <path
          key={`p-${angle}`}
          d="M100 24C113.5 43 113.5 60 100 77C86.5 60 86.5 43 100 24Z"
          stroke="currentColor"
          strokeWidth="0.9"
          opacity="0.55"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      {INNER_PETAL_ANGLES.map((angle) => (
        <path
          key={`ip-${angle}`}
          d="M100 52C108 65 108 77 100 89C92 77 92 65 100 52Z"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.4"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      {DOT_ANGLES.map((angle) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        return (
          <circle
            key={`d-${angle}`}
            cx={100 + 74 * Math.cos(rad)}
            cy={100 + 74 * Math.sin(rad)}
            r="2"
            fill="currentColor"
            opacity="0.55"
          />
        );
      })}
      <circle cx="100" cy="100" r="34" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
      <circle cx="100" cy="100" r="7" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function OrnamentDivider({ className }: DecorProps) {
  return (
    <svg
      viewBox="0 0 180 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M0 8H70" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <path d="M110 8H180" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <path
        d="M70 8C76 3.5 82 3.5 86 8"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <path
        d="M110 8C104 3.5 98 3.5 94 8"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <path d="M90 1.5L96.5 8L90 14.5L83.5 8L90 1.5Z" fill="currentColor" opacity="0.85" />
      <circle cx="75" cy="12" r="1.4" fill="currentColor" opacity="0.6" />
      <circle cx="105" cy="12" r="1.4" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function CornerFlourish({ className }: DecorProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M3 45C3 21.8 21.8 3 45 3"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.85"
      />
      <path
        d="M11 45C11 26.2 26.2 11 45 11"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <path
        d="M3 33C9 33 14 28.5 15.5 22"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <circle cx="16.5" cy="19" r="2" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

export function DhunuchiLine({ className }: DecorProps) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <ellipse cx="60" cy="44" rx="29" ry="8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M31 44V50" stroke="currentColor" strokeWidth="1.4" />
      <path d="M89 44V50" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M34 50C24 74 30 102 46 121C54 131 66 131 74 121C90 102 96 74 86 50"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M36 57H84" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
      <path
        d="M35 60C25 65 23 76 28 85"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.8"
      />
      <path
        d="M85 60C95 65 97 76 92 85"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.8"
      />
      <path d="M46 131L42 147H78L74 131" stroke="currentColor" strokeWidth="1.4" />
      <path d="M36 147H84" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M52 74C56 68 64 68 68 74"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.7"
      />
      <path
        d="M50 92C56 85 64 85 70 92"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.7"
      />
    </svg>
  );
}

export function DhakLine({ className }: DecorProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M24 31C62 10 98 10 136 31"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M24 95C62 116 98 116 136 95"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <ellipse cx="24" cy="63" rx="8" ry="33" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="136" cy="63" rx="8" ry="33" stroke="currentColor" strokeWidth="1.6" />
      <g stroke="currentColor" strokeWidth="0.8" opacity="0.55">
        <path d="M42 24L62 100" />
        <path d="M62 21L82 102" />
        <path d="M82 21L102 100" />
        <path d="M102 24L122 97" />
        <path d="M62 21L42 100" />
        <path d="M82 21L62 102" />
        <path d="M102 24L82 100" />
        <path d="M122 30L102 96" />
      </g>
      <path
        d="M56 14C66 2 94 2 104 14"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.7"
      />
    </svg>
  );
}
