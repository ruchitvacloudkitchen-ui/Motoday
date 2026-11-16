# LifeOS Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Identity & Email Verification**: Every read and write requires an authenticated user with `request.auth.token.email_verified == true`.
2. **Relational Ownership (`Master Gate`)**: Every record in `/goals`, `/missions`, `/habits`, `/finance`, `/dailyReviews`, `/achievements`, and `/aiChats` must belong to `request.auth.uid` and require an existing parent profile document at `/users/$(request.auth.uid)`.
3. **Strict Schema & Anti-Shadow Keys**: Every `create` and `update` operation validates exact allowed keys via `hasAll` and `hasOnly` inside `isValid[Entity]`, plus action-based `affectedKeys().hasOnly(...)` on updates.
4. **Terminal State Locking**: Once a `Mission` reaches `'Completed'` or `'Cancelled'`, subsequent updates are blocked (`!(existing().status in ['Completed', 'Cancelled'])`).
5. **Temporal Integrity**: `createdAt` must equal `request.time` on creation and remain immutable on update; `updatedAt` must equal `request.time` on every write.
6. **Path Variable Guard**: Document IDs must match `^[a-zA-Z0-9_\-]+$` with length `1..128`.

## 2. The "Dirty Dozen" Payloads
1. **Unverified Email Spoof**: `{ auth: { uid: 'u1', token: { email_verified: false } } }` -> `PERMISSION_DENIED`
2. **Cross-Tenant Mission Creation**: `userId: 'victim_uid'` when `request.auth.uid == 'attacker_uid'` -> `PERMISSION_DENIED`
3. **Orphaned Goal Creation**: Creating `/goals/g1` when `/users/u1` does not exist -> `PERMISSION_DENIED`
4. **Shadow Field Injection on User**: Adding `isAdmin: true` to `/users/u1` -> `PERMISSION_DENIED`
5. **Terminal Mission Re-Opening**: Updating `/missions/m1` when `existing().status == 'Completed'` -> `PERMISSION_DENIED`
6. **Immutable `createdAt` Tampering**: Changing `createdAt` during an update on `/missions/m1` -> `PERMISSION_DENIED`
7. **Forged Client Timestamp**: Setting `updatedAt` to a past timestamp instead of `request.time` -> `PERMISSION_DENIED`
8. **Oversized String DoS**: Sending a 5,000-character string in `mission.title` (limit 140) -> `PERMISSION_DENIED`
9. **Path ID Poisoning**: Creating document with ID containing spaces or special characters (`bad$id!`) -> `PERMISSION_DENIED`
10. **Negative Financial Amount**: Creating `/finance/f1` with `amount: -5000` -> `PERMISSION_DENIED`
11. **Unscoped List Query**: Listing `/missions` without filtering `where('userId', '==', request.auth.uid)` -> `PERMISSION_DENIED`
12. **PII / Profile Cross-Read**: User `u2` attempting `get` on `/users/u1` -> `PERMISSION_DENIED`
