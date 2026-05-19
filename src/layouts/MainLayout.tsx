import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
