export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <p className="page-description">
          Track and manage your tasks
        </p>
      </div>
      
      <div className="grid gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <div className="flex-1">
              <h4 className="font-medium">Update user interface components</h4>
              <p className="text-sm text-muted-foreground">Website Redesign • High Priority</p>
            </div>
            <span className="text-sm text-muted-foreground">Due today</span>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <div className="flex-1">
              <h4 className="font-medium">Implement authentication system</h4>
              <p className="text-sm text-muted-foreground">Mobile App • Medium Priority</p>
            </div>
            <span className="text-sm text-muted-foreground">Due Dec 10</span>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <div className="flex-1">
              <h4 className="font-medium line-through text-muted-foreground">Setup CI/CD pipeline</h4>
              <p className="text-sm text-muted-foreground">API Integration • Low Priority</p>
            </div>
            <span className="text-sm text-green-600">Completed</span>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <div className="flex-1">
              <h4 className="font-medium">Write documentation</h4>
              <p className="text-sm text-muted-foreground">API Integration • Medium Priority</p>
            </div>
            <span className="text-sm text-muted-foreground">Due Dec 15</span>
          </div>
        </div>
      </div>
    </div>
  );
}