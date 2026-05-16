import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, LayoutDashboard, Route, MapPin, Truck, MessageSquare, Clock, Users, LogOut, ChevronRight } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useNavigate ? { user: null, logout: () => {} } : {};
  const { user: authUser, logout: authLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { authLogout(); navigate('/'); };

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/routes', icon: Route, label: 'Routes' },
    { to: '/admin/stops', icon: MapPin, label: 'Stops' },
    { to: '/admin/buses', icon: Truck, label: 'Buses' },
    { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
    { to: '/admin/delays', icon: Clock, label: 'Delay Reports' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">TransitIQ</h1>
              <p className="text-xs text-gray-500">Admin Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
              }>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-1">
          <button onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Passenger View
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-gray-800 transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="p-4">
          <div className="bg-gray-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {authUser?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{authUser?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8 smooth-enter">
        <Outlet />
      </main>
    </div>
  );
}
