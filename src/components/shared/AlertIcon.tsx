import React from 'react';
import { AlertCircleIcon, AlertTriangleIcon, InfoIcon } from 'lucide-react';

interface AlertIconProps {
  severity: string;
  className?: string;
}

const AlertIcon: React.FC<AlertIconProps> = ({ severity, className = "w-5 h-5" }) => {
  switch (severity) {
    case 'danger':
      return <AlertCircleIcon className={`${className} text-red-500`} />;
    case 'warning':
      return <AlertTriangleIcon className={`${className} text-yellow-500`} />;
    default:
      return <InfoIcon className={`${className} text-blue-500`} />;
  }
};

export default AlertIcon;