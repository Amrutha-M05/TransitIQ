import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import CrudTable from '../../components/ui/CrudTable';

export default function ManageStops() {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/stops').then(setStops).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  return (
    <CrudTable
      title="Manage Stops"
      items={stops}
      loading={loading}
      columns={[
        { key: 'stopName', label: 'Stop Name' },
        { key: 'location', label: 'Location' }
      ]}
      fields={[
        { key: 'stopName', label: 'Stop Name', placeholder: 'e.g. Kollam Bus Stand' },
        { key: 'location', label: 'Location', placeholder: 'e.g. Kollam' }
      ]}
      onAdd={async (data) => { await api.post('/stops', data); await load(); }}
      onEdit={async (id, data) => { await api.put(`/stops/${id}`, data); await load(); }}
      onDelete={async (id) => { await api.delete(`/stops/${id}`); await load(); }}
    />
  );
}
