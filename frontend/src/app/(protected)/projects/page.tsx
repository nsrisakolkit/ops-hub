export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <p className="page-description">
          Manage and organize your projects
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-2">Website Redesign</h3>
          <p className="text-muted-foreground mb-4">Complete overhaul of company website</p>
          <div className="flex justify-between items-center">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">In Progress</span>
            <span className="text-sm text-muted-foreground">Due: Dec 15, 2024</span>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-2">Mobile App Development</h3>
          <p className="text-muted-foreground mb-4">Cross-platform mobile application</p>
          <div className="flex justify-between items-center">
            <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Planning</span>
            <span className="text-sm text-muted-foreground">Due: Jan 30, 2025</span>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-2">API Integration</h3>
          <p className="text-muted-foreground mb-4">Third-party service integrations</p>
          <div className="flex justify-between items-center">
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
            <span className="text-sm text-muted-foreground">Completed: Nov 20, 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}