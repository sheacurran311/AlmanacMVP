import React from 'react';

interface CustomerStatsProps {
  stats: {
    total_customers: number;
    active_customers: number;
    new_customers_last_30_days: number;
  } | null;
}

export const CustomerStats: React.FC<CustomerStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-8">
      <h2 className="text-xl font-semibold mb-4">Customer Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total Customers</p>
          <p className="text-2xl font-bold">{stats.total_customers}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Active Customers</p>
          <p className="text-2xl font-bold">{stats.active_customers}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">New Customers (Last 30 Days)</p>
          <p className="text-2xl font-bold">{stats.new_customers_last_30_days}</p>
        </div>
      </div>
    </div>
  );
};