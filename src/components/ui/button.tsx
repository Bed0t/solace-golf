"use client";

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className = "",
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-full font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30";
  const variants = {
    default: "bg-white text-black hover:opacity-90",
    outline: "bg-transparent text-white border border-white/20 hover:border-white/40",
  } as const;
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  } as const;

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  );
}


