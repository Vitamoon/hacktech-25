import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircleIcon, AlertTriangleIcon, InfoIcon } from 'lucide-react';
import { Alert } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface RecentAlertsProps {
  alerts: Alert[];
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No alerts to display
      </div>
    );
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'danger':
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <InfoIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {alerts.map((alert) => (
        <div key={alert.id} className="p-4 hover:bg-gray-50">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              {getAlertIcon(alert.severity)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                <Link to={`/lakes/${alert.lakeId}`} className="hover:underline">
                  {alert.lakeName}
                </Link>
              </div>
              <p className="text-sm text-gray-500">{alert.message}</p>
              <div className="mt-1 flex items-center">
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </p>
                {!alert.acknowledged && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                    New
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="p-3 bg-gray-50">
        <Link
          to="/alerts"
          className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all alerts
        </Link>
      </div>
    </div>
  );
};

export default RecentAlerts;