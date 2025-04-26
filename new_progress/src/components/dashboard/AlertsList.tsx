import React from 'react';
import { format, parseISO } from 'date-fns';
import { useAlertContext } from '../../context/AlertContext';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AlertsList: React.FC = () => {
  const { alerts, markAsRead } = useAlertContext();
  
  if (alerts.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <Info className="h-10 w-10 mx-auto text-blue-500 mb-2" />
        <p className="text-gray-600">No alerts at this time</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Recent Alerts</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={`p-4 transition-colors duration-200 ${
              alert.isRead ? 'bg-white' : 'bg-blue-50'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle 
                  className={`h-5 w-5 ${
                    alert.type === 'high' ? 'text-red-600' : 'text-orange-600'
                  }`} 
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(alert.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Level: {alert.level.toFixed(1)} ft
                </p>
                {!alert.isRead && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsList;