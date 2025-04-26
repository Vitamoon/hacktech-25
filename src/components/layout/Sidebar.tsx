import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, Home, MapPin, AlertCircle, Database, FileText } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex flex-col flex-shrink-0 w-64 max-h-screen overflow-hidden transition-all transform bg-blue-800 shadow-lg lg:z-auto lg:static lg:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex items-center justify-between flex-shrink-0 p-4">
        <span className="flex items-center text-xl font-medium text-white">
          <BarChart2 className="w-6 h-6 mr-2" />
          AquaMonitor
        </span>
        <button
          onClick={toggleSidebar}
          className="p-1 text-white rounded-md lg:hidden hover:text-gray-200 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
      <nav className="flex-1 overflow-auto">
        <ul className="p-2 overflow-hidden">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 transition-colors rounded-md ${
                  isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'
                }`
              }
            >
              <Home className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/housing"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mt-1 transition-colors rounded-md ${
                  isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'
                }`
              }
            >
              <MapPin className="w-5 h-5 mr-3" />
              <span>Housing Data</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mt-1 transition-colors rounded-md ${
                  isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'
                }`
              }
            >
              <AlertCircle className="w-5 h-5 mr-3" />
              <span>Alerts</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/data-sources"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mt-1 transition-colors rounded-md ${
                  isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'
                }`
              }
            >
              <Database className="w-5 h-5 mr-3" />
              <span>Data Sources</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mt-1 transition-colors rounded-md ${
                  isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'
                }`
              }
            >
              <FileText className="w-5 h-5 mr-3" />
              <span>Reports</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="flex-shrink-0 p-4 mt-auto border-t border-blue-700">
        <div className="flex items-center">
          <img
            className="w-10 h-10 rounded-full"
            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="User avatar"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-blue-200">Data Analyst</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;