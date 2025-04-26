import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Housing from './pages/Housing';
import LakeDetails from './pages/LakeDetails';
import { AlertProvider } from './context/AlertContext';
import { DataProvider } from './context/DataContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <DataProvider>
        <AlertProvider>
          <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header toggleSidebar={toggleSidebar} />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                <div className="container px-4 py-6 mx-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/lake/:id" element={<LakeDetails />} />
                    <Route path="/housing" element={<Housing />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </AlertProvider>
      </DataProvider>
    </Router>
  );
}

export default App;