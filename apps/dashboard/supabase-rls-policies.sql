-- Poista vanhat politiikat (jos on)
DROP POLICY IF EXISTS "Allow authenticated users to read documents" ON documents;
DROP POLICY IF EXISTS "Allow authenticated users to read activities" ON activities;
DROP POLICY IF EXISTS "Allow authenticated users to update documents" ON documents;

-- Luo uudet politiikat
-- Documents: lukuoikeus autentikoiduille
CREATE POLICY "Allow authenticated users to read documents"
ON documents FOR SELECT
TO authenticated
USING (true);

-- Documents: päivitysoikeus autentikoiduille
CREATE POLICY "Allow authenticated users to update documents"
ON documents FOR UPDATE
TO authenticated
USING (true);

-- Activities: lukuoikeus autentikoiduille
CREATE POLICY "Allow authenticated users to read activities"
ON activities FOR SELECT
TO authenticated
USING (true);

-- Activities: kirjoitusoikeus autentikoiduille (real-time feedille)
CREATE POLICY "Allow authenticated users to insert activities"
ON activities FOR INSERT
TO authenticated
WITH CHECK (true);

-- Documents: poisto-oikeus autentikoiduille
CREATE POLICY "Allow authenticated users to delete documents"
ON documents FOR DELETE
TO authenticated
USING (true);

