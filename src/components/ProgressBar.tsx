interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({ percentage, showLabel = true, size = 'md', className = '' }: ProgressBarProps) {
  const sizeClasses = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const getColor = () => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 50) return 'from-accent-orange to-amber-500';
    if (percentage >= 25) return 'from-yellow-500 to-accent-orange';
    return 'from-dark-muted to-dark-border';
  };
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-dark-border rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div className={`h-full bg-gradient-to-r ${getColor()} rounded-full transition-all duration-700 ease-out`} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} />
      </div>
      {showLabel && (<span className="text-sm font-semibold text-dark-muted min-w-[3rem] text-right">{Math.round(percentage)}%</span>)}
    </div>
  );
}
