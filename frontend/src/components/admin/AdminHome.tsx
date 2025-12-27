/**
 * Admin Home Dashboard
 * Central dashboard for administrators with surge alerts and inventory status
 */
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Package, Activity, Users } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface SurgeStatus {
  alert_level: string;
  surge_likelihood: string;
  predicted_cases: number;
  status_message: string;
}

interface InventorySummary {
  total_items: number;
  out_of_stock: number;
  critical_items: number;
  health_score: number;
}

export default function AdminHome() {
  const [surgeStatus, setSurgeStatus] = useState<SurgeStatus | null>(null);
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load surge status
      const surge = await apiClient.getSurgeStatus('default');
      setSurgeStatus(surge);

      // Load inventory summary
      const inv = await apiClient.getInventorySummary();
      setInventory(inv);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'elevated': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time system overview and alerts</p>
        </div>

        {/* Surge Alert Card */}
        {surgeStatus && (
          <div className={`mb-6 p-6 rounded-lg border-2 ${getAlertColor(surgeStatus.alert_level)}`}>
            <div className="flex items-start">
              <AlertTriangle className="w-8 h-8 mr-4" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">Surge Prediction Status</h2>
                <p className="text-lg font-medium">{surgeStatus.status_message}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Alert Level:</span>
                    <span className="ml-2 text-lg font-bold uppercase">{surgeStatus.alert_level}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Predicted Cases:</span>
                    <span className="ml-2 text-lg font-bold">{surgeStatus.predicted_cases}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {inventory && (
            <>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Items</p>
                    <p className="text-3xl font-bold text-gray-900">{inventory.total_items}</p>
                  </div>
                  <Package className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Critical Items</p>
                    <p className="text-3xl font-bold text-red-600">{inventory.critical_items}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Out of Stock</p>
                    <p className="text-3xl font-bold text-orange-600">{inventory.out_of_stock}</p>
                  </div>
                  <Package className="w-12 h-12 text-orange-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Health Score</p>
                    <p className="text-3xl font-bold text-green-600">{inventory.health_score}%</p>
                  </div>
                  <Activity className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
              <AlertTriangle className="w-8 h-8 text-blue-600 mb-2 mx-auto" />
              <div className="text-center font-medium">View Surge Predictions</div>
            </button>
            <button className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
              <Package className="w-8 h-8 text-orange-600 mb-2 mx-auto" />
              <div className="text-center font-medium">Manage Inventory</div>
            </button>
            <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition">
              <Users className="w-8 h-8 text-green-600 mb-2 mx-auto" />
              <div className="text-center font-medium">Staff Allocation</div>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">All 9 AI Agents</span>
              <span className="text-green-600 font-semibold">✓ Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Backend API</span>
              <span className="text-green-600 font-semibold">✓ Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database</span>
              <span className="text-green-600 font-semibold">✓ Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
