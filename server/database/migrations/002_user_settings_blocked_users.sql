-- Migration 002: User Settings and Blocked Users
-- Run this migration after init.sql
-- How to run: psql -U postgres -d koottam_db -f database/migrations/002_user_settings_blocked_users.sql

-- 1. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "post_visibility": "public", "allow_messages": "everyone", "show_online_status": true}'::JSONB,
  notification_settings JSONB DEFAULT '{"likes": true, "comments": true, "follows": true, "messages": true, "mentions": true, "shares": true}'::JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Blocked Users Table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Comments for documentation
COMMENT ON TABLE user_settings IS 'User privacy and notification settings';
COMMENT ON TABLE blocked_users IS 'Tracks blocked users relationships';
COMMENT ON COLUMN user_settings.privacy_settings IS 'JSON object containing privacy preferences';
COMMENT ON COLUMN user_settings.notification_settings IS 'JSON object containing notification preferences';

