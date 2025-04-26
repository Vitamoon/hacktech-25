import React from 'react';
import { BarChart, ArrowUp, ArrowDown, Activity } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'orange';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  trendLabel,
  icon,
  color,
}) => {
  // Determine color styles based on color prop
  const colorStyles = {
    blue: {
      bgLight: 'bg-blue-50',
      bgDark: 'bg-blue-500',
      text: 'text-blue-700',
      icon: 'text-blue-500',
    },
    green: {
      bgLight: 'bg-green-50',
      bgDark: 'bg-green-500',
      text: 'text-green-700',
      icon: 'text-green-500',
    },
    red: {
      bgLight: 'bg-red-50',
      bgDark: 'bg-red-500',
      text: 'text-red-700',
      icon: 'text-red-500',
    },
    orange: {
      bgLight: 'bg-orange-50',
      bgDark: 'bg-orange-500',
      text: 'text-orange-700',
      icon: 'text-orange-500',
    },
  }[color];
  
  // Determine trend direction and styling
  const trendIcon = trend && trend > 0 ? (
    <ArrowUp className="w-3 h-3" />
  ) : (
    <ArrowDown className="w-3 h-3" />
  );
  
  const trendColor = trend && trend > 0 ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${colorStyles.bgLight} mr-4`}>
            {icon || <Activity className={`w-6 h-6 ${colorStyles.icon}`} />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
        
        {trend !== undefined && (
          <div className="mt-4 flex items-center">
            <span className={`flex items-center text-sm ${trendColor}`}>
              {trendIcon}
              <span className="ml-1">{Math.abs(trend)}%</span>
            </span>
            <span className="ml-2 text-sm text-gray-500">{trendLabel || 'vs. last month'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;