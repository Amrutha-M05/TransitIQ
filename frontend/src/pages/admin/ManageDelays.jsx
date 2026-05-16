import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { ChevronUp, Clock } from 'lucide-react';

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const statusColors = { new: 'badge-blue', verified: 'badge-green', resolved: 'badge-gray' };

export default function ManageDelays() {
  const [delays, setDelays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/delay').then(setDelays).finally(() => setLoading(false));
  }, []);

  const setStatus = async (id, status) => {
    await api.patch(`/delay/${id}/status`, { status });
    setDelays(prev => prev.map(d => d._id === id ? { ...d, status } : d));
  };

  const filtered = filter === 'all' ? delays : delays.filter(d => d.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Delay Reports</h1>
        <p className="page-sub">Review and update delay report statuses</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'new', 'verified', 'resolved'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize
              ${filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-apple'}`}>
            {s} {s === 'all' ? `(${delays.length})` : `(${delays.filter(d => d.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No reports found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <div key={d._id} className="card smooth-enter">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm">{d.routeId?.routeCode || '—'}</span>
                    <span className="text-xs text-gray-400">{d.routeId?.routeName}</span>
                    <span className={`badge ${statusColors[d.status]}`}>{d.status}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex gap-3 flex-wrap mb-2">
                    <span>Stop: {d.stopId?.stopName}</span>
                    {d.delayMinutes && <span className="text-red-500 font-semibold">+{d.delayMinutes} min delay</span>}
                    {d.expectedTime && <span>Expected: {d.expectedTime}</span>}
                    {d.actualTime && <span>Actual: {d.actualTime}</span>}
                    <span className="capitalize">Crowd: {d.crowdLevel?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>By: {d.userId?.name}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(d.createdAt)}</span>
                    <span className="flex items-center gap-1"><ChevronUp className="w-3 h-3" />{d.upvotesCount} upvotes</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {['new', 'verified', 'resolved'].map(s => (
                    <button key={s} onClick={() => setStatus(d._id, s)} disabled={d.status === s}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors disabled:opacity-40
                        ${s === 'verified' ? 'bg-green-50 hover:bg-green-100 text-green-700' :
                          s === 'resolved' ? 'bg-gray-50 hover:bg-gray-100 text-gray-600' :
                          'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
