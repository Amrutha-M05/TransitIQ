import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function CrudTable({ title, items, columns, fields, onAdd, onEdit, onDelete, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setForm(fields.reduce((a, f) => ({ ...a, [f.key]: '' }), {}));
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm(fields.reduce((a, f) => ({ ...a, [f.key]: item[f.key] || '' }), {}));
    setEditId(item._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) await onEdit(editId, form);
      else await onAdd(form);
      setShowForm(false);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="page-header mb-0">
          <h1 className="page-title">{title}</h1>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 smooth-enter border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-4">{editId ? 'Edit' : 'Add'} {title.slice(7)}</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                {f.type === 'select' ? (
                  <select className="select" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                    <option value="">Select...</option>
                    {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input className="input" type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-1" disabled={saving}>
              <Check className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No records found. Add one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {columns.map(c => <th key={c.key} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{c.label}</th>)}
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {columns.map(c => (
                      <td key={c.key} className="px-6 py-4 text-gray-700">
                        {c.render ? c.render(item) : item[c.key] || '—'}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-800">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { if (window.confirm('Delete this item?')) onDelete(item._id); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
