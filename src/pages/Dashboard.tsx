import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircleIcon, DropletIcon, SearchIcon } from 'lucide-react';
import LakeMap from '../components/LakeMap';
import StatusSummary from '../components/StatusSummary';
import RecentAlerts from '../components/RecentAlerts';
import { mockLakes, mockAlerts } from '../data/mockData';
import { useMemo } from 'react';

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Using useMemo for better performance
  const filteredLakes = useMemo(() => 
    mockLakes.filter(lake => lake.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );
  
  const alertsByStatus = useMemo(() => ({
    danger: mockAlerts.filter(alert => alert.severity === 'danger' && !alert.acknowledged).length,
    warning: mockAlerts.filter(alert => alert.severity === 'warning' && !alert.acknowledged).length,
    info: mockAlerts.filter(alert => alert.severity === 'info' && !alert.acknowledged).length,
  }), [mockAlerts]);
  
  const lakesByStatus = useMemo(() => ({
    normal: mockLakes.filter(lake => lake.status === 'normal').length,
    warning: mockLakes.filter(lake => lake.status === 'warning').length,
    danger: mockLakes.filter(lake => lake.status === 'danger').length,
    low: mockLakes.filter(lake => lake.status === 'low').length,
  }), [mockLakes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Water Level Dashboard</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search lakes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusSummary
          title="Normal Lakes"
          count={lakesByStatus.normal}
          icon={<DropletIcon className="h-5 w-5 text-green-500" />}
          color="bg-green-100 text-green-800"
        />
        <StatusSummary
          title="Warning Levels"
          count={lakesByStatus.warning}
          icon={<DropletIcon className="h-5 w-5 text-yellow-500" />}
          color="bg-yellow-100 text-yellow-800"
        />
        <StatusSummary
          title="Danger Levels"
          count={lakesByStatus.danger}
          icon={<DropletIcon className="h-5 w-5 text-red-500" />}
          color="bg-red-100 text-red-800"
        />
        <StatusSummary
          title="Low Levels"
          count={lakesByStatus.low}
          icon={<DropletIcon className="h-5 w-5 text-blue-500" />}
          color="bg-blue-100 text-blue-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lake Locations</h2>
          </div>
          <div className="h-[400px]">
            <LakeMap lakes={filteredLakes} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Alerts</h2>
          </div>
          <RecentAlerts alerts={mockAlerts.slice(0, 4)} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Lakes Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lake Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Normal Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLakes.map((lake) => (
                <tr key={lake.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{lake.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lake.currentLevel}m</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lake.normalLevel}m</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${lake.status === 'normal' ? 'bg-green-100 text-green-800' : 
                        lake.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                        lake.status === 'danger' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {lake.status.charAt(0).toUpperCase() + lake.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lake.lastUpdated).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link 
                      to={`/lakes/${lake.id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;