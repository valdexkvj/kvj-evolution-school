import { useState, useEffect } from 'react';
import { courseService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { progressService } from '@/services/api';
import CourseCard from '@/components/CourseCard';

export default function Courses() {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await courseService.getAll();
        setCourses(coursesData);
        if (isAuthenticated && user) {
          const progressData = await progressService.getByStudent(user._id);
          setProgress(progressData);
        }
      } catch (err) { console.error('Erreur chargement cours:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [isAuthenticated, user]);

  const categories = ['Tous', ...new Set(courses.map((c) => c.category))];
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.enonce && course.enonce.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'Tous' || course.category === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-border border-t-accent-orange" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-2">Nos cours</h1><p className="text-dark-muted">{courses.length} cours disponibles pour developper vos competences numeriques</p></div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Rechercher un cours..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent outline-none text-white transition-all" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === cat ? 'bg-accent-orange text-white shadow-md shadow-accent-orange/20' : 'bg-dark-card text-dark-muted border border-dark-border hover:border-accent-orange/50 hover:text-accent-orange'}`}>{cat}</button>
          ))}
        </div>
      </div>
      {filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredCourses.map((course) => <CourseCard key={course._id} course={course} progress={progress.find((p) => p.courseId === course._id)?.percentage} />)}</div>
      ) : (
        <div className="text-center py-16 text-dark-muted"><svg className="w-16 h-16 mx-auto mb-4 text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg><h3 className="text-xl font-semibold text-white mb-2">Aucun cours trouve</h3><p>Essayez de modifier vos filtres de recherche</p></div>
      )}
    </div>
  );
}
