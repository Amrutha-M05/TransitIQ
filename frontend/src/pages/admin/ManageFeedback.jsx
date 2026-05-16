import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Star, CheckCircle, EyeOff, Clock } from 'lucide-react';

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const statusBadge = { pending: 'badge-yellow', approved: 'badge-green', hidden: 'badge-red' };

export default function ManageFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/feedback').then(setFeedback).finally(() => setLoading(false));
  }, []);

  const setStatus = async (id, status) => {
    await api.patch(`/feedback/${id}/status`, { status });
    setFeedback(prev => prev.map(f => f._id === id ? { ...f, status } : f));
  };

  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Feedback</h1>
        <p className="page-sub">Approve or hide passenger feedback</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'approved', 'hidden'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize
              ${filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-apple'}`}>
            {s} {s === 'all' ? `(${feedback.length})` : `(${feedback.filter(f => f.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No feedback found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <div key={f._id} className="card smooth-enter">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-sm">{f.userId?.name || 'Unknown'}</span>
                    <span className="text-xs text-gray-400">{f.userId?.email}</span>
                    <span className={`badge ${statusBadge[f.status]}`}>{f.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-2">
                    {f.routeId && <span>Route: {f.routeId.routeCode}</span>}
                    {f.stopId && <span>Stop: {f.stopId.stopName}</span>}
                    <span className="capitalize">{f.category}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(f.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  {f.comment && <p className="text-sm text-gray-600">{f.comment}</p>}
                  {f.imageUrl && <img src={f.imageUrl} alt="" className="w-24 h-16 object-cover rounded-lg mt-2" />}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => setStatus(f._id, 'approved')} disabled={f.status === 'approved'}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-medium transition-colors disabled:opacity-40">
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => setStatus(f._id, 'hidden')} disabled={f.status === 'hidden'}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-medium transition-colors disabled:opacity-40">
                    <EyeOff className="w-3 h-3" /> Hide
                  </button>
                  <button onClick={() => setStatus(f._id, 'pending')} disabled={f.status === 'pending'}
                    className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-xl text-xs font-medium transition-colors disabled:opacity-40">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
