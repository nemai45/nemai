import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  className?: string;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  size = 'md', 
  readonly = false,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (starValue: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => handleStarClick(starValue)}
          disabled={readonly}
          className={cn(
            "transition-colors duration-200",
            !readonly && "hover:scale-110 transform",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors duration-200",
              starValue <= rating
                ? "fill-review-star"
                : "fill-review-star-muted"
            )}
          />
        </button>
      ))}
    </div>
  );
}