import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { MessageSquare, Clock, Plus, TrendingUp, Star, CheckCircle, Sparkles } from 'lucide-react';

export default function PassengerDashboard() {
  const { user } = useAuth();
  const [myFeedback, setMyFeedback] = useState([]);
  const [myDelays, setMyDelays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/feedback/my'), api.get('/delay/my')])
      .then(([fb, dl]) => { setMyFeedback(fb.slice(0, 3)); setMyDelays(dl.slice(0, 3)); })
      .finally(() => setLoading(false));
  }, []);

  const avgRating = myFeedback.length
    ? (myFeedback.reduce((a, f) => a + f.rating, 0) / myFeedback.length).toFixed(1)
    : '—';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-sub">Track your contributions and submit new reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Feedback Submitted', value: myFeedback.length, icon: MessageSquare, color: 'blue' },
          { label: 'Delay Reports', value: myDelays.length, icon: Clock, color: 'orange' },
          { label: 'Avg Rating Given', value: avgRating, icon: Star, color: 'yellow' },
          { label: 'Approved Reports', value: myFeedback.filter(f => f.status === 'approved').length, icon: CheckCircle, color: 'green' }
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-9 h-9 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 text-${color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{loading ? '—' : value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link to="/ai-companion" className="card hover:shadow-apple-lg transition-shadow duration-200 flex items-center gap-4 group cursor-pointer border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">AI Companion</div>
            <div className="text-sm text-gray-500">Get personalized commute insights</div>
          </div>
          <Plus className="w-4 h-4 text-gray-400 ml-auto" />
        </Link>
        <Link to="/feedback/new" className="card hover:shadow-apple-lg transition-shadow duration-200 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Submit Feedback</div>
            <div className="text-sm text-gray-500">Rate your bus journey experience</div>
          </div>
          <Plus className="w-4 h-4 text-gray-400 ml-auto" />
        </Link>
        <Link to="/delay/new" className="card hover:shadow-apple-lg transition-shadow duration-200 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Report a Delay</div>
            <div className="text-sm text-gray-500">Help others know about delays</div>
          </div>
          <Plus className="w-4 h-4 text-gray-400 ml-auto" />
        </Link>
      </div>

      {/* Recent */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Feedback</h2>
            <Link to="/my-submissions" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? <div className="text-sm text-gray-400">Loading...</div> :
          myFeedback.length === 0 ? <div className="text-sm text-gray-400">No feedback yet. Submit your first!</div> :
          <div className="space-y-3">
            {myFeedback.map(f => (
              <div key={f._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-900">{f.routeId?.routeCode || 'Unknown Route'}</div>
                  <div className="text-xs text-gray-500 capitalize">{f.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className={`badge ${f.status === 'approved' ? 'badge-green' : f.status === 'hidden' ? 'badge-red' : 'badge-yellow'}`}>{f.status}</span>
                </div>
              </div>
            ))}
          </div>}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Delay Reports</h2>
            <Link to="/my-submissions" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? <div className="text-sm text-gray-400">Loading...</div> :
          myDelays.length === 0 ? <div className="text-sm text-gray-400">No delay reports yet.</div> :
          <div className="space-y-3">
            {myDelays.map(d => (
              <div key={d._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-900">{d.routeId?.routeCode || '—'}</div>
                  <div className="text-xs text-gray-500">{d.stopId?.stopName}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-500">{d.delayMinutes ? `+${d.delayMinutes}m` : '—'}</div>
                  <span className={`badge ${d.status === 'verified' ? 'badge-green' : d.status === 'resolved' ? 'badge-gray' : 'badge-blue'}`}>{d.status}</span>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </div>
  );
}
