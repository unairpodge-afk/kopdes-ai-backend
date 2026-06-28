"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/kopdes/utils";
import { Loader2 } from "lucide-react";

// Button variants
const buttonVariants = {
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    primary: [
      "bg-gradient-to-r from-red-600 to-red-700",
      "text-white",
      "hover:from-red-700 hover:to-red-800",
      "hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]",
      "active:scale-95",
    ],
    secondary: [
      "bg-gradient-to-r from-gray-100 to-gray-200",
      "text-gray-900",
      "hover:from-gray-200 hover:to-gray-300",
      "active:scale-95",
    ],
    outline: [
      "border-2 border-red-600",
      "text-red-600",
      "bg-transparent",
      "hover:bg-red-600 hover:text-white",
      "hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]",
      "active:scale-95",
    ],
    ghost: [
      "text-red-600",
      "hover:bg-red-50",
      "active:scale-95",
    ],
    gold: [
      "bg-gradient-to-r from-amber-500 to-amber-600",
      "text-white",
      "hover:from-amber-600 hover:to-amber-700",
      "hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]",
      "active:scale-95",
    ],
    success: [
      "bg-gradient-to-r from-emerald-500 to-emerald-600",
      "text-white",
      "hover:from-emerald-600 hover:to-emerald-700",
      "hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]",
      "active:scale-95",
    ],
    danger: [
      "bg-gradient-to-r from-red-700 to-red-800",
      "text-white",
      "hover:from-red-800 hover:to-red-900",
      "hover:shadow-[0_0_20px_rgba(185,28,28,0.4)]",
      "active:scale-95",
    ],
  },
  sizes: {
    sm: "h-8 px-3 text-xs rounded-md",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-base rounded-lg",
    xl: "h-14 px-8 text-lg rounded-xl",
    icon: "h-10 w-10",
    "icon-sm": "h-8 w-8",
    "icon-lg": "h-12 w-12",
  },
};

type ButtonVariant = keyof typeof buttonVariants.variants;
type ButtonSize = keyof typeof buttonVariants.sizes;

export interface KopdesButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * KopDes Button Component
 * Animated button with Village Cooperative theme
 */
const KopdesButton = React.forwardRef<HTMLButtonElement, KopdesButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          buttonVariants.base,
          buttonVariants.variants[variant],
          buttonVariants.sizes[size],
          isDisabled && "cursor-not-allowed opacity-70",
          className
        )}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {isLoading ? (
          <motion.span
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Memuat...</span>
          </motion.span>
        ) : (
          <motion.span
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </motion.span>
        )}
      </motion.button>
    );
  }
);

KopdesButton.displayName = "KopdesButton";

export { KopdesButton, buttonVariants };
export type { ButtonVariant, ButtonSize };
