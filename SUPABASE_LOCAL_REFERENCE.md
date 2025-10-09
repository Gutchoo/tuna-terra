# Supabase Local Development Reference

Quick reference for common Supabase CLI commands and Docker concepts.

## Core Commands

### `supabase start`
**What it does:**
- Starts Docker containers for all Supabase services
- Reads from existing volumes (data persists from last time)
- Does NOT run seed.sql

**When to use:** Beginning of work session, starting development

**Data:** Persists from previous sessions ✅

```bash
supabase start
npm run dev  # App connects to http://127.0.0.1:54321
```

---

### `supabase stop`
**What it does:**
- Stops and removes Docker containers
- Volumes remain intact (data saved)
- Frees up system resources

**When to use:** End of work session, freeing up RAM/CPU

**Data:** Persists in volumes ✅

```bash
supabase stop  # Your data is safe!
```

---

### `supabase db reset`
**What it does:**
1. **Wipes all data** from volumes (destructive!)
2. Applies all migrations from `supabase/migrations/` in order
3. Runs `supabase/seed.sql` if it exists
4. Gives you a fresh database

**When to use:**
- Testing migrations from scratch
- Cleaning up messy test data
- Starting fresh with seed data
- Onboarding new developers

**Data:** **DELETED** ❌ then rebuilt from migrations + seed

```bash
supabase db reset  # ⚠️ Destroys all local data!
```

---

## Seed Files

### `supabase/seed.sql`
**Purpose:** Populate fresh database with test data

**When it runs:** Only during `supabase db reset`

**What to put in it:**
- Test user accounts
- Sample portfolios
- Test properties
- Realistic but small dataset (5-10 rows per table)

**Example:**
```sql
-- Create test portfolio
INSERT INTO portfolios (id, name, owner_id, is_default)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Test Portfolio',
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  true
);

-- Add test properties
INSERT INTO properties (user_id, portfolio_id, address, city, state)
VALUES
  ((SELECT id FROM auth.users WHERE email = 'test@example.com'),
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '123 Main St', 'Berkeley', 'CA');
```

---

## Migrations

### `supabase db diff -f migration_name`
**What it does:**
- Compares your local database to last migration
- Auto-generates SQL for schema changes
- Creates file: `supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql`

**When to use:** After making schema changes in Studio

```bash
# Make changes in Studio (http://127.0.0.1:54323)
supabase db diff -f add_property_notes
# Creates: supabase/migrations/20251009120000_add_property_notes.sql
```

### `supabase db push`
**What it does:**
- Applies local migrations to production database
- Only runs migrations that haven't been applied yet

**When to use:** After merging PR, ready to deploy schema changes

```bash
git checkout main
git pull
supabase db push  # Applies migrations to production
```

---

## Docker Concepts

### Containers (Temporary)
- Running processes (PostgreSQL, Auth, Storage, etc.)
- Destroyed on `supabase stop`
- Recreated on `supabase start`
- View in Docker Desktop → Containers tab

### Volumes (Persistent)
- Actual data storage (database files, uploads)
- Survive `supabase start/stop`
- Only deleted by `supabase db reset` or manual removal
- View in Docker Desktop → Volumes tab

**Key volumes:**
- `supabase_db_CRE-Claude` - Database data
- `supabase_storage_CRE-Claude` - Uploaded files

---

## Local URLs

| Service | URL | Purpose |
|---------|-----|---------|
| API | http://127.0.0.1:54321 | Your app connects here |
| Studio | http://127.0.0.1:54323 | Database UI (like Supabase dashboard) |
| Mailpit | http://127.0.0.1:54324 | Email testing (view sent emails) |

**Quick access:** Run `supabase status` to see all URLs

---

## Typical Workflows

### Daily Development (Data Persists)
```bash
# Monday
supabase start
# Work on features, add test data manually
supabase stop

# Tuesday
supabase start  # ✅ Yesterday's data still here
# Continue working
supabase stop
```

### Fresh Start with Seed Data
```bash
# Database is messy from testing
supabase db reset  # ❌ Wipes everything, loads seed.sql
# Now have: Clean schema + test data from seed.sql
```

### Making Schema Changes
```bash
# 1. Make changes in Studio (http://127.0.0.1:54323)
# 2. Generate migration
supabase db diff -f my_feature

# 3. Test it works
supabase db reset  # Applies all migrations including new one

# 4. Commit migration file
git add supabase/migrations/20251009120000_my_feature.sql
git commit -m "Add my feature schema"

# 5. After PR merged, push to production
git checkout main && git pull
supabase db push
```

---

## Environment Configuration

### Local Development (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

### Production (Vercel)
Uses production Supabase keys from Vercel environment variables

---

## Quick Troubleshooting

**Issue:** Port already in use
```bash
supabase stop
supabase start
```

**Issue:** Database seems corrupted
```bash
supabase db reset  # Fresh start
```

**Issue:** Want to see what's happening
```bash
supabase status  # Check all services
docker ps  # See running containers
```

**Issue:** Want to free disk space
```bash
supabase stop
docker volume prune  # ⚠️ Deletes unused volumes
```

---

## Command Quick Reference

| Command | Data Persists? | Runs Seed? | Use Case |
|---------|---------------|------------|----------|
| `supabase start` | ✅ Yes | ❌ No | Start work session |
| `supabase stop` | ✅ Yes | ❌ No | End work session |
| `supabase db reset` | ❌ **NO** | ✅ **YES** | Fresh start |
| `supabase db push` | N/A | ❌ No | Deploy migrations to production |
| `supabase db diff` | N/A | ❌ No | Generate migration from changes |
| `supabase status` | N/A | ❌ No | View URLs and service status |
