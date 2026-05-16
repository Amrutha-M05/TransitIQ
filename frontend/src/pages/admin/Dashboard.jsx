import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { MessageSquare, Clock, Star, AlertCircle } from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/summary'), api.get('/analytics/delay-trends')])
      .then(([s, t]) => { setSummary(s); setTrends(t); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const topDelayed = trends?.topDelayed?.map(d => ({
    name: d.route?.routeCode || 'Unknown',
    count: d.count,
    avgDelay: Math.round(d.avgDelay || 0)
  })) || [];

  const categoryData = trends?.ratingByCategory?.map(c => ({
    name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
    avg: parseFloat(c.avgRating.toFixed(1)),
    count: c.count
  })) || [];

  const dailyData = trends?.last7Days?.map(d => ({
    date: d._id.slice(5),
    reports: d.count
  })) || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-sub">System overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Feedback', value: summary?.totalFeedback, icon: MessageSquare, color: 'blue' },
          { label: 'Avg Rating', value: `${summary?.averageRating}★`, icon: Star, color: 'yellow' },
          { label: 'Total Delays', value: summary?.totalDelays, icon: Clock, color: 'red' },
          { label: 'Pending Review', value: summary?.pendingFeedback, icon: AlertCircle, color: 'orange' }
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-9 h-9 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 text-${color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Top Delayed Routes</h2>
          {topDelayed.length === 0 ? <p className="text-sm text-gray-400">No data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topDelayed} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Delays — Last 7 Days</h2>
          {dailyData.length === 0 ? <p className="text-sm text-gray-400">No data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Reports" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Average Rating by Category</h2>
        {categoryData.length === 0 ? <p className="text-sm text-gray-400">No data yet</p> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]} name="Avg Rating">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
