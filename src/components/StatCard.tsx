import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
}

export default function StatCard({ label, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border hover:border-muted transition-colors">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-base text-accent">{icon}</span>}
        <p className="text-xs text-muted uppercase tracking-wide font-medium">
          {label}
        </p>
      </div>
      <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted mt-1">{subtitle}</p>
      )}
    </div>
  );
}
