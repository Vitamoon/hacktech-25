import React from 'react';
import { Bell, Settings } from 'lucide-react';
// Removed useAlertContext import

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  // Removed useAlertContext call and unreadAlerts calculation

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            className="p-1 mr-4 text-gray-500 rounded-md lg:hidden hover:text-blue-600 focus:outline-none"
            onClick={toggleSidebar}
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
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-blue-700">Housing and Sustainability Analytics Platform</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-1 text-gray-500 rounded-full hover:text-blue-600 focus:outline-none">
              <Bell size={20} />
              {/* Removed unread alerts badge */}
            </button>
          </div>
          <button className="p-1 text-gray-500 rounded-full hover:text-blue-600 focus:outline-none">
            <Settings size={20} />
          </button>
          <div className="flex items-center">
            <img
              className="w-8 h-8 rounded-full"
              src="/hacktech-logo.png"
              alt="User avatar"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;