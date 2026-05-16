import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

let toastFn = null;
export const toast = {
  success: (msg) => toastFn?.({ type: 'success', msg }),
  error: (msg) => toastFn?.({ type: 'error', msg }),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastFn = ({ type, msg }) => {
      const id = Date.now();
      setToasts(t => [...t, { id, type, msg }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2">
      {toasts.map(({ id, type, msg }) => (
        <div key={id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-apple-lg text-sm font-medium smooth-enter
          ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {msg}
          <button onClick={() => setToasts(t => t.filter(x => x.id !== id))} className="ml-2 opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
