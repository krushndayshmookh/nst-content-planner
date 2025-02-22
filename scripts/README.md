# Content Creation Planner - Schema Creation Script

This script creates the necessary collections and fields in PocketBase for the Content Creation Planner application.

## Prerequisites

1. PocketBase server running at `http://127.0.0.1:8090`
2. Admin account created in PocketBase
3. Node.js installed

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with your PocketBase admin credentials:

   ```env
   # PocketBase Configuration
   POCKETBASE_URL=http://127.0.0.1:8090
   PB_ADMIN_EMAIL=your-admin-email@example.com
   PB_ADMIN_PASSWORD=your-admin-password

   # Default Admin User (will be created if not exists)
   DEFAULT_ADMIN_EMAIL=admin@example.com
   DEFAULT_ADMIN_PASSWORD=admin123
   DEFAULT_ADMIN_NAME=Admin User
   ```

3. Run the setup script:

   ```bash
   npm run setup
   ```

## Schema Details

The script creates the following collections:

1. `users` (built-in auth collection)
   - name (text, required) - built-in
   - role (select: ['user', 'admin'], required)

2. `courses`
   - title (text, required)
   - description (text)
   - created_by (relation:users)
   - created_at (date, required)

3. `boards`
   - title (text, required)
   - course (relation:courses, required)
   - columns (json, required)
   - created_by (relation:users)
   - created_at (date, required)

4. `card_types`
   - title (text, required)
   - fields (json, required)
   - is_default (bool, required)

5. `cards`
   - title (text, required)
   - description (editor)
   - type (relation:card_types, required)
   - board (relation:boards, required)
   - column (text, required)
   - order (number)
   - creator (relation:users)
   - reviewer1 (relation:users)
   - reviewer2 (relation:users)
   - links (json)
   - created_at (date, required)
   - updated_at (date, required)
   - status (text)

6. `comments`
   - card (relation:cards, required)
   - user (relation:users, required)
   - content (editor, required)
   - mentioned_users (relation:users, multiple)
   - resolved (bool, required, default: false)
   - created_at (date, required)
   - updated_at (date, required)
   - is_edited (bool, required, default: false)
   - is_reply (bool, required, default: false)
   - parent_comment (relation:comments)

7. `logs`
   - log (text, required)
   - created_at (date, required)
   - related_items (json)
   - created_by (relation:users)

## Notes

- The script will fail if any of the collections already exist
- Make sure to update the `.env` file with your actual admin credentials
- The script assumes PocketBase is running at the default URL (`http://127.0.0.1:8090`)
- After running the schema creation, run `npm run create-defaults` to create default card types
- Run `npm run create-admin` to create the default admin user
- Or simply run `npm run setup` to do all of the above in sequence
