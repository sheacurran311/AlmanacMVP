import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import NewCampaign from './pages/NewCampaign';
import Rewards from './pages/Rewards';
import RewardDetails from './pages/RewardDetails';
import NewReward from './pages/NewReward';
import Customers from './pages/Customers';
import NewCustomer from './pages/NewCustomer';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<><Header /><Home /></>} />
          <Route path="/about" element={<><Header /><About /></>} />
          <Route path="/pricing" element={<><Header /><Pricing /></>} />
          <Route path="/register" element={<><Header /><Register /></>} />
          <Route path="/login" element={<><Header /><Login /></>} />
          <Route
            path="/dashboard/:tenantId"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:tenantId/campaigns"
            element={
              <ProtectedRoute>
                <Layout>
                  <Campaigns />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:tenantId/campaigns/:campaignId"
            element={
              <ProtectedRoute>
                <Layout>
                  <CampaignDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:tenantId/campaigns/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewCampaign />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:tenantId/rewards"
            element={
              <ProtectedRoute>
                <Layout>
                  <Rewards />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:tenantId/rewards/:rewardId"
            element={
              <ProtectedRoute>
                <Layout>
                  <RewardDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:tenantId/rewards/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewReward />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:tenantId/customers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:tenantId/customers/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewCustomer />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;