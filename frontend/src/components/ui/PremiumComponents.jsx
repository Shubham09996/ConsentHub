import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx'; // FIX: Removed 'type ClassValue'
import { twMerge } from 'tailwind-merge';

// Utility for merging classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 1. Glass Card (Background Blur)
export const GlassCard = ({ children, className, hoverEffect = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={hoverEffect ? { y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" } : {}}
    className={cn(
      "bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm overflow-hidden",
      className
    )}
  >
    {children}
  </motion.div>
);

// 2. Premium Button
export const Button = ({ children, variant = 'primary', className, icon: Icon, isLoading, ...props }) => {
  const variants = {
    primary: "bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };

  return (
    <button
      className={cn(
        "px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]",
        variants[variant],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-current rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
};

// 3. Styled Input Field
export const InputGroup = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>}
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-600 transition-colors" size={20} />
      )}
      <input
        className={cn(
          "w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 text-gray-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-gray-400",
          Icon ? "pl-12 pr-4" : "px-4"
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
  </div>
);

// 4. Status Badge
export const Badge = ({ status, text }) => {
  const styles = {
    active: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    revoked: "bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-100 text-gray-600 border-gray-200"
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit",
      styles[status] || styles.default
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", 
        status === 'active' ? 'bg-green-600' : 
        status === 'pending' ? 'bg-orange-500' : 
        status === 'revoked' ? 'bg-red-500' : 'bg-gray-500'
      )} />
      {text || status}
    </span>
  );
};