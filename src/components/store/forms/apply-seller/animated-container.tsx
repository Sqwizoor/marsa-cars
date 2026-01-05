import { ReactNode } from "react";
import { motion } from "framer-motion";
import { poppingTransition } from "./transition";

export default function AnimatedContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={poppingTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full"
    >
      <div className="flex flex-col pt-4 px-2">
        {children}
      </div>
    </motion.div>
  );
}
