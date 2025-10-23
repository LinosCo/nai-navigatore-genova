-- Create reviews and ratings table for initiatives
CREATE TABLE IF NOT EXISTS initiative_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(initiative_id, user_id) -- One review per user per initiative
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_initiative_reviews_initiative_id ON initiative_reviews(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_reviews_user_id ON initiative_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_initiative_reviews_rating ON initiative_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_initiative_reviews_created_at ON initiative_reviews(created_at DESC);

-- Add average rating and review count to initiatives table
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create index for sorting by rating
CREATE INDEX IF NOT EXISTS idx_initiatives_average_rating ON initiatives(average_rating DESC);

-- Function to update initiative rating statistics
CREATE OR REPLACE FUNCTION update_initiative_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the average rating and review count for the initiative
  UPDATE initiatives
  SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM initiative_reviews
      WHERE initiative_id = COALESCE(NEW.initiative_id, OLD.initiative_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM initiative_reviews
      WHERE initiative_id = COALESCE(NEW.initiative_id, OLD.initiative_id)
    )
  WHERE id = COALESCE(NEW.initiative_id, OLD.initiative_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on insert, update, delete
DROP TRIGGER IF EXISTS trigger_update_initiative_rating_stats ON initiative_reviews;
CREATE TRIGGER trigger_update_initiative_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON initiative_reviews
FOR EACH ROW
EXECUTE FUNCTION update_initiative_rating_stats();

-- Table for marking reviews as helpful
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES initiative_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, user_id) -- One vote per user per review
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_user_id ON review_helpful_votes(user_id);

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE initiative_reviews
  SET helpful_count = (
    SELECT COUNT(*)
    FROM review_helpful_votes
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpful count
DROP TRIGGER IF EXISTS trigger_update_review_helpful_count ON review_helpful_votes;
CREATE TRIGGER trigger_update_review_helpful_count
AFTER INSERT OR DELETE ON review_helpful_votes
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();

-- Row Level Security
ALTER TABLE initiative_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
ON initiative_reviews FOR SELECT
USING (true);

-- Users can create reviews for any initiative
CREATE POLICY "Users can create reviews"
ON initiative_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON initiative_reviews FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON initiative_reviews FOR DELETE
USING (auth.uid() = user_id);

-- Everyone can view helpful votes
CREATE POLICY "Helpful votes are viewable by everyone"
ON review_helpful_votes FOR SELECT
USING (true);

-- Users can mark reviews as helpful
CREATE POLICY "Users can mark reviews as helpful"
ON review_helpful_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their helpful marks
CREATE POLICY "Users can remove helpful marks"
ON review_helpful_votes FOR DELETE
USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE initiative_reviews IS 'User reviews and ratings for initiatives';
COMMENT ON COLUMN initiative_reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN initiative_reviews.helpful_count IS 'Number of users who found this review helpful';
COMMENT ON TABLE review_helpful_votes IS 'Tracks which users found reviews helpful';
COMMENT ON COLUMN initiatives.average_rating IS 'Calculated average rating (1-5)';
COMMENT ON COLUMN initiatives.review_count IS 'Total number of reviews';
