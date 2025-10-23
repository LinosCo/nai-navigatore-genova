import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ThumbsUp, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  helpful_count: number;
  created_at: string;
  user_email?: string;
}

interface ReviewsSectionProps {
  initiativeId: string;
  averageRating?: number;
  reviewCount?: number;
}

const ReviewsSection = ({ initiativeId, averageRating = 0, reviewCount = 0 }: ReviewsSectionProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initiativeId) {
      loadReviews();
      if (user) {
        loadUserReview();
        loadHelpfulVotes();
      }
    }
  }, [initiativeId, user]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('initiative_reviews')
        .select(`
          *,
          profiles(email)
        `)
        .eq('initiative_id', initiativeId)
        .order('helpful_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedReviews = (data || []).map(review => ({
        ...review,
        user_email: review.profiles?.email
      }));

      setReviews(mappedReviews);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReview = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('initiative_reviews')
        .select('*')
        .eq('initiative_id', initiativeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserReview(data);
        setRating(data.rating);
        setComment(data.comment || "");
      }
    } catch (error: any) {
      console.error('Error loading user review:', error);
    }
  };

  const loadHelpfulVotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('review_helpful_votes')
        .select('review_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const voteSet = new Set((data || []).map(v => v.review_id));
      setHelpfulVotes(voteSet);
    } catch (error: any) {
      console.error('Error loading helpful votes:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Devi essere autenticato per lasciare una recensione");
      return;
    }

    if (rating === 0) {
      toast.error("Seleziona una valutazione");
      return;
    }

    setSubmitting(true);

    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('initiative_reviews')
          .update({
            rating,
            comment: comment.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userReview.id);

        if (error) throw error;
        toast.success("Recensione aggiornata!");
      } else {
        // Create new review
        const { error } = await supabase
          .from('initiative_reviews')
          .insert({
            initiative_id: initiativeId,
            user_id: user.id,
            rating,
            comment: comment.trim() || null
          });

        if (error) throw error;
        toast.success("Recensione pubblicata!");
      }

      loadReviews();
      loadUserReview();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error("Errore nel salvare la recensione");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHelpful = async (reviewId: string) => {
    if (!user) {
      toast.error("Devi essere autenticato");
      return;
    }

    try {
      if (helpfulVotes.has(reviewId)) {
        // Remove vote
        const { error } = await supabase
          .from('review_helpful_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        if (error) throw error;

        setHelpfulVotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
      } else {
        // Add vote
        const { error } = await supabase
          .from('review_helpful_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id
          });

        if (error) throw error;

        setHelpfulVotes(prev => new Set(prev).add(reviewId));
      }

      loadReviews(); // Refresh to show updated count
    } catch (error: any) {
      console.error('Error toggling helpful:', error);
      toast.error("Errore nell'aggiornamento");
    }
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (interactive ? (hoverRating || rating) : count)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            Valutazioni e Recensioni
          </CardTitle>
          <CardDescription>
            {reviewCount === 0
              ? "Nessuna recensione ancora. Sii il primo!"
              : `${averageRating.toFixed(1)} / 5.0 basato su ${reviewCount} ${reviewCount === 1 ? 'recensione' : 'recensioni'}`
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Write Review Form (if authenticated) */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {userReview ? "Modifica la tua recensione" : "Lascia una recensione"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">La tua valutazione</p>
              {renderStars(rating, true)}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Commento (opzionale)</p>
              <Textarea
                placeholder="Racconta la tua esperienza con questa iniziativa..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleSubmitReview} disabled={submitting || rating === 0}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Invio..." : userReview ? "Aggiorna Recensione" : "Pubblica Recensione"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {loading ? (
        <p className="text-center text-muted-foreground">Caricamento recensioni...</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nessuna recensione disponibile</p>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tutte le recensioni ({reviews.length})</h3>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.user_email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{review.user_email || 'Utente'}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: it })}
                        </p>
                      </div>
                      {renderStars(review.rating, false)}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                    {user && review.user_id !== user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleHelpful(review.id)}
                        className="gap-2"
                      >
                        <ThumbsUp
                          className={`h-4 w-4 ${
                            helpfulVotes.has(review.id) ? 'fill-primary text-primary' : ''
                          }`}
                        />
                        Utile ({review.helpful_count})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
