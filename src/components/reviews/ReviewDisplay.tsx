import { StarRating } from '@/components/reviews/StarRating';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';

interface Review {
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ReviewDisplayProps {
  review: Review;
  compact?: boolean;
}

export function ReviewDisplay({ review, compact = false }: ReviewDisplayProps) {
  const formattedDate = format(new Date(review.created_at), 'MMM d, yyyy');

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-accent/50 to-accent/30 rounded-lg border border-primary/10">
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} readonly size="sm" />
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
            {review.rating}/5
          </Badge>
        </div>
        {review.comment && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{review.comment}</span>
          </div>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{formattedDate}</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-accent/40 to-accent/20 rounded-lg border border-primary/10 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StarRating rating={review.rating} readonly size="md" />
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {review.rating}/5 Stars
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </div>
      
      {review.comment && (
        <div className="mt-3">
          <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
        </div>
      )}
    </div>
  );
}