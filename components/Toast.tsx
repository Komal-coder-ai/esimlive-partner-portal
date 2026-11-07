'use client';

import React from 'react';

interface ToastProps {
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed left-1/2 bottom-7 -translate-x-1/2 bg-dark-bg text-white px-5 py-3 rounded-full text-sm font-medium shadow-2xl flex items-center gap-2 z-50 animate-bounce duration-300">
      <i className="ph-fill ph-check-circle text-primary-accent text-lg"></i>
      <span>{message}</span>
    </div>
  );
};

