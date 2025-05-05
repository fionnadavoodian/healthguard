import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function Card({
  header,
  children,
  footer,
  className = "",
}: CardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200",
        className
      )}
    >
      {header && <div className="overflow-hidden">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="p-4 bg-gray-50">{footer}</div>}
    </motion.div>
  );
}
