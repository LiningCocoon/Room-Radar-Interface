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
  const innerSize = typeof size === 'number' ? size - 8 : size;
  return <div className="p-1" style={{
    display: 'inline-flex'
  }}>
      <PresentationIcon size={innerSize} className={className} />
    </div>;
};
export default AVSupportIcon;