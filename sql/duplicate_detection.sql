-- 1. Ensure pgvector extension is active
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop the old function first so we don't get a "signature mismatch" error
DROP FUNCTION IF EXISTS match_complaints(vector, integer, float);

-- 3. Create the clean, updated match_complaints function
CREATE OR REPLACE FUNCTION match_complaints(
    query_embedding vector(768),
    ward_id integer,
    match_threshold float DEFAULT 0.80
)
RETURNS TABLE(
    id uuid,
    summary_en text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        complaints.id,
        complaints.summary_en,
        1 - (complaints.embedding <=> query_embedding) AS similarity
    FROM complaints
    WHERE complaints.ward_id = match_complaints.ward_id
        AND complaints.embedding IS NOT NULL
        AND 1 - (complaints.embedding <=> query_embedding) > match_threshold
    ORDER BY complaints.embedding <=> query_embedding
    LIMIT 5;
END;
$$;