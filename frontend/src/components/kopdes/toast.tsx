"use client";

import * as React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "../../lib/kopdes/utils";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

// Toast variants
const toastVariants: Record<string, Variants> = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

const slideVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.2 },
  },
};

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Toast Icon component
const ToastIcon = ({ type }: { type: ToastType }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };
  return icons[type];
};

// Toast Item
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const bgClasses = {
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <motion.div
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm",
        bgClasses[toast.type]
      )}
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
    >
      <ToastIcon type={toast.type} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-gray-600">{toast.description}</p>
        )}
      </div>

      <motion.button
        className="p-1 rounded-full hover:bg-black/5 transition-colors"
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <X className="w-4 h-4 text-gray-400" />
      </motion.button>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-amber-500 rounded-b-xl"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

// Toast Container
interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Standalone toast function
let toastFn: ToastContextType["addToast"] | null = null;

export function setToastFunction(fn: ToastContextType["addToast"]) {
  toastFn = fn;
}

export const toast = {
  success: (title: string, description?: string) =>
    toastFn?.({ type: "success", title, description }),
  error: (title: string, description?: string) =>
    toastFn?.({ type: "error", title, description }),
  warning: (title: string, description?: string) =>
    toastFn?.({ type: "warning", title, description }),
  info: (title: string, description?: string) =>
    toastFn?.({ type: "info", title, description }),
};

// Toast notification hook
export function useToastNotification() {
  const { addToast } = useToast();

  return React.useMemo(
    () => ({
      success: (title: string, description?: string) =>
        addToast({ type: "success", title, description }),
      error: (title: string, description?: string) =>
        addToast({ type: "error", title, description }),
      warning: (title: string, description?: string) =>
        addToast({ type: "warning", title, description }),
      info: (title: string, description?: string) =>
        addToast({ type: "info", title, description }),
    }),
    [addToast]
  );
}

// Success celebration animation component
export function SuccessCelebration({
  isVisible,
  onComplete,
}: {
  isVisible: boolean;
  onComplete?: () => void;
}) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 text-center shadow-2xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
        >
          <motion.svg
            className="w-10 h-10 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          </motion.svg>
        </motion.div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Berhasil!
        </h3>
        <p className="text-gray-600">Transaksi berhasil diproses</p>

        {/* Confetti particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"][i % 4],
              left: "50%",
              top: "50%",
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400,
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 0.3 + i * 0.05,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export { ToastContainer, ToastItem };
