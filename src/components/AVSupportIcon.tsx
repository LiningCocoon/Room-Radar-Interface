import React from 'react';
interface AVSupportIconProps {
  className?: string;
  size?: number;
}
const AVSupportIcon: React.FC<AVSupportIconProps> = ({
  className = '',
  size = 24
}) => {
  // Determine badge size based on input size
  const fontSize = typeof size === 'number' ? Math.max(10, Math.round(size * 0.45)) : 12;
  const padding = typeof size === 'number' ? Math.max(2, Math.round(size * 0.15)) : 4;
  return <div className={`inline-flex items-center justify-center rounded-md font-bold group ${className}`} style={{
    fontSize: `${fontSize}px`,
    padding: `${padding}px ${padding * 1.5}px`,
    backgroundColor: 'currentColor',
    color: 'currentColor',
    opacity: 0.9
  }} aria-label="Requires A/V support" role="img">
      <span style={{
      color: 'inherit',
      filter: 'invert(1) grayscale(1) contrast(9)'
    }}>
        A/V
      </span>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
        Requires A/V support
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>;
};
export default AVSupportIcon;