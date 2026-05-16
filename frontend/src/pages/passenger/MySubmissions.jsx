import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Star, ChevronUp, Clock, MessageSquare } from 'lucide-react';

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const statusBadge = { pending: 'badge-yellow', approved: 'badge-green', hidden: 'badge-red', new: 'badge-blue', verified: 'badge-green', resolved: 'badge-gray' };

export default function MySubmissions() {
  const [tab, setTab] = useState('feedback');
  const [feedback, setFeedback] = useState([]);
  const [delays, setDelays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/feedback/my'), api.get('/delay/my')])
      .then(([fb, dl]) => { setFeedback(fb); setDelays(dl); })
      .finally(() => setLoading(false));
  }, []);

  const handleUpvote = async (id) => {
    try {
      const res = await api.post(`/delay/${id}/upvote`);
      setDelays(prev => prev.map(d => d._id === id ? { ...d, upvotesCount: res.upvotesCount } : d));
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Submissions</h1>
        <p className="page-sub">All your feedback and delay reports</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'feedback', label: `Feedback (${feedback.length})`, icon: MessageSquare },
          { key: 'delays', label: `Delay Reports (${delays.length})`, icon: Clock }
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-apple'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === 'feedback' ? (
        feedback.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">No feedback submitted yet</div>
        ) : (
          <div className="space-y-3">
            {feedback.map(f => (
              <div key={f._id} className="card smooth-enter">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{f.routeId?.routeCode || 'Unknown Route'}</span>
                      <span className="text-xs text-gray-400">{f.routeId?.routeName}</span>
                      <span className={`badge ${statusBadge[f.status]}`}>{f.status}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1 capitalize">{f.category}</span>
                    </div>
                    {f.comment && <p className="text-sm text-gray-600">{f.comment}</p>}
                    {f.stopId && <p className="text-xs text-gray-400 mt-1">Stop: {f.stopId.stopName}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-400">{timeAgo(f.createdAt)}</div>
                    {f.imageUrl && <img src={f.imageUrl} alt="feedback" className="w-16 h-16 rounded-lg object-cover mt-2" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        delays.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">No delay reports submitted yet</div>
        ) : (
          <div className="space-y-3">
            {delays.map(d => (
              <div key={d._id} className="card smooth-enter">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{d.routeId?.routeCode || '—'}</span>
                      <span className="text-xs text-gray-400">{d.routeId?.routeName}</span>
                      <span className={`badge ${statusBadge[d.status]}`}>{d.status}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Stop: {d.stopId?.stopName}
                      {d.delayMinutes && <span className="ml-2 text-red-500 font-semibold">+{d.delayMinutes} min</span>}
                      {d.expectedTime && <span className="ml-2">Expected: {d.expectedTime}</span>}
                      {d.actualTime && <span className="ml-2">Actual: {d.actualTime}</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 capitalize">Crowd: {d.crowdLevel?.replace('_', ' ')}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-gray-400">{timeAgo(d.createdAt)}</div>
                    <button onClick={() => handleUpvote(d._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-xs font-medium transition-colors">
                      <ChevronUp className="w-3 h-3" />
                      {d.upvotesCount}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
