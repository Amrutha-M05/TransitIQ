import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Clock, Users, ChevronUp, Search, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';

const crowdColors = { low: 'badge-green', medium: 'badge-yellow', high: 'badge-red', very_high: 'badge-red' };
const crowdLabel = { low: 'Low Crowd', medium: 'Moderate', high: 'Crowded', very_high: 'Very Crowded' };
const statusColors = { new: 'badge-blue', verified: 'badge-green', resolved: 'badge-gray' };

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DelayBoard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ route: '', stop: '' });
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (search.route) params.append('route', search.route);
      if (search.stop) params.append('stop', search.stop);
      const data = await api.get(`/delay/public?${params}`);
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => { e.preventDefault(); setLoading(true); load(); };
  const handleRefresh = () => { setRefreshing(true); load(); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <h1 className="font-bold text-gray-900">Live Delay Board</h1>
                </div>
                <p className="text-xs text-gray-500">Real-time delay reports from passengers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link to="/login" className="btn-primary text-sm">Sign In</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="card mb-6 smooth-enter">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-40 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input className="input pl-9" placeholder="Search route..." value={search.route} onChange={e => setSearch(s => ({ ...s, route: e.target.value }))} />
            </div>
            <div className="flex-1 min-w-40 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input className="input pl-9" placeholder="Search stop..." value={search.stop} onChange={e => setSearch(s => ({ ...s, stop: e.target.value }))} />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </div>
        </form>

        {/* Reports */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="card text-center py-16">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No delay reports found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <div className="space-y-3 smooth-enter">
            {reports.map(r => (
              <div key={r._id} className="card hover:shadow-apple-lg transition-shadow duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-gray-900 text-sm">{r.routeId?.routeCode || '—'}</span>
                      <span className="text-gray-400 text-xs">·</span>
                      <span className="text-gray-600 text-xs">{r.routeId?.routeName}</span>
                      <span className={statusColors[r.status] || 'badge-gray'}>{r.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Bus className="w-3 h-3" />{r.stopId?.stopName || '—'}</span>
                      {r.delayMinutes && (
                        <span className="flex items-center gap-1 text-red-500 font-medium">
                          <Clock className="w-3 h-3" />{r.delayMinutes} min delay
                        </span>
                      )}
                      {r.expectedTime && <span>Expected: {r.expectedTime}</span>}
                      {r.actualTime && <span>Actual: {r.actualTime}</span>}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /><span className={crowdColors[r.crowdLevel]}>{crowdLabel[r.crowdLevel]}</span></span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <ChevronUp className="w-3 h-3" />
                      <span className="font-medium">{r.upvotesCount}</span>
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
