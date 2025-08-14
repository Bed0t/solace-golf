"use client";

import Image from "next/image";
import Link from "next/link";
import { InfiniteSlider } from "@/components/ui/infinite-slider";

export default function Hero() {
  return (
    <section className="relative sticky min-h-[100svh] overflow-hidden">
      {/* Infinite slider background */}
      <div className="absolute inset-x-0 top-[34vh] z-0 flex min-h-[5px] items-center justify-center">
        <InfiniteSlider gap={0} duration={100} className="w-auto h-[clamp(20px,4w,48px)]">
          <img
            src="/swatches/Swatch Group.png"
            alt="Swatch Group"
            className="h-20 w-3000"
          />
        </InfiniteSlider> 
      </div>

      {/* Background hero image */}
      <Image
        src="/hero/SS-001 Main Hero.png"
        alt="Solace Golf Bag"
        fill
        priority
        sizes="150vw"
        quality={100}
        className="sticky z-0 object-cover pointer-events-none select-none"
        style={{ objectPosition: "top 0px" }}
      />

      {/* CTA pill */}
      <div className="absolute z-20 left-1/2 top-[32vh] -translate-x-1/2 w-[clamp(220px,22vw,338.24px)] h-[clamp(56px,9vw,101px)]">
        <div className="absolute inset-0 rounded-[64px] bg-[rgba(255,255,255,0.42)] shadow-[0px_1px_28px_2px_rgba(0,0,0,0.25),0px_0px_57.4px_rgba(13,13,14,0.41)] blur-[5.45px] backdrop-blur-[23.3px]" />
        <Link href="/signup" className="relative z-10 flex items-center justify-center w-full h-full rounded-[64px]">
          <span className="font-[700] text-[clamp(14px,1.5vw,20px)] leading-[clamp(20px,2vw,28px)] [letter-spacing:-1px] text-[#666666]" style={{ fontFamily: "var(--font-montserrat)" }}>
          Your craft begins here
          </span>
        </Link>
      </div>
    </section>
  );
}
