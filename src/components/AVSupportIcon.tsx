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
  return <PresentationIcon size={size} className={className} />;
};
export default AVSupportIcon;