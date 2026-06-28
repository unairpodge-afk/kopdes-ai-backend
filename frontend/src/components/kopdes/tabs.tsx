"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/kopdes/utils";

// Tab animation variants
const tabListVariants = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const tabVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface KopdesTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * KopDes Tabs Component
 * Animated tabs with Village Cooperative theme
 */
export function KopdesTabs({
  tabs,
  defaultTab,
  onChange,
  variant = "default",
  size = "md",
  className,
}: KopdesTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    default: "bg-white border border-gray-200 rounded-lg p-1 shadow-sm",
    pills: "",
    underline: "border-b border-gray-200",
    gradient: "bg-gradient-to-r from-red-600/5 to-amber-500/5 rounded-lg p-1",
  };

  const tabClasses = {
    default: (isActive: boolean) =>
      cn(
        "flex-1 flex items-center justify-center gap-2 rounded-md font-semibold transition-all",
        sizeClasses[size],
        isActive
          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      ),
    pills: (isActive: boolean) =>
      cn(
        "flex items-center justify-center gap-2 rounded-full font-semibold transition-all",
        sizeClasses[size],
        isActive
          ? "bg-red-600 text-white"
          : "text-gray-600 hover:text-gray-900 hover:bg-red-50"
      ),
    underline: (isActive: boolean) =>
      cn(
        "flex items-center justify-center gap-2 font-semibold transition-all relative",
        sizeClasses[size],
        isActive ? "text-red-600" : "text-gray-600 hover:text-gray-900"
      ),
    gradient: (isActive: boolean) =>
      cn(
        "flex-1 flex items-center justify-center gap-2 rounded-lg font-semibold transition-all",
        sizeClasses[size],
        isActive
          ? "bg-white text-red-600 shadow-md"
          : "text-gray-600 hover:text-gray-900"
      ),
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Tab List */}
      <motion.div
        className={cn("flex", variantClasses[variant])}
        variants={tabListVariants}
        initial="hidden"
        animate="visible"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={cn(
              tabClasses[variant](activeTab === tab.id),
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            variants={tabVariants}
            whileHover={!tab.disabled ? { scale: 1.02 } : undefined}
            whileTap={!tab.disabled ? { scale: 0.98 } : undefined}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Active indicator for underline variant */}
      {variant === "underline" && (
        <div className="relative -mt-0.5">
          <motion.div
            className="absolute h-0.5 bg-gradient-to-r from-red-600 to-amber-500"
            initial={false}
            animate={{
              width: `${100 / tabs.length}%`,
              x: `${tabs.findIndex((t) => t.id === activeTab) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      )}

      {/* Tab Content */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {tabs.map(
            (tab) =>
              tab.id === activeTab && (
                <motion.div
                  key={tab.id}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {tab.content}
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Accordion Tabs variant
export interface AccordionItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export interface KopdesAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function KopdesAccordion({
  items,
  allowMultiple = false,
  className,
}: KopdesAccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(
    items.filter((item) => item.defaultOpen).map((item) => item.id)
  );

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn("flex flex-col divide-y divide-gray-100", className)}>
      {items.map((item, index) => {
        const isOpen = openItems.includes(item.id);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <button
              className="w-full flex items-center justify-between py-4 px-2 text-left hover:bg-red-50/50 transition-colors rounded-lg"
              onClick={() => toggleItem(item.id)}
            >
              <span className="flex items-center gap-3 font-semibold text-gray-900">
                {item.icon && <span className="text-red-600">{item.icon}</span>}
                <span>{item.title}</span>
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-400"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 px-2 text-gray-600">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
