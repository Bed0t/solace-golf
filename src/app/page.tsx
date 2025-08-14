import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-sticky w-full bg-white text-neutral-900 flex flex-col">
      {/* Header with Montserrat Bold 20px, letter-spacing -3px */}
      <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur bg-white/75 h-16 flex items-center">
        <div className="mx-auto max-w-7xl w-full px-6 flex items-center justify-center">
          <div
            className="mx-auto font-[700] [letter-spacing:-3px] text-[20px] leading-[28px] uppercase"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            SOLACE
          </div>
        </div>
      </header>

      <Hero />

      {/* Footer */}
      <footer id="sticky-footer" className="py-10 bg-black text-white">
        <div className="mx-auto max-w-1xl px-10 text-center">
          <div className="serif text-white/90 text-[26px] leading-none">Solace Golf</div>
          <div className="text-white/60 text-sm mt-2">your craft</div>
          <div className="mt-6 flex items-center justify-center gap-12 text-sm">
            <a href="https://instagram.com/solace_golf" target="_blank" className="hover:opacity-80 transition text-white/50">Instagram</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
