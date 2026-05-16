import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { CheckCircle } from 'lucide-react';
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Same 5 rules as the PasswordStrengthMeter + backend
  const isPasswordStrong = (pw) =>
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw);

  // Only require strong password if user is actually changing it
  const passwordValid = !form.password || isPasswordStrong(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (form.password && !isPasswordStrong(form.password)) {
      setError('Password must meet all strength requirements'); return;
    }
    setLoading(true); setError('');
    try {
      const body = { name: form.name };
      if (form.password) body.password = form.password;
      const updated = await api.patch('/auth/me', body);
      updateUser({ name: updated.name });
      setSuccess(true);
      setForm(f => ({ ...f, password: '', confirmPassword: '' }));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-sub">Manage your account information</p>
      </div>

      <div className="max-w-md">
        <div className="card mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{user?.name}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
              <span className={`badge mt-1 ${user?.role === 'admin' ? 'badge-blue' : 'badge-gray'} capitalize`}>{user?.role}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Edit Profile</h2>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
          {success && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Profile updated successfully
            </div>
          )}

          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" placeholder="Leave blank to keep current" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <PasswordStrengthMeter password={form.password} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" placeholder="Repeat new password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading || !passwordValid}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

