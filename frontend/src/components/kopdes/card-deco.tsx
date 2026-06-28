"use client";

import * as React from "react";
import { motion } from "framer-motion";

/**
 * CardDeco - Decorative corner elements for KopDes cards
 */
export function CardDeco({
  variant = "corner",
  className,
}: {
  variant?: "corner" | "wave" | "dots" | "line";
  className?: string;
}) {
  const variants = {
    corner: (
      <>
        {/* Top-left corner */}
        <motion.div
          className="absolute top-0 left-0 w-16 h-16 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/10 to-transparent" />
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-red-300/50 rounded-tl-xl" />
        </motion.div>

        {/* Bottom-right corner */}
        <motion.div
          className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-amber-500/10 to-transparent" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-300/50 rounded-br-xl" />
        </motion.div>
      </>
    ),

    wave: (
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 400 400"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,200 Q100,150 200,200 T400,200 V400 H0 Z"
            fill="url(#waveGradient)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    ),

    dots: (
      <motion.div
        className="absolute top-4 right-4 grid grid-cols-3 gap-1"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-red-400/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>
    ),

    line: (
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
      />
    ),
  };

  return (
    <div className={className} aria-hidden="true">
      {variants[variant]}
    </div>
  );
}

/**
 * BadgeDeco - Decorative badge elements
 */
export function BadgeDeco({
  variant = "glow",
  color = "red",
}: {
  variant?: "glow" | "pulse" | "shine";
  color?: "red" | "gold" | "green";
}) {
  const colorMap = {
    red: "bg-red-500",
    gold: "bg-amber-500",
    green: "bg-emerald-500",
  };

  const glowMap = {
    red: "shadow-[0_0_10px_rgba(239,68,68,0.5)]",
    gold: "shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    green: "shadow-[0_0_10px_rgba(16,185,129,0.5)]",
  };

  if (variant === "glow") {
    return (
      <motion.div
        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${colorMap[color]} ${glowMap[color]}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  if (variant === "pulse") {
    return (
      <motion.div
        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${colorMap[color]}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [1, 2],
          opacity: [1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    );
  }

  return null;
}
