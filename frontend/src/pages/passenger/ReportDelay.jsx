import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { CheckCircle } from 'lucide-react';

export default function ReportDelay() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [form, setForm] = useState({ routeId: '', stopId: '', expectedTime: '', actualTime: '', delayMinutes: '', crowdLevel: 'medium' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/routes'), api.get('/stops')]).then(([r, s]) => { setRoutes(r); setStops(s); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.routeId || !form.stopId) { setError('Route and stop are required'); return; }
    if (!form.delayMinutes && !form.actualTime) { setError('Provide delay minutes or actual arrival time'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/delay', form);
      setSuccess(true);
      setTimeout(() => navigate('/my-submissions'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center py-20 smooth-enter">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Delay Reported!</h2>
      <p className="text-gray-500 text-sm mt-1">Thanks for helping other passengers</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Report a Delay</h1>
        <p className="page-sub">Alert other passengers about bus delays in real-time</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Route *</label>
              <select className="select" value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))} required>
                <option value="">Select route...</option>
                {routes.map(r => <option key={r._id} value={r._id}>{r.routeCode} — {r.routeName}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Stop *</label>
              <select className="select" value={form.stopId} onChange={e => setForm(f => ({ ...f, stopId: e.target.value }))} required>
                <option value="">Select stop...</option>
                {stops.map(s => <option key={s._id} value={s._id}>{s.stopName}</option>)}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Expected Time</label>
              <input className="input" type="time" value={form.expectedTime} onChange={e => setForm(f => ({ ...f, expectedTime: e.target.value }))} />
            </div>
            <div>
              <label className="label">Actual Arrival Time</label>
              <input className="input" type="time" value={form.actualTime} onChange={e => setForm(f => ({ ...f, actualTime: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label">OR — Delay in Minutes</label>
            <input className="input" type="number" min="1" max="300" placeholder="e.g. 25" value={form.delayMinutes} onChange={e => setForm(f => ({ ...f, delayMinutes: e.target.value }))} />
            <p className="text-xs text-gray-400 mt-1">Enter either delay minutes or the actual time above</p>
          </div>

          <div>
            <label className="label">Crowd Level</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'low', label: 'Low', color: 'green' },
                { value: 'medium', label: 'Medium', color: 'yellow' },
                { value: 'high', label: 'High', color: 'orange' },
                { value: 'very_high', label: 'Very High', color: 'red' }
              ].map(({ value, label, color }) => (
                <button key={value} type="button"
                  onClick={() => setForm(f => ({ ...f, crowdLevel: value }))}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border-2 transition-all duration-150
                    ${form.crowdLevel === value
                      ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Submitting...' : 'Report Delay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
