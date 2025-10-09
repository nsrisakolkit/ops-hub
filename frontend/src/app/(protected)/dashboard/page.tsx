export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Welcome to your operations hub dashboard
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-slate-900">12</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Active Tasks</p>
              <p className="text-3xl font-bold text-slate-900">24</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Team Members</p>
              <p className="text-3xl font-bold text-slate-900">8</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Files Managed</p>
              <p className="text-3xl font-bold text-slate-900">156</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Projects</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🌐</span>
                </div>
                <span className="font-medium text-slate-700">Website Redesign</span>
              </div>
              <span className="text-sm text-slate-500">2 days ago</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📱</span>
                </div>
                <span className="font-medium text-slate-700">Mobile App</span>
              </div>
              <span className="text-sm text-slate-500">1 week ago</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🔗</span>
                </div>
                <span className="font-medium text-slate-700">API Integration</span>
              </div>
              <span className="text-sm text-slate-500">2 weeks ago</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Task Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-slate-700">Completed</span>
              </div>
              <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-md">18</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-slate-700">In Progress</span>
              </div>
              <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">6</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-slate-700">Pending</span>
              </div>
              <span className="text-sm font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}