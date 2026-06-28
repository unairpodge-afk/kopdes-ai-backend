"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/kopdes/utils";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

// Input variants
const inputVariants = {
  base: "flex w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    default: "border-gray-200 focus:border-red-500 focus:ring-red-500/20",
    error: "border-red-500 focus:border-red-600 focus:ring-red-500/20",
    success: "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500/20",
    warning: "border-amber-500 focus:border-amber-600 focus:ring-amber-500/20",
    filled: "border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-red-500/20",
  },
};

export interface KopdesInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: keyof typeof inputVariants.variants;
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * KopDes Input Component
 * Animated input with Village Cooperative theme
 */
const KopdesInput = React.forwardRef<HTMLInputElement, KopdesInputProps>(
  (
    {
      className,
      variant = "default",
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      isLoading,
      size = "md",
      disabled,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

    const sizeClasses = {
      sm: "py-2 px-3 text-sm",
      md: "py-3 px-4 text-sm",
      lg: "py-4 px-5 text-base",
    };

    const stateVariant = error ? "error" : success ? "success" : variant;

    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <motion.label
            className={cn(
              "block text-sm font-semibold mb-2",
              isFocused ? "text-red-600" : "text-gray-700"
            )}
            animate={{ color: isFocused ? "#dc2626" : "#374151" }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <motion.div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              animate={{ color: isFocused ? "#dc2626" : "#9ca3af" }}
            >
              {leftIcon}
            </motion.div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled || isLoading}
            className={cn(
              inputVariants.base,
              inputVariants.variants[stateVariant],
              sizeClasses[size],
              leftIcon && "pl-10",
              (rightIcon || type === "password") && "pr-10",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right Icon / Password Toggle / Loading */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-4 h-4 text-gray-400" />
              </motion.div>
            ) : (
              <>
                {success && !error && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </motion.div>
                )}
                {type === "password" && !isLoading && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                )}
                {rightIcon && !error && !success && (
                  <div className="text-gray-400">{rightIcon}</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Helper Text / Error / Success */}
        <AnimatePresence mode="wait">
          {(error || success || helperText) && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "mt-1.5 text-xs",
                error
                  ? "text-red-600"
                  : success
                  ? "text-emerald-600"
                  : "text-gray-500"
              )}
            >
              {error || success || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);
KopdesInput.displayName = "KopdesInput";

// Textarea variant
export interface KopdesTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: keyof typeof inputVariants.variants;
  label?: string;
  error?: string;
}

const KopdesTextarea = React.forwardRef<HTMLTextAreaElement, KopdesTextareaProps>(
  ({ className, variant = "default", label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const stateVariant = error ? "error" : variant;

    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {label && (
          <label
            className={cn(
              "block text-sm font-semibold mb-2 transition-colors",
              isFocused ? "text-red-600" : "text-gray-700"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            inputVariants.base,
            inputVariants.variants[stateVariant],
            "py-3 min-h-[100px] resize-y",
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1.5 text-xs text-red-600"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);
KopdesTextarea.displayName = "KopdesTextarea";

export { KopdesInput, KopdesTextarea, inputVariants };
