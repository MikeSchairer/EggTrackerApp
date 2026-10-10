# Flocker Security Specification

## 1. Data Invariants
1. **User Data Isolation**: Only authenticated users whose `request.auth.uid` matches the `{userId}` path parameter can read, create, update, or delete their own user profile or flock documents.
2. **Global Default Deny**: All unmapped paths or unauthenticated requests are strictly denied (`allow read, write: if false;`).
3. **Identity Verification**: The `userId` and `id` in the document payload must match `request.auth.uid`. No user can impersonate another user or overwrite other farmers' coops, chickens, or egg ledgers.
4. **Boundary Limits**: Strict size limits are enforced on all fields (e.g. document id <= 128 characters, JSON payload <= 800,000 characters).
5. **No Blanket Reads**: No global query collection scans without filtering by user identity.

## 2. The Dirty Dozen Malicious Payloads

1. **Unauthenticated Read of User Profile**:
   `GET /users/victim-user-id` (request.auth = null) -> **PERMISSION_DENIED**
2. **Cross-User Profile Read**:
   `GET /users/victim-user-id` (request.auth.uid = attacker-id) -> **PERMISSION_DENIED**
3. **Identity Spoofing Profile Creation**:
   `POST /users/victim-user-id` with `id: "victim-user-id"` (request.auth.uid = attacker-id) -> **PERMISSION_DENIED**
4. **Cross-User Flock Document Read**:
   `GET /users/victim-user-id/flockData/current` (request.auth.uid = attacker-id) -> **PERMISSION_DENIED**
5. **Cross-User Flock Document Write**:
   `SET /users/victim-user-id/flockData/current` (request.auth.uid = attacker-id) -> **PERMISSION_DENIED**
6. **Mismatched Payload Identity**:
   `SET /users/attacker-id/flockData/current` with `userId: "victim-user-id"` (request.auth.uid = attacker-id) -> **PERMISSION_DENIED**
7. **Oversized Document ID Injection (Resource Exhaustion)**:
   `SET /users/attacker-id/flockData/` + 2000-character ID -> **PERMISSION_DENIED**
8. **Ghost Field Injection (Missing Schema Strictness)**:
   `POST /users/attacker-id` with `ghostAdminField: true` -> **PERMISSION_DENIED**
9. **Invalid Document ID Characters (Path Traversal/Poisoning)**:
   `SET /users/attacker-id/flockData/bad@id!$` -> **PERMISSION_DENIED**
10. **Oversized Payload Injection**:
    `SET /users/attacker-id/flockData/current` with 1MB string payload -> **PERMISSION_DENIED**
11. **Immutable User ID Tampering on Update**:
    `UPDATE /users/attacker-id/flockData/current` changing `userId` to `new-user-id` -> **PERMISSION_DENIED**
12. **Catch-All Root Collection Breach**:
    `GET /randomCollection/secretDoc` (any user) -> **PERMISSION_DENIED**
