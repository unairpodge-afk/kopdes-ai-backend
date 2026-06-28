"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/kopdes/utils";

// Badge variants
const badgeVariants = {
  base: "inline-flex items-center gap-1 rounded-full font-semibold transition-colors",
  variants: {
    default: "bg-red-100 text-red-700 border border-red-200",
    primary: "bg-gradient-to-r from-red-600 to-red-700 text-white",
    secondary: "bg-gray-100 text-gray-700 border border-gray-200",
    gold: "bg-gradient-to-r from-amber-400 to-amber-500 text-white",
    success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
    danger: "bg-gradient-to-r from-red-700 to-red-800 text-white",
    outline: "border-2 border-red-500 text-red-600 bg-transparent",
    subtle: "bg-red-50 text-red-600",
  },
  sizes: {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  },
};

export interface KopdesBadgeProps extends HTMLMotionProps<"span"> {
  variant?: keyof typeof badgeVariants.variants;
  size?: keyof typeof badgeVariants.sizes;
  animated?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * KopDes Badge Component
 * Animated badge with Village Cooperative theme
 */
const KopdesBadge = React.forwardRef<HTMLSpanElement, KopdesBadgeProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      animated = true,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const badgeContent = (
      <>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </>
    );

    if (animated) {
      return (
        <motion.span
          ref={ref}
          className={cn(
            badgeVariants.base,
            badgeVariants.variants[variant],
            badgeVariants.sizes[size],
            className
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          {...props}
        >
          {badgeContent}
        </motion.span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants.base,
          badgeVariants.variants[variant],
          badgeVariants.sizes[size],
          className
        )}
        {...props}
      >
        {badgeContent}
      </span>
    );
  }
);
KopdesBadge.displayName = "KopdesBadge";

// Status Badge with dot indicator
export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "active" | "pending" | "inactive" | "success" | "warning" | "error";
  pulse?: boolean;
}

const statusConfig = {
  active: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  inactive: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  success: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  warning: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  error: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, pulse = false, children, ...props }, ref) => {
    const config = statusConfig[status];

    return (
      <motion.span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold",
          config.bg,
          config.text,
          className
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        {...props}
      >
        <motion.span
          className={cn("w-2 h-2 rounded-full", config.dot)}
          animate={pulse ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          } : undefined}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span>{children || status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </motion.span>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

// Animated Count Badge
export interface CountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
  max?: number;
  variant?: "primary" | "secondary" | "danger";
}

const countBadgeVariants = {
  primary: "bg-red-600 text-white",
  secondary: "bg-gray-600 text-white",
  danger: "bg-red-700 text-white",
};

const CountBadge = React.forwardRef<HTMLSpanElement, CountBadgeProps>(
  ({ className, count, max = 99, variant = "primary", ...props }, ref) => {
    const displayCount = count > max ? `${max}+` : count;

    return (
      <motion.span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold",
          countBadgeVariants[variant],
          className
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        key={count}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        {...props}
      >
        {displayCount}
      </motion.span>
    );
  }
);
CountBadge.displayName = "CountBadge";

export { KopdesBadge, StatusBadge, CountBadge, badgeVariants };
