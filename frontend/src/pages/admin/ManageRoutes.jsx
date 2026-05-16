import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import CrudTable from '../../components/ui/CrudTable';

export default function ManageRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/routes').then(setRoutes).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  return (
    <CrudTable
      title="Manage Routes"
      items={routes}
      loading={loading}
      columns={[
        { key: 'routeCode', label: 'Code' },
        { key: 'routeName', label: 'Route Name' }
      ]}
      fields={[
        { key: 'routeCode', label: 'Route Code', placeholder: 'e.g. KL-01' },
        { key: 'routeName', label: 'Route Name', placeholder: 'e.g. Kollam - Trivandrum' }
      ]}
      onAdd={async (data) => { await api.post('/routes', data); await load(); }}
      onEdit={async (id, data) => { await api.put(`/routes/${id}`, data); await load(); }}
      onDelete={async (id) => { await api.delete(`/routes/${id}`); await load(); }}
    />
  );
}
