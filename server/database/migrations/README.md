# Database Migrations

This directory contains database migration scripts for the Koottam platform.

## Running Migrations

### Method 1: Using psql command line

```bash
# Make sure your PostgreSQL container is running
npm run db:up

# Run the migration
psql -U postgres -d koottam_db -f database/migrations/002_user_settings_blocked_users.sql
```

### Method 2: Using Docker exec

```bash
# Make sure your PostgreSQL container is running
npm run db:up

# Run the migration
docker exec -i koottam-postgres psql -U postgres -d koottam_db < database/migrations/002_user_settings_blocked_users.sql
```

### Method 3: Using connection string

```bash
# Replace with your connection details
psql postgresql://postgres:postgres@localhost:5432/koottam_db -f database/migrations/002_user_settings_blocked_users.sql
```

## Migration Files

- **001_initial_schema.sql** - Initial database schema (already applied via init.sql)
- **002_user_settings_blocked_users.sql** - Adds user_settings and blocked_users tables

## Verifying Migrations

After running a migration, verify it was successful:

```bash
# Connect to the database
psql -U postgres -d koottam_db

# List all tables
\dt

# Describe user_settings table
\d user_settings

# Describe blocked_users table
\d blocked_users

# Exit
\q
```

## Notes

- Always backup your database before running migrations in production
- Migrations should be run in order (001, 002, 003, etc.)
- The init.sql file runs automatically when the Docker container starts for the first time
- Subsequent migrations must be run manually

