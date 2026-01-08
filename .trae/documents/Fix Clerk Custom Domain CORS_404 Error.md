Yes, switching to **Developer Mode** (by using the `pk_test_...` keys you just added to your `.env`) will absolutely fix the CORS/404 error. The test environment does not enforce the custom domain requirements, so the script will load correctly.

Now, regarding the **new error** in your `restore-users.ts` script:
`Key (id)=(user_...) already exists.`

### **The Problem**
The script fails because it tries to create a new user row for the "Clerk ID", but that user ID **already exists** in your database. This happens if you have "duplicate" records for the same person (one with the old ID, one with the new Clerk ID) or if a previous run of the script failed halfway.

### **The Fix**
I will modify `src/scripts/restore-users.ts` to handle this "Merge" scenario intelligently:

1.  **Check for Existence**: Before trying to `INSERT` the new user ID, the script will check if it already exists in the database.
2.  **Merge Logic**:
    *   **If it doesn't exist**: It will proceed with the current logic (Create -> Move Data -> Delete Old).
    *   **If it DOES exist**: It will **skip the creation** and jump straight to **Moving Data** (pointing all Stores, Orders, etc., from the Old ID to the Existing New ID), and then delete the Old ID.

This "Merge Strategy" will resolve the conflict and clean up your database.

### **Proposed Changes**
*   Modify `src/scripts/restore-users.ts` to add a check for `existingTargetUser` inside the transaction.
*   Make the `INSERT` step conditional.
*   Keep the Foreign Key updates (Moving Data) the same, as they work for both scenarios.

I am ready to apply this fix to your script.
