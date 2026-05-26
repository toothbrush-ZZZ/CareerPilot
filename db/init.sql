CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, 
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    full_name TEXT,
    location_city TEXT,
    location_country TEXT, 
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cv_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    job_url TEXT,
    status TEXT NOT NULL DEFAULT 'applied',
    notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cv_chunks_user ON cv_chunks(user_id);

CREATE INDEX IF NOT EXISTS idx_cv_chunks_embedding ON cv_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications(user_id, status);

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);

CREATE OR REPLACE FUNCTION match_cv_chunks(
    query_embedding vector(384),
    match_user_id UUID,
    match_count INT
)
RETURNS TABLE (
    id UUID,
    section TEXT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cv_chunks.id,
        cv_chunks.section,
        cv_chunks.content,
        1 - (cv_chunks.embedding <=> query_embedding) AS similarity
    FROM cv_chunks
    WHERE cv_chunks.user_id = match_user_id
    ORDER BY cv_chunks.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;


CREATE POLICY user_access_profiles ON profiles
    FOR ALL USING (id = current_setting('app.current_user_id')::UUID);

CREATE POLICY user_access_cv_chunks ON cv_chunks
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY user_access_applications ON applications
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY user_access_goals ON goals
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);
