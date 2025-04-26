import React from 'react';
import { 
  RefreshCwIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  LoaderIcon,
  DatabaseIcon,
  DropletIcon
} from 'lucide-react';
import { mockDataSources } from '../data/mockData';
import { format, formatDistanceToNow } from 'date-fns';

const DataSources: React.FC = () => {
  const [dataSources, setDataSources] = React.useState(mockDataSources);
  const [refreshing, setRefreshing] = React.useState<string | null>(null);

  const handleRefresh = (sourceId: string) => {
    setRefreshing(sourceId);
    
    setTimeout(() => {
      setDataSources(
        dataSources.map(source => 
          source.id === sourceId 
            ? { 
                ...source, 
                lastSynced: new Date().toISOString(),
                status: 'online'
              } 
            : source
        )
      );
      setRefreshing(null);
    }, 2000);
  };

  const getStatusIcon = (status: string, id: string) => {
    if (refreshing === id) {
      return <LoaderIcon className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />;
      case 'syncing':
        return <LoaderIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Online</span>;
      case 'offline':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Offline</span>;
      case 'syncing':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Syncing</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Water Level Sources</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Connected Water Monitoring Services</h2>
          <button
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <DropletIcon className="w-4 h-4 mr-1" />
            Add New Source
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Synced
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataSources.map((source) => (
                <tr key={source.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-50 rounded-md">
                        <DatabaseIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{source.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{source.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(source.status, source.id)}
                      <span className="ml-2">{getStatusBadge(source.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="text-sm">{format(new Date(source.lastSynced), 'MMM d, yyyy HH:mm')}</div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(source.lastSynced), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRefresh(source.id)}
                      disabled={refreshing === source.id}
                      className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs leading-4 font-medium rounded-md ${
                        refreshing === source.id
                          ? 'text-gray-400 bg-gray-50'
                          : 'text-gray-700 bg-white hover:bg-gray-50'
                      } focus:outline-none transition ease-in-out duration-150`}
                    >
                      <RefreshCwIcon className={`mr-1 h-4 w-4 ${refreshing === source.id ? 'animate-spin' : ''}`} />
                      {refreshing === source.id ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Water Level Integration Status</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Data Ingestion Pipeline</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Last processed: {formatDistanceToNow(new Date(Date.now() - 15 * 60 * 1000), { addSuffix: true })}</span>
                <span>92% success rate</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">API Response Time</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Average: 245ms</span>
                <span>85% below threshold</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Data Completeness</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>78% of lakes reporting complete data</span>
                <span>22% partial or missing</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Latest Integration Events</h3>
              <div className="space-y-3">
                {[
                  { time: '15 minutes ago', event: 'Data sync completed for USGS Water Services', status: 'success' },
                  { time: '1 hour ago', event: 'NASA G-REALM data ingestion complete', status: 'success' },
                  { time: '3 hours ago', event: 'OGC SensorThings API connection failed', status: 'error' },
                  { time: '1 day ago', event: 'Data processing pipeline restarted', status: 'warning' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                      item.status === 'success' ? 'bg-green-100' : 
                      item.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        item.status === 'success' ? 'bg-green-500' : 
                        item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{item.event}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">System Performance</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>CPU Usage</span>
                    <span>42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Memory Usage</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Storage Usage</span>
                    <span>23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Network Bandwidth</span>
                    <span>56%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '56%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSources;