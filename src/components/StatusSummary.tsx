import React from 'react';

interface StatusSummaryProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

// Change to:
const StatusSummary: React.FC<StatusSummaryProps> = React.memo(({ title, count, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{count}</p>
        </div>
      </div>
    </div>
  );
});

export default StatusSummary;