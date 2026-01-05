
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

export const TestComponent = ({ open }: { open: boolean }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </AnimatePresence>
  );
};
