-- ============================================================
-- DEKLATA PERFORMANCE INDEXES
-- Run these in Supabase SQL Editor → they are safe and fast
-- Each index speeds up a specific query the app runs frequently
-- ============================================================

-- Items: homepage query filters on status + orders by created_at
CREATE INDEX IF NOT EXISTS idx_items_status_created 
ON items (status, created_at DESC);

-- Items: campus filter on homepage
CREATE INDEX IF NOT EXISTS idx_items_campus 
ON items (campus);

-- Items: category filter on homepage
CREATE INDEX IF NOT EXISTS idx_items_category_id 
ON items (category_id);

-- Items: owner lookup for dashboard My Items tab
CREATE INDEX IF NOT EXISTS idx_items_owner_id 
ON items (owner_id);

-- Items: is_locked lookup
CREATE INDEX IF NOT EXISTS idx_items_is_locked 
ON items (is_locked);

-- Requests: requester lookup for My Requests page
CREATE INDEX IF NOT EXISTS idx_requests_requester_id 
ON requests (requester_id);

-- Requests: item lookup for dashboard
CREATE INDEX IF NOT EXISTS idx_requests_item_id 
ON requests (item_id);

-- Requests: status filter used everywhere
CREATE INDEX IF NOT EXISTS idx_requests_status 
ON requests (status);

-- Item images: item lookup — runs on every item page load
CREATE INDEX IF NOT EXISTS idx_item_images_item_id 
ON item_images (item_id);

-- Profiles: id lookup — already primary key but confirm
CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON profiles (id);

-- ============================================================
-- VERIFY: Run this after to confirm indexes were created
-- ============================================================
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;
