import Hero from "@/components/Hero";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="min-h-sticky w-full bg-white text-neutral-900 flex flex-col">
      <Header variant="sticky" />

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
