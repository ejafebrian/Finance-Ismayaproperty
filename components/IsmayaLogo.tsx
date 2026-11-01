'use client';

import React from 'react';

interface IsmayaLogoProps {
  className?: string;
  size?: number;
}

export function IsmayaLogo({ className = 'w-10 h-10', size = 40 }: IsmayaLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C5A059" />
            <stop offset="50%" stopColor="#A37F39" />
            <stop offset="100%" stopColor="#8A6624" />
          </linearGradient>
        </defs>
        {/* Ismaya Property Geometric Brandmark matching uploaded image */}
        <path
          d="M25 20H55L40 35H25V20Z"
          fill="url(#goldGradient)"
        />
        <path
          d="M25 38H65L50 53H25V38Z"
          fill="url(#goldGradient)"
        />
        <path
          d="M25 56H75L60 71H25V56Z"
          fill="url(#goldGradient)"
        />
        <path
          d="M25 74H55L70 59H85V74H70L55 89H25V74Z"
          fill="url(#goldGradient)"
        />
        <rect x="73" y="32" width="14" height="26" rx="2" fill="url(#goldGradient)" />
      </svg>
    </div>
  );
}
