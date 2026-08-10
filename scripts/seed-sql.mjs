export async function buildSeedSql() {
  const now = Date.now();

  return `INSERT INTO school_settings (id, name, address, schoolId, principal, updatedAt)
    VALUES ('school', '', '', '', '', ${now}) ON CONFLICT (id) DO NOTHING;`;
}