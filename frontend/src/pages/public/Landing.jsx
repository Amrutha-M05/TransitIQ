import { Link } from 'react-router-dom';
import { Bus, Clock, Star, Shield, ArrowRight, TrendingUp, MessageSquare, MapPin } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Bus className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">TransitIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/delays" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">Live Delays</Link>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">Sign In</Link>
          <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-16 pb-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          Real-time Transport Intelligence
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Your commute,<br />
          <span className="text-blue-600">made smarter.</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Report delays, share feedback, and help build a better public transport network for everyone in your city.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/signup" className="btn-primary flex items-center gap-2 text-base px-7 py-3.5">
            Start Contributing <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/delays" className="btn-secondary flex items-center gap-2 text-base px-7 py-3.5">
            <Clock className="w-4 h-4" />
            Live Delay Board
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '2,400+', label: 'Reports Filed' },
            { value: '98', label: 'Routes Covered' },
            { value: '4.6★', label: 'Avg. Satisfaction' }
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything you need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: MessageSquare, color: 'blue', title: 'Submit Feedback', desc: 'Rate your experience on cleanliness, punctuality, staff behavior and more.' },
            { icon: Clock, color: 'orange', title: 'Report Delays', desc: 'Real-time delay reporting with crowd levels. Upvote reports from others.' },
            { icon: TrendingUp, color: 'green', title: 'Analytics Dashboard', desc: 'Admin insights with charts on delay trends, top routes, and ratings.' },
            { icon: MapPin, color: 'purple', title: 'Live Delay Board', desc: 'Public board showing latest delay reports. No login required.' },
            { icon: Shield, color: 'red', title: 'Verified Reports', desc: 'Admin-moderated feedback ensures accurate, trustworthy information.' },
            { icon: Star, color: 'yellow', title: 'Route Intelligence', desc: 'Track performance by route, stop, and bus across time.' }
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="card hover:shadow-apple-lg transition-shadow duration-200">
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to improve your commute?</h2>
          <p className="text-blue-100 mb-8">Join thousands of passengers making public transport better every day.</p>
          <Link to="/signup" className="bg-white text-blue-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 text-center text-sm text-gray-400 border-t border-gray-100">
        © 2026 TransitIQ · Smart Public Transport Portal
      </footer>
    </div>
  );
}
