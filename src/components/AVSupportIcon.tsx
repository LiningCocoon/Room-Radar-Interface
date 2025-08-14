import React from 'react';
interface AVSupportIconProps {
  className?: string;
  size?: number;
}
const AVSupportIcon: React.FC<AVSupportIconProps> = ({
  className = '',
  size = 24
}) => {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>;
};
export default AVSupportIcon;