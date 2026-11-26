# Portfolio CMS & Admin Dashboard Security Specification

## 1. Data Invariants

1. **Public Read / Admin Write Separation**: Portfolio content (`/portfolio/profile`, `/skills`, `/projects`, `/certificates`, `/education`) is publicly readable only when published (`published == true`), while all creates, updates, and deletes require a verified admin (`request.auth.token.email_verified == true` and either the bootstrapped admin email `ibrahimchowdhury1000@gmail.com` or an existing `/admins/{uid}` record).
2. **PII Isolation on Visitor Messages**: Third-party inquiries in `/messages/{messageId}` contain visitor emails and private messages. Anyone may `create` a strictly validated inquiry with `status == 'unread'` and `createdAt == request.time`, but `get`, `list`, `update`, and `delete` are strictly restricted to the verified admin.
3. **Path Variable Hardening**: Every single-document target (`get`, `create`, `update`, `delete`) enforces `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).
4. **Anti-Update-Gap & Strict Schema Enforcement**: Every write (`create` and `update`) invokes a dedicated `isValid[Entity]()` blueprint validating exact keys (`hasAll` + `hasOnly`), field types, string `.size()` bounds, array `.size()` limits + first-element type checks, and strict server timestamps (`request.time`).
5. **Immutability**: `createdAt` is immortal on updates (`incoming().createdAt == existing().createdAt`).
6. **Zero DB Reads in List Queries**: `allow list` rules never invoke `get()` or `exists()`.

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Collection | Attack Vector | Expected Result |
|---|------------|---------------|-----------------|
| 1 | `/projects/{id}` | Unauthenticated user attempts to create a project | `PERMISSION_DENIED` |
| 2 | `/projects/{id}` | Authenticated non-admin user attempts to update a project | `PERMISSION_DENIED` |
| 3 | `/projects/{id}` | Spoofed admin email with `email_verified: false` attempts write | `PERMISSION_DENIED` |
| 4 | `/projects/{id}` | Admin sends Shadow Field (`isSuperAdmin: true`) on project create | `PERMISSION_DENIED` |
| 5 | `/projects/{id}` | Admin sends 2KB invalid document ID (`id: "a".repeat(2000)`) | `PERMISSION_DENIED` |
| 6 | `/projects/{id}` | Admin sends invalid category enum (`category: "Hacked"`) | `PERMISSION_DENIED` |
| 7 | `/projects/{id}` | Admin sends oversized array (`stack` with 50 items) or non-string element | `PERMISSION_DENIED` |
| 8 | `/projects/{id}` | Admin attempts to mutate immutable `createdAt` during update | `PERMISSION_DENIED` |
| 9 | `/messages/{id}` | Visitor submits contact message with forged `status: "read"` | `PERMISSION_DENIED` |
| 10 | `/messages/{id}` | Visitor submits contact message with forged client timestamp `createdAt` | `PERMISSION_DENIED` |
| 11 | `/messages/{id}` | Authenticated non-admin attempts `get` or `list` on `/messages` (PII leak) | `PERMISSION_DENIED` |
| 12 | `/admins/{uid}` | Authenticated non-admin attempts self-elevation by creating `/admins/{ownUid}` | `PERMISSION_DENIED` |
