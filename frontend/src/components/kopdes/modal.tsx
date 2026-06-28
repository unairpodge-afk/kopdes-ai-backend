"use client";

import * as React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "../../lib/kopdes/utils";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

// Animation variants
const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15, delay: 0.1 } },
};

const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const drawerVariants: Variants = {
  hidden: {
    opacity: 0,
    x: "100%",
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export interface KopdesModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

/**
 * KopDes Modal Component
 * Animated modal with Village Cooperative theme
 */
export function KopdesModal({
  isOpen,
  onClose,
  children,
  className,
  size = "md",
  showClose = true,
  closeOnOverlay = true,
  closeOnEsc = true,
}: KopdesModalProps) {
  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEsc) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEsc]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeOnOverlay ? onClose : undefined}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              className={cn(
                "relative w-full bg-white rounded-2xl shadow-2xl",
                sizeClasses[size],
                "max-h-[90vh] overflow-hidden",
                className
              )}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
            >
              {/* Decorative top bar */}
              <div className="h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

              {/* Close button */}
              {showClose && (
                <motion.button
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors z-10"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-1.5rem)]">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Modal Sub-components
export const KopdesModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 pt-6 pb-4", className)}
    {...props}
  />
));
KopdesModalHeader.displayName = "KopdesModalHeader";

export const KopdesModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
));
KopdesModalTitle.displayName = "KopdesModalTitle";

export const KopdesModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 mt-1", className)}
    {...props}
  />
));
KopdesModalDescription.displayName = "KopdesModalDescription";

export const KopdesModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
));
KopdesModalContent.displayName = "KopdesModalContent";

export const KopdesModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3",
      className
    )}
    {...props}
  />
));
KopdesModalFooter.displayName = "KopdesModalFooter";

// Drawer variant
export interface KopdesDrawerProps extends KopdesModalProps {
  position?: "left" | "right";
}

export function KopdesDrawer({
  isOpen,
  onClose,
  children,
  className,
  position = "right",
}: KopdesDrawerProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  const positionStyles = {
    left: "inset-y-0 left-0",
    right: "inset-y-0 right-0",
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className={cn(
              "fixed w-full max-w-md bg-white shadow-2xl",
              positionStyles[position]
            )}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Decorative side bar */}
            <div
              className={cn(
                "absolute top-0 w-1 h-full bg-gradient-to-b from-red-600 via-amber-500 to-red-600",
                position === "left" ? "left-0" : "right-0"
              )}
            />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Confirm Dialog
export interface KopdesConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
}

export function KopdesConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "default",
  isLoading = false,
}: KopdesConfirmDialogProps) {
  const buttonVariants = {
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
    warning: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
    default: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
  };

  return (
    <KopdesModal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
            variant === "danger" && "bg-red-100",
            variant === "warning" && "bg-amber-100",
            variant === "default" && "bg-red-100"
          )}
        >
          {variant === "danger" ? (
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </motion.div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mb-6">{description}</p>
        )}

        <div className="flex gap-3">
          <motion.button
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            onClick={onClose}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {cancelText}
          </motion.button>
          <motion.button
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all",
              buttonVariants[variant]
            )}
            onClick={onConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? "Memuat..." : confirmText}
          </motion.button>
        </div>
      </div>
    </KopdesModal>
  );
}
