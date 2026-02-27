"""
Migration: Add share_token column to meal_plans table.
Run once: python migrate_share_token.py
"""

import psycopg2

DB_URL = "postgresql://macromate:macromate@localhost:5432/macromate_dev"

conn = psycopg2.connect(DB_URL)
conn.autocommit = True
cur = conn.cursor()

# Check if column exists
cur.execute("""
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'meal_plans' AND column_name = 'share_token'
""")

if cur.fetchone():
    print("✓ share_token column already exists")
else:
    cur.execute("ALTER TABLE meal_plans ADD COLUMN share_token VARCHAR(32) UNIQUE")
    print("✓ Added share_token column to meal_plans")

# Create index
cur.execute("""
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'meal_plans' AND indexname = 'ix_meal_plans_share_token'
""")
if cur.fetchone():
    print("✓ Index already exists")
else:
    cur.execute("CREATE INDEX ix_meal_plans_share_token ON meal_plans (share_token)")
    print("✓ Created index on share_token")

cur.close()
conn.close()
print("Done!")
