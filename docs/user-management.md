# User Management Guide

How to add, update, and remove users in the Cloudflare D1 database.

---

## Adding a New User

### Step 1: Generate Password Hash

```bash
cd travel-blog
node workers/scripts/generate-hash.js
```

When prompted, enter the password for the new user (e.g., `securepassword123`).

**Example output:**
```
Enter password to hash: ********
Hashing password with cost factor 10...

Bcrypt hash (cost factor 10):
$2b$10$3uY2msEgvhygThAlzDzMBetHrD7GSffYj.W8WZ3I9VVlTmepwdPoi

Copy this hash to use in SQL INSERT statement
```

**⚠️ Important**: Copy the hash immediately - you won't be able to retrieve it later.

### Step 2: Insert User into Database

```bash
# Replace values:
# - henrik = username
# - $2b$10$... = hash from Step 1 (escape $ with \$ in PowerShell)
# - contributor = role (either 'reader' or 'contributor')
# - Henrik = display name

npx wrangler d1 execute travel-blog-users --remote --command="INSERT INTO users (username, password_hash, role, display_name) VALUES ('henrik', '\$2b\$10\$3uY2msEgvhygThAlzDzMBetHrD7GSffYj.W8WZ3I9VVlTmepwdPoi', 'contributor', 'Henrik')"
```

**Expected output:**
```
🚣 Executed 1 queries in 2.5ms (0 rows read, 1 rows written)
```

### Step 3: Verify User Was Added

```bash
npx wrangler d1 execute travel-blog-users --remote --command="SELECT username, role, display_name FROM users WHERE username='henrik'"
```

**Expected output:**
```
┌──────────┬─────────────┬──────────────┐
│ username │ role        │ display_name │
├──────────┼─────────────┼──────────────┤
│ henrik   │ contributor │ Henrik       │
└──────────┴─────────────┴──────────────┘
```

---

## User Roles

- **`reader`**: Can view protected content, cannot upload or edit
- **`contributor`**: Can view, upload, and edit content (future features)

---

## Updating a User

### Change User Role

```bash
npx wrangler d1 execute travel-blog-users --remote --command="UPDATE users SET role='contributor' WHERE username='henrik'"
```

### Change Display Name

```bash
npx wrangler d1 execute travel-blog-users --remote --command="UPDATE users SET display_name='Henrik Nielsen' WHERE username='henrik'"
```

### Reset Password

```bash
# 1. Generate new hash
node workers/scripts/generate-hash.js

# 2. Update password_hash
npx wrangler d1 execute travel-blog-users --remote --command="UPDATE users SET password_hash='\$2b\$10\$NEW_HASH_HERE' WHERE username='henrik'"
```

---

## Removing a User

```bash
npx wrangler d1 execute travel-blog-users --remote --command="DELETE FROM users WHERE username='henrik'"
```

**⚠️ Warning**: This is permanent. Consider deactivating instead (future feature: `active` column).

---

## Listing All Users

```bash
# List all users (without password hashes)
npx wrangler d1 execute travel-blog-users --remote --command="SELECT username, role, display_name, created_at FROM users ORDER BY created_at DESC"
```

**Example output:**
```
┌─────────────────┬─────────────┬──────────────────┬─────────────────────┐
│ username        │ role        │ display_name     │ created_at          │
├─────────────────┼─────────────┼──────────────────┼─────────────────────┤
│ henrik          │ contributor │ Henrik           │ 2025-11-14 13:00:00 │
│ testcontributor │ contributor │ Test Contributor │ 2025-11-13 00:00:00 │
│ testuser        │ reader      │ Test User        │ 2025-11-13 00:00:00 │
└─────────────────┴─────────────┴──────────────────┴─────────────────────┘
```

---

## Security Best Practices

### ✅ DO:

- Generate password hashes using `generate-hash.js` script
- Use strong passwords (8+ characters, mix of letters, numbers, symbols)
- Execute SQL commands directly via `wrangler d1 execute`
- Keep terminal history private (clear after adding users)

### ❌ DON'T:

- Commit password hashes to git (even hashed passwords)
- Share bcrypt hashes publicly
- Reuse passwords across users
- Store plaintext passwords anywhere

---

## Troubleshooting

### Error: "UNIQUE constraint failed: users.username"

The username already exists. Choose a different username or update the existing user.

### Error: "CHECK constraint failed: users.role"

Role must be either `'reader'` or `'contributor'` (case-sensitive).

### Error: "Escape character '$' is not recognized"

In PowerShell, escape `$` symbols in the hash with `\$`:
```bash
# Wrong:
'$2b$10$abc...'

# Correct:
'\$2b\$10\$abc...'
```

### Database is Empty

Run the seed migration:
```bash
npx wrangler d1 execute travel-blog-users --remote --file=workers/migrations/0002_seed_test_users.sql
```

---

## Testing User Login

After adding a user, test login via the deployed site:

1. Go to https://travel-blog-4my.pages.dev/login
2. Enter username and password
3. Should redirect to home page with "Welcome, [Display Name]"

Or test via API:

```bash
Invoke-WebRequest -Uri "https://travel-blog-auth.andreas-e-ludviksen.workers.dev/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"henrik","password":"securepassword123"}' | Select-Object -ExpandProperty Content
```

**Expected response:**
```json
{
  "success": true,
  "user": {
    "username": "henrik",
    "role": "contributor",
    "displayName": "Henrik"
  },
  "expiresAt": "2025-11-15T13:00:00.000Z"
}
```

---

## Current Users

| Username        | Role        | Display Name     | Added      |
|-----------------|-------------|------------------|------------|
| testuser        | reader      | Test User        | 2025-11-13 |
| testcontributor | contributor | Test Contributor | 2025-11-13 |

**Note**: Production users not listed here for security. Use `wrangler d1 execute` to query database.
