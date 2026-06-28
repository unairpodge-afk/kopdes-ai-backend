"use client";

import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "../../lib/kopdes/utils";
import { CardDeco } from "./card-deco";

// Card animation variants
const cardVariants: Record<string, Variants> = {
  default: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
  slideUp: {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  bounce: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 25 },
    },
  },
};

export interface KopdesCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "slideUp" | "bounce" | "scale";
  hoverable?: boolean;
  glow?: boolean;
  animate?: boolean;
}

const KopdesCard = React.forwardRef<HTMLDivElement, KopdesCardProps>(
  ({ className, variant = "default", hoverable = false, glow = false, animate = true, children, ...props }, ref) => {
    const motionProps = animate
      ? {
          initial: "hidden",
          animate: "visible",
          whileHover: hoverable ? { scale: 1.02, y: -4 } : undefined,
          whileTap: hoverable ? { scale: 0.98 } : undefined,
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-md p-6",
          "shadow-lg shadow-black/40",
          hoverable && "cursor-pointer transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-red-500/5",
          glow && "shadow-[0_0_30px_rgba(239,68,68,0.15)] border-red-500/30",
          className
        )}
        variants={animate ? cardVariants[variant] : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        {...motionProps}
        {...props}
      >
        <CardDeco />
        {children}
      </motion.div>
    );
  }
);
KopdesCard.displayName = "KopdesCard";

// Sub-components
const KopdesCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 mb-4", className)}
    {...props}
  />
));
KopdesCardHeader.displayName = "KopdesCardHeader";

const KopdesCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
));
KopdesCardTitle.displayName = "KopdesCardTitle";

const KopdesCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>((({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-400", className)}
    {...props}
  />
)));
KopdesCardDescription.displayName = "KopdesCardDescription";

const KopdesCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
KopdesCardContent.displayName = "KopdesCardContent";

const KopdesCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 border-t border-white/10", className)}
    {...props}
  />
));
KopdesCardFooter.displayName = "KopdesCardFooter";



// Special Card Components
export interface KopdesStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "red" | "gold" | "green" | "blue";
}

const colorMap = {
  red: {
    bg: "from-red-500/10 via-transparent to-red-950/20 bg-slate-900/60 backdrop-blur-md",
    border: "border-red-500/20 hover:border-red-500/40",
    icon: "text-red-400 bg-red-500/10",
    value: "text-white",
  },
  gold: {
    bg: "from-amber-500/10 via-transparent to-amber-950/20 bg-slate-900/60 backdrop-blur-md",
    border: "border-amber-500/20 hover:border-amber-500/40",
    icon: "text-amber-400 bg-amber-500/10",
    value: "text-white",
  },
  green: {
    bg: "from-emerald-500/10 via-transparent to-emerald-950/20 bg-slate-900/60 backdrop-blur-md",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    icon: "text-emerald-400 bg-emerald-500/10",
    value: "text-white",
  },
  blue: {
    bg: "from-blue-500/10 via-transparent to-blue-950/20 bg-slate-900/60 backdrop-blur-md",
    border: "border-blue-500/20 hover:border-blue-500/40",
    icon: "text-blue-400 bg-blue-500/10",
    value: "text-white",
  },
};

const KopdesStatCard = React.forwardRef<HTMLDivElement, KopdesStatCardProps>(
  ({ className, label, value, icon, trend, color = "red", ...props }, ref) => {
    const colors = colorMap[color];

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "relative overflow-hidden rounded-xl border bg-gradient-to-br p-5",
          colors.bg,
          colors.border,
          "shadow-lg shadow-black/30 transition-all duration-300",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-400 mb-1">{label}</p>
            <p className="text-2xl font-black text-white tracking-tight">{value}</p>
            {trend && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "text-xs font-bold mt-2 flex items-center gap-1",
                  trend.isPositive ? "text-emerald-400" : "text-red-400"
                )}
              >
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}%</span>
              </motion.p>
            )}
          </div>
          {icon && (
            <motion.div
              className={cn("p-2.5 rounded-xl border border-white/5 flex items-center justify-center", colors.icon)}
              whileHover={{ rotate: 10 }}
            >
              {icon}
            </motion.div>
          )}
        </div>
        {/* Decorative corner */}
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </motion.div>
    );
  }
);
KopdesStatCard.displayName = "KopdesStatCard";

export {
  KopdesCard,
  KopdesCardHeader,
  KopdesCardFooter,
  KopdesCardTitle,
  KopdesCardDescription,
  KopdesCardContent,
  KopdesStatCard,
  cardVariants,
};
