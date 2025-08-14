"use client";

import { PropsWithChildren } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="popLayout" initial={true}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 0, filter: "blur(0px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
        transition={{ duration: 2, ease: [1, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}


