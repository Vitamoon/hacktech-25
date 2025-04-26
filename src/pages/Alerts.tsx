import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircleIcon, AlertTriangleIcon, InfoIcon, SearchIcon, FilterIcon, CheckIcon } from 'lucide-react';
import { mockAlerts } from '../data/mockData';

const Alerts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'acknowledged' | 'unacknowledged'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'danger'>('all');
  const [alerts, setAlerts] = useState(mockAlerts);

  const filteredAlerts = alerts
    .filter(alert => 
      alert.lakeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(alert => 
      filterStatus === 'all' || 
      (filterStatus === 'acknowledged' && alert.acknowledged) ||
      (filterStatus === 'unacknowledged' && !alert.acknowledged)
    )
    .filter(alert => 
      filterSeverity === 'all' || alert.severity === filterSeverity
    );

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

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(
      alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Alert Management</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
            <h2 className="text-lg font-medium text-gray-900">Active Alerts</h2>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex space-x-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="unacknowledged">Unacknowledged</option>
                </select>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value as any)}
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Severity</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <InfoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No alerts match your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lake
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getAlertIcon(alert.severity)}
                        <span className={`ml-2 text-xs font-medium capitalize ${
                          alert.severity === 'danger' ? 'text-red-700' :
                          alert.severity === 'warning' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/lakes/${alert.lakeId}`} className="text-blue-600 hover:text-blue-900">
                        {alert.lakeName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{alert.message}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {alert.acknowledged ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Acknowledged
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-green-700 text-xs leading-4 font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none"
                        >
                          <CheckIcon className="mr-1 h-4 w-4" />
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;