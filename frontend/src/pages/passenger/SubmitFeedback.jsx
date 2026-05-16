import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Star, Upload, CheckCircle } from 'lucide-react';

export default function SubmitFeedback() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState({ routeId: '', busId: '', stopId: '', category: 'punctuality', rating: 0, comment: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hover, setHover] = useState(0);

  useEffect(() => {
    Promise.all([api.get('/routes'), api.get('/stops'), api.get('/buses')])
      .then(([r, s, b]) => { setRoutes(r); setStops(s); setBuses(b); });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) { setError('Please select a rating'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (image) fd.append('image', image);
      await api.post('/feedback', fd, true);
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
      <h2 className="text-xl font-bold text-gray-900">Feedback Submitted!</h2>
      <p className="text-gray-500 text-sm mt-1">Redirecting to your submissions...</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Submit Feedback</h1>
        <p className="page-sub">Share your experience to help improve public transport</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Route</label>
              <select className="select" value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}>
                <option value="">Select route...</option>
                {routes.map(r => <option key={r._id} value={r._id}>{r.routeCode} — {r.routeName}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Stop</label>
              <select className="select" value={form.stopId} onChange={e => setForm(f => ({ ...f, stopId: e.target.value }))}>
                <option value="">Select stop...</option>
                {stops.map(s => <option key={s._id} value={s._id}>{s.stopName}</option>)}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Bus Number (optional)</label>
              <select className="select" value={form.busId} onChange={e => setForm(f => ({ ...f, busId: e.target.value }))}>
                <option value="">Select bus...</option>
                {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {['cleanliness', 'punctuality', 'safety', 'staff', 'overcrowding', 'other'].map(c => (
                  <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Rating</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setForm(f => ({ ...f, rating: n }))}
                  className="p-1 transition-transform hover:scale-110 active:scale-95">
                  <Star className={`w-8 h-8 transition-colors ${n <= (hover || form.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                </button>
              ))}
              {form.rating > 0 && <span className="ml-2 text-sm text-gray-500 self-center">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}</span>}
            </div>
          </div>

          <div>
            <label className="label">Comment</label>
            <textarea className="input resize-none" rows={4} placeholder="Describe your experience..." value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
          </div>

          <div>
            <label className="label">Image (optional)</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
              {preview ? (
                <img src={preview} alt="preview" className="w-full max-h-40 object-cover rounded-lg" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400">Click to upload photo</span>
                  <span className="text-xs text-gray-300 mt-1">Max 5MB · JPG, PNG</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
