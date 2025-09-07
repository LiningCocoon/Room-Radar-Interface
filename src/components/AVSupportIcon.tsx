import React from 'react';
interface AVSupportIconProps {
  className?: string;
  size?: number;
}
const AVSupportIcon: React.FC<AVSupportIconProps> = ({
  className = '',
  size = 24
}) => {
  // Calculate dimensions based on the icon size
  const iconSize = typeof size === 'number' ? size : 24;
  return <div className={`relative group absolute bottom-1 left-1 ${className}`} aria-label="Requires A/V support" role="img" style={{
    width: `${iconSize}px`,
    height: `${iconSize}px`
  }}>
      {/* W3-style computer icon SVG */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* Computer monitor */}
        <rect x="3" y="3" width="18" height="12" rx="2" ry="2" />
        {/* Computer stand */}
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="15" x2="12" y2="21" />
      </svg>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
        Requires A/V support
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>;
};
export default AVSupportIcon;