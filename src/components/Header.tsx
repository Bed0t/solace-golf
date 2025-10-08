"use client"
import React from "react"

type HeaderProps = {
  variant?: "sticky" | "fixed"
}

export default function Header({ variant = "sticky" }: HeaderProps) {
  const positionClass = variant === "fixed" ? "fixed" : "sticky"
  // Frosted glass effect for fixed overlay; more solid for sticky on main page
  const backgroundClass = variant === "fixed" ? "bg-f5f6f7 backdrop-blur-md" : "bg-white/75 backdrop-blur"
  return (
    <header
      className={`${positionClass} top-0 left-0 right-0 z-50 ${backgroundClass} h-16 flex items-center text-neutral-900`}
      style={{ WebkitBackdropFilter: variant === 'fixed' ? 'blur(12px)' : undefined }}
    >
      <div className="mx-auto max-w-7xl w-full px-6 flex items-center justify-center">
        <div
          className="mx-auto font-[700] [letter-spacing:-3px] text-[20px] leading-[28px] uppercase"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          SOLACE
        </div>
      </div>
    </header>
  )
}


