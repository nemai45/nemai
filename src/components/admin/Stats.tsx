import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ title, value, description, icon, className }: StatsCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-sm border border-purple-100", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2 bg-gradient-to-r from-unicorn-purple to-unicorn-pink text-transparent bg-clip-text">
            {value}
          </h3>
          {description && <p className="text-xs text-gray-400 mt-2">{description}</p>}
        </div>
        {icon && <div className="text-purple-400">{icon}</div>}
      </div>
    </div>
  );
}
