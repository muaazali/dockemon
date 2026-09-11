import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link to="/" className="sidebar-item">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
      </nav>
    </aside>
  );
}
