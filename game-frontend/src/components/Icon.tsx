import React from 'react';

export type IconName = 'login' | 'mfa' | 'points' | 'redeem' | 'share' | 'logout' | 'wheel';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

const paths: Record<IconName, React.ReactNode> = {
  login: (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </>
  ),
  mfa: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M9 18h6" />
      <circle cx="12" cy="7" r="2" />
    </>
  ),
  points: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1 3 2.4c0 1.9-3 2-3 4.1M12 17v.5" />
    </>
  ),
  redeem: (
    <>
      <rect x="2" y="7" width="20" height="13" rx="2" />
      <path d="M2 11h20" />
      <path d="M7 16h.01M12 16h3" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.3 10.8l7.4-3.6M8.3 13.2l7.4 3.6" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  wheel: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
};

const Icon: React.FC<IconProps> = ({ name, size = 22, className }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {paths[name]}
  </svg>
);

export default Icon;
