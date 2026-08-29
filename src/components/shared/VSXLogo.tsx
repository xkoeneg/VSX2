import React from "react";
import { cn } from "../../utils/format";

export interface VSXLogoProps {
  /** Tailwind classes controlling the size of the mark itself */
  className?: string;
  /** Whether to render the "VSX" wordmark (and optional subtext) next to the mark */
  showText?: boolean;
  /** Small uppercase line rendered under the wordmark, e.g. "TRADING JOURNAL" */
  subtext?: string;
  /** Matches the app's theme context so the mark stays legible on light backgrounds. Default: "dark" */
  theme?: "dark" | "light";
}

/**
 * VSXLogo — primary brand mark.
 *
 * Renders the fluid "vX" monogram as a single-weight, rounded-linecap
 * stroke path, paired with the "VSX" wordmark and an optional subtext line.
 * Built as inline SVG so it stays crisp at any size. Pass `theme="light"`
 * wherever the app is rendering its light color scheme so the stroke and
 * text switch from light-on-dark to dark-on-light.
 */
const VSXLogo: React.FC<VSXLogoProps> = ({
  className = "w-8 h-8",
  showText = true,
  subtext,
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const strokePrimary = isLight ? "#18181B" : "#F4F4F5"; // zinc-900 / zinc-100
  const strokeSecondary = isLight ? "#3F3F46" : "#E4E4E7"; // zinc-700 / zinc-200
  const wordmarkClass = isLight ? "text-zinc-900" : "text-zinc-100";
  const subtextClass = isLight ? "text-zinc-500" : "text-zinc-500";

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="VSX"
      >
        {/*
          Single continuous fluid stroke:
          - starts top-left, dips down to the "v" point
          - rises through an "s"-curve
          - crosses back down-and-up to close out the "X" leg
        */}
        <path
          d="M18 34
             L34 62
             C38 69 44 69 48 62
             C52 55 58 45 63 45
             C69 45 73 51 82 66"
          stroke={strokePrimary}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* second stroke of the X, crossing the s-curve on its way up */}
        <path
          d="M82 34
             L46 62"
          stroke={strokeSecondary}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn("text-xl font-semibold tracking-[0.35em]", wordmarkClass)}>
            VSX
          </span>
          {subtext && (
            <span className={cn("mt-1 text-[10px] font-medium tracking-[0.25em] uppercase", subtextClass)}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default VSXLogo;
