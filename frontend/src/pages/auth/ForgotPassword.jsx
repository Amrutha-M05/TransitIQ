import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '../../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/auth/forgot-password', { email });
      setSent(true);
      // In development, the backend returns the reset link for easy testing
      if (data.resetLink) setDevLink(data.resetLink);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm smooth-enter">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-apple-lg">
            <Bus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="text-gray-500 text-sm mt-1">
            {sent ? 'Check your email for the reset link' : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <div className="card-lg">
          {sent ? (
            <div className="text-center py-4 smooth-enter">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 mb-6">
                If an account exists for <span className="font-medium text-gray-700">{email}</span>, 
                you'll receive a password reset link shortly.
              </p>

              {/* Dev mode: show the reset link directly */}
              {devLink && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-left">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                    🛠 Dev Mode — Reset Link
                  </p>
                  <Link 
                    to={devLink.replace('http://localhost:5173', '')} 
                    className="text-sm text-blue-600 font-medium hover:underline break-all"
                  >
                    {devLink}
                  </Link>
                </div>
              )}

              <button
                onClick={() => { setSent(false); setDevLink(''); setEmail(''); }}
                className="btn-secondary text-sm"
              >
                Send again
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      className="input pl-10"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
