import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AlertProvider } from './contexts/AlertContext'; // Add this import

// Components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LakeDetails from './pages/LakeDetails';
import DataSources from './pages/DataSources';
import Alerts from './pages/Alerts';
import Housing from './pages/Housing';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AlertProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lakes/:lakeId" element={<LakeDetails />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/housing" element={<Housing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AlertProvider>
  );
}

export default App;