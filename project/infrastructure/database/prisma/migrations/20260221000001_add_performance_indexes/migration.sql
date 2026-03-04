-- AddIndex: ContactMessage.createdAt for admin pagination queries
CREATE INDEX IF NOT EXISTS "contact_message_created_at_idx" ON "contact_message"("created_at");

-- AddIndex: ContactMessage.email for lookup queries
CREATE INDEX IF NOT EXISTS "contact_message_email_idx" ON "contact_message"("email");

-- AddIndex: FeatureUsage(userId, featureType) for calculator history filtered by type
CREATE INDEX IF NOT EXISTS "feature_usage_user_id_feature_type_idx" ON "feature_usage"("user_id", "feature_type");

-- AddIndex: FeatureUsage(featureType, createdAt) for admin analytics queries by type
CREATE INDEX IF NOT EXISTS "feature_usage_feature_type_created_at_idx" ON "feature_usage"("feature_type", "created_at");
