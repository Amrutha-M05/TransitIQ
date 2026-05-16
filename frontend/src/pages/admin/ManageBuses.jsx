import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import CrudTable from '../../components/ui/CrudTable';

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [b, r] = await Promise.all([api.get('/buses'), api.get('/routes')]);
    setBuses(b); setRoutes(r); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <CrudTable
      title="Manage Buses"
      items={buses}
      loading={loading}
      columns={[
        { key: 'busNumber', label: 'Bus Number' },
        { key: 'routeId', label: 'Route', render: b => b.routeId ? `${b.routeId.routeCode} — ${b.routeId.routeName}` : '—' }
      ]}
      fields={[
        { key: 'busNumber', label: 'Bus Number', placeholder: 'e.g. KL-02-AB-1234' },
        {
          key: 'routeId', label: 'Route', type: 'select',
          options: routes.map(r => ({ value: r._id, label: `${r.routeCode} — ${r.routeName}` }))
        }
      ]}
      onAdd={async (data) => { await api.post('/buses', data); await load(); }}
      onEdit={async (id, data) => { await api.put(`/buses/${id}`, data); await load(); }}
      onDelete={async (id) => { await api.delete(`/buses/${id}`); await load(); }}
    />
  );
}
