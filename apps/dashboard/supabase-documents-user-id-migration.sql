-- Add user_id column to existing documents table (safe migration)
-- Run this ONLY if documents table already exists without user_id

-- Step 1: Add column as nullable first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN user_id UUID REFERENCES auth.users(id);
    RAISE NOTICE 'user_id column added successfully';
  ELSE
    RAISE NOTICE 'user_id column already exists';
  END IF;
END $$;

-- Step 2: Add index
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- Step 3: (Optional) If you have existing documents and want to assign them to a default user:
-- UPDATE documents SET user_id = '<your-admin-user-id>' WHERE user_id IS NULL;

-- Step 4: (Optional) Make it NOT NULL after backfilling data:
-- ALTER TABLE documents ALTER COLUMN user_id SET NOT NULL;

