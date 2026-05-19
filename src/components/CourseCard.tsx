import { Link } from 'react-router-dom';

interface Module {
  _id: string;
  title: string;
}

interface Course {
  _id: string;
  title: string;
  enonce: string;
  category: string;
  niveau: string;
  image: string | null;
  modules: Module[];
}

interface CourseCardProps {
  course: Course;
  progress?: number;
}

const levelColors: Record<string, string> = {
  'L1': 'bg-emerald-900/50 text-emerald-400',
  'L2': 'bg-blue-900/50 text-blue-400',
  'L3': 'bg-orange-900/50 text-orange-400',
};

const categoryIcons: Record<string, React.ReactNode> = {
  'Securite': (
    <svg className="w-12 h-12 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  'Frontend': (
    <svg className="w-12 h-12 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  'IA': (
    <svg className="w-12 h-12 text-accent-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
};

export default function CourseCard({ course, progress }: CourseCardProps) {
  const icon = categoryIcons[course.category] || (
    <svg className="w-12 h-12 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );

  return (
    <Link to={`/course/${course._id}`} className="group block bg-dark-card rounded-2xl border border-dark-border hover:border-accent-orange/50 hover:shadow-xl hover:shadow-accent-orange/10 transition-all duration-300 overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-blue-950/50 via-slate-900/50 to-purple-950/50 flex items-center justify-center relative overflow-hidden">
        <div className="transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 to-transparent" />
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${levelColors[course.niveau] || 'bg-dark-border text-dark-muted'}`}>
          {course.niveau}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-full">{course.category}</span>
          <span className="text-xs text-dark-muted">{course.modules.length} module{course.modules.length > 1 ? 's' : ''}</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent-orange transition-colors line-clamp-2">{course.title}</h3>
        <p className="text-sm text-dark-muted mb-4 line-clamp-2">{course.enonce}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dark-muted">KVJ-Evolution School</span>
          {progress !== undefined && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-dark-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent-orange to-accent-blue rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-medium text-dark-muted">{progress}%</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
