import React from "react";
import { Link } from "react-router-dom";

export default function Logo({
  variant = "full", // "full" | "icon" | "wordmark"
  size = "md", // "sm" | "md" | "lg" | "xl"
  className = "",
  to = "/",
}) {
  const sizeMap = {
    sm: { icon: "w-7 h-7", text: "text-base", sub: "text-[8px]" },
    md: { icon: "w-9 h-9", text: "text-xl", sub: "text-[9px]" },
    lg: { icon: "w-11 h-11", text: "text-2xl", sub: "text-[10px]" },
    xl: { icon: "w-14 h-14", text: "text-3xl", sub: "text-[11px]" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Monochromatic Geometric Emblem */}
      {variant !== "wordmark" && (
        <div
          className={`${currentSize.icon} rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-display font-black tracking-tighter shadow-md transition-transform duration-200 group-hover:scale-105 shrink-0`}
        >
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
          >
            {/* Minimalist Geometric V Monogram */}
            <path
              d="M6 8L16 26L26 8H20.5L16 17.5L11.5 8H6Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}

      {/* Monochromatic Wordmark */}
      {variant !== "icon" && (
        <div className="flex flex-col">
          <span
            className={`font-display font-black tracking-tight leading-none text-black dark:text-white ${currentSize.text}`}
          >
            VOYAGO
          </span>
          <span
            className={`font-bold tracking-widest uppercase text-neutral-500 dark:text-neutral-400 -mt-0.5 ${currentSize.sub}`}
          >
            Mobility
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
