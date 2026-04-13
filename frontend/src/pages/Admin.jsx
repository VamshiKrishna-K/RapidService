import { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  Shield, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import api from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allProviders, setAllProviders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || userInfo.role !== 'admin') {
        navigate('/login');
        return;
      }

      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        };

        const [statsRes, bookingsRes, usersRes, providersRes] = await Promise.all([
          api.get('/admin/stats', config),
          api.get('/admin/bookings', config),
          api.get('/admin/users', config),
          api.get('/admin/providers', config)
        ]);

        console.log("Admin Stats:", statsRes.data);
        console.log("Admin Bookings:", bookingsRes.data);
        console.log("Admin Users:", usersRes.data);
        console.log("Admin Providers:", providersRes.data);

        setStats(statsRes.data.stats);
        
        // Format trend data for AreaChart
        const trend = (statsRes.data.dailyBookings || []).map(day => ({
          name: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: day.revenue,
          bookings: day.bookings
        }));
        setRevenueTrend(trend);

        setCategoryDistribution(statsRes.data.categoryStats || []);
        setRecentBookings(bookingsRes.data || []);
        setAllUsers(usersRes.data || []);
        setAllProviders(providersRes.data || []);
      } catch (error) {
        console.error("Admin fetch error:", error);
        toast.error("Failed to load administrative data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Initializing Secure Admin Environment</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter text-slate-900">AdminPanel</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "providers", label: "Service Providers", icon: UserCheck },
              { id: "bookings", label: "Bookings", icon: Calendar },
              { id: "services", label: "Service Categories", icon: Package },
              { id: "settings", label: "Admin Settings", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2.5 rounded-2xl w-96 border border-slate-200/50">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search data records..." 
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 w-full"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900">Vamshi</p>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold">
                V
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                {activeTab === 'overview' ? 'System Dashboard' : 
                 activeTab === 'users' ? 'User Management' :
                 activeTab === 'providers' ? 'Provider Network' :
                 activeTab === 'bookings' ? 'Order Management' :
                 activeTab === 'services' ? 'Service Catalog' : 'Admin Settings'}
              </h2>
              <p className="text-slate-500 font-medium">
                {activeTab === 'overview' ? 'Real-time platform metrics and management' : 
                 `Review and manage ${activeTab} within the ecosystem`}
              </p>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", isUp: true, color: "indigo" },
                  { label: "Active Users", value: stats.totalUsers, icon: Users, trend: "+5.2%", isUp: true, color: "emerald" },
                  { label: "Total Bookings", value: stats.totalBookings, icon: Calendar, trend: "-2.1%", isUp: false, color: "amber" },
                  { label: "Providers", value: stats.totalProviders, icon: UserCheck, trend: "+8.4%", isUp: true, color: "rose" },
                ].map((stat, i) => (
                  <div key={i} className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div className={`flex items-center gap-1 ${stat.isUp ? "text-emerald-600" : "text-rose-600"} text-xs font-black bg-${stat.isUp ? "emerald" : "rose"}-50 px-2 py-1 rounded-lg`}>
                        {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.trend}
                      </div>
                    </div>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 uppercase">Revenue Trend (Last 7 Days)</h3>
                  </div>
                  <div className="h-[350px] w-full">
                    {revenueTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueTrend}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '24px', 
                              border: 'none', 
                              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                              padding: '16px'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#6366f1" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Insufficient transaction data for trend analysis</div>
                    )}
                  </div>
                </div>

                {/* Service Distribution */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="text-xl font-black text-slate-900 uppercase mb-8 text-center">Popular Services</h3>
                  <div className="flex-1 min-h-[300px]">
                    {categoryDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryDistribution}>
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          />
                          <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={40}>
                            {categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">No service data mapped</div>
                    )}
                  </div>
                  <div className="space-y-4 pt-6">
                    {categoryDistribution.map((cat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                           <span className="text-xs font-bold text-slate-600">{cat.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{cat.value} items</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 uppercase">Live Marketplace Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  {recentBookings.length > 0 ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer / Provider</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Insight</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Revenue</th>
                          <th className="px-8 py-5"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {recentBookings.slice(0, 5).map((booking) => (
                          <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6">
                              <span className="text-xs font-black text-slate-400">#{booking._id.slice(-6).toUpperCase()}</span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900">{(booking.customer || booking.user)?.name || 'Guest User'}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{booking.provider?.name || 'Provider'}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Activity className="w-3.5 h-3.5" />
                                <span className="text-sm font-bold">{booking.service?.title || 'General Service'}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                booking.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                booking.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                'bg-rose-50 text-rose-600'
                              }`}>
                                {booking.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {booking.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                {booking.status === 'cancelled' && <AlertCircle className="w-3.5 h-3.5" />}
                                {booking.status}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-sm font-black text-slate-900">₹{booking.totalAmount}</span>
                              <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(booking.createdAt).toLocaleDateString()}</p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                < MoreVertical className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                      <Package className="w-12 h-12 text-slate-200" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No transactions recorded on the network</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 uppercase">Registered Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User ID</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name & Email</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined Date</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {allUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 text-xs font-black text-slate-400">#{u._id.slice(-6).toUpperCase()}</td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">{u.name}</span>
                            <span className="text-xs font-medium text-slate-500">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest">{u.role}</span>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-8 py-6 text-right">
                           <button className="text-slate-400 hover:text-slate-900"><MoreVertical className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 uppercase">Service Providers</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Provider ID</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name & Email</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined Date</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {allProviders.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 text-xs font-black text-slate-400">#{p._id.slice(-6).toUpperCase()}</td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">{p.name}</span>
                            <span className="text-xs font-medium text-slate-500">{p.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest">Active</span>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="px-8 py-6 text-right">
                           <button className="text-slate-400 hover:text-slate-900"><MoreVertical className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 uppercase">All Bookings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Booking ID</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Details</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {recentBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 text-xs font-black text-slate-400">#{b._id.slice(-6).toUpperCase()}</td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">{b.service?.title}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{(b.customer || b.user)?.name} → {b.provider?.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                             b.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                             b.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                             'bg-rose-50 text-rose-600'
                           }`}>{b.status}</span>
                        </td>
                        <td className="px-8 py-6 text-sm font-black text-slate-900">₹{b.totalAmount}</td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td className="px-8 py-6 text-right">
                           <button className="text-slate-400 hover:text-slate-900"><MoreVertical className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeTab === 'services' || activeTab === 'settings') && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-200 border-dashed">
                <Package className="w-16 h-16 text-slate-100 mb-4" />
                <h3 className="text-xl font-black text-slate-900 uppercase">Feature in Development</h3>
                <p className="text-slate-500 font-medium">We are currently architecting the {activeTab} module.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
