import React from 'react';
import { PresentationIcon } from 'lucide-react';
interface AVSupportIconProps {
  className?: string;
  size?: number;
}
const AVSupportIcon: React.FC<AVSupportIconProps> = ({
  className = '',
  size = 24
}) => {
  // Calculate the inner icon size to maintain the requested size visual appearance
  // when accounting for the 8px of total padding (4px on each side)
  // Then increase the size by 15%
  const innerSize = typeof size === 'number' ? (size - 8) * 1.15 : size;
  return <div className="p-1 relative group" style={{
    display: 'inline-flex',
    borderRadius: '50%'
  }} aria-label="Requires A/V support" role="img">
      <PresentationIcon size={innerSize} className={className} />
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
        Requires A/V support
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>;
};
export default AVSupportIcon;