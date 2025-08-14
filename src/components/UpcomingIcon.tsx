import React from 'react';
interface UpcomingIconProps {
  className?: string;
  size?: number;
}
const UpcomingIcon: React.FC<UpcomingIconProps> = ({
  className = '',
  size = 24
}) => {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="m15 8-6 6" />
    </svg>;
};
export default UpcomingIcon;