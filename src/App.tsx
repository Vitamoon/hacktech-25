import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Housing from './pages/Housing';
import LakeDetails from './pages/LakeDetails';
// Removed AlertProvider import
import { DataProvider } from './context/DataContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <DataProvider>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header toggleSidebar={toggleSidebar} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/housing" element={<Housing />} />
                <Route path="/lakes/:id" element={<LakeDetails />} />
                {/* Removed routes for /alerts, /data-sources, /reports */}
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;