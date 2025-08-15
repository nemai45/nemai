import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from './StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  serviceName: string;
}

export function ReviewForm({ onSubmit, onCancel, isLoading, serviceName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, comment);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
          <Heart className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-lg font-semibold">Rate Your Experience</CardTitle>
        <p className="text-sm text-muted-foreground">How was your {serviceName} service?</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <Label className="text-sm font-medium mb-3 block">Your Rating</Label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
              className="justify-center"
            />
            {rating === 0 && (
              <p className="text-xs text-muted-foreground mt-2">Please select a rating</p>
            )}
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              Share Your Thoughts (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2 min-h-[100px] resize-none border-primary/20 focus:border-primary"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={rating === 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}