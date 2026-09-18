import React from 'react';

interface BrandMarkProps {
  size?: number;
}

const BrandMark: React.FC<BrandMarkProps> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="44" height="44" rx="12" fill="#6366f1" />
    <path d="M24 8l16 8v4H8v-4l16-8z" fill="#e0e7ff" />
    <rect x="10" y="21" width="4" height="14" fill="#e0e7ff" />
    <rect x="18" y="21" width="4" height="14" fill="#e0e7ff" />
    <rect x="26" y="21" width="4" height="14" fill="#e0e7ff" />
    <rect x="34" y="21" width="4" height="14" fill="#e0e7ff" />
    <rect x="7" y="37" width="34" height="4" rx="1" fill="#e0e7ff" />
  </svg>
);

export default BrandMark;
