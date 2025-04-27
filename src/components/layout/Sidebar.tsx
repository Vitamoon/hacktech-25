import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MapPin, BarChart2 } from 'lucide-react'; // Removed AlertCircle, Database, FileText

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
      <div className="flex flex-col items-center justify-between flex-shrink-0 p-4">
        {/* Logo added above the title */}
        <div className="flex flex-col items-center mb-2">
          <img 
            src="/logo.png" 
            alt="Watered-down Properties Logo" 
            className="w-64 h-64 mb-2"
          />
          <span className="flex items-center text-xl font-medium text-white pl-6">
            {/* <BarChart2 className="w-6 h-6 mr-2" /> */}
            
            Watered-down Properties
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 text-white rounded-md lg:hidden hover:text-gray-200 focus:outline-none absolute top-4 right-4"
        >
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
          {/* Removed Alerts NavLink */}
          {/* Removed Data Sources NavLink */}
          {/* Removed Reports NavLink */}
        </ul>
      </nav>
      <div className="flex-shrink-0 p-4 mt-auto">
        <div className="flex items-center justify-center mb-3"> {/* Centered flex container */}
          <a
            href="https://vly.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-200 hover:text-white transition-colors"
          >
            Thank you to Vly.ai!
          </a>
          <img
            src="https://framerusercontent.com/images/jiy6EMFz7k7FVqGsPe0Kk5fZMrc.png"
            alt="Vly.ai logo"
            className="h-8 w-auto ml-2" // vly attribution
          />
        </div>
        <div className="border-t border-blue-700 pt-3"> {/* Added pt-3 for spacing */}
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full"
              src="/hacktech-logo.png"
              alt="User avatar"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin Profile</p>
              <p className="text-xs text-blue-200">Hacktech 2025</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;