# Profile
---

## Base URL

```
http://192.168.54.220:3000/api/v1/onscan/enduser/profile
```

---

## 1. Create Profile

**Endpoint**

```
POST /
```

**Request Body**

```json
{
  "docs_name": "Aadhar",       // one of ["Aadhar", "RC", "Profile", "license"]
  "data": {                    
    "fullName": "John Doe",
    "address": "123 Main St"
  },
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_by": "550e8400-e29b-41d4-a716-446655440001"  // optional
}
```

**Example (cURL)**

```bash
curl -X POST \
  'http://192.168.54.220:3000/api/v1/onscan/enduser/profile' \
  -H 'Content-Type: application/json' \
  -d '{
    "docs_name": "Aadhar",
    "data": { "fullName": "John Doe", "address": "123 Main St" },
    "user_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Success Response (201)**

```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "id": 1,
    "docs_name": "Aadhar",
    "data": { "fullName": "John Doe", "address": "123 Main St" },
    "is_active": true,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-06-13T08:00:00.000Z",
    "updated_at": "2025-06-13T08:00:00.000Z"
  }
}
```

---

## 2. List Profiles

**Endpoint**

```
GET /
```

**Query Parameters**

| Name              | Type    | Default     | Description                                                         |
| ----------------- | ------- | ----------- | ------------------------------------------------------------------- |
| `page`            | number  | `1`         | Page number for pagination                                          |
| `limit`           | number  | `10`        | Profiles per page                                                   |
| `includeInactive` | boolean | `false`     | Whether to include soft‑deleted (`is_active=false`) entries         |
| `user_id`         | UUID    | —           | Filter by a specific user’s UUID                                    |
| `docs_name`       | string  | —           | Filter by document type (e.g. `Aadhar`)                             |
| `search`          | string  | —           | Case‑insensitive substring search on `docs_name` or `data.fullName` |
| `orderBy`         | string  | `createdAt` | Field to sort by                                                    |
| `order`           | string  | `asc`       | Sort direction (`asc` or `desc`)                                    |

**Example**

```
GET /?page=2&limit=5&search=John&orderBy=updatedAt&order=desc
```

**Success Response (200)**

```json
{
  "success": true,
  "message": "Profiles retrieved successfully",
  "data": {
    "data": [
      {
        "id": 7,
        "docs_name": "Aadhar",
        "data": { "fullName": "John Appleseed", ... },
        "is_active": true,
        "user": { "id": "...", "username": "...", "email": "...", "phone": "..." },
        "created_at": "...",
        "updated_at": "..."
      },
      // …
    ],
    "meta": {
      "total": 42,
      "totalPages": 9,
      "currentPage": 2
    }
  }
}
```

---

## 3. Get Profile by ID

**Endpoint**

```
GET /:id
```

**Path Parameters**

| Name | Type | Description           |
| ---- | ---- | --------------------- |
| `id` | int  | Profile’s primary key |

**Optional Query**

| Name              | Type    | Default | Description                                 |
| ----------------- | ------- | ------- | ------------------------------------------- |
| `includeInactive` | boolean | `false` | Include soft‑deleted items if set to `true` |

**Example**

```
GET /123?includeInactive=true
```

**Success Response (200)**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 123,
    "docs_name": "RC",
    "data": { /* ... */ },
    "is_active": false,
    "user_id": "...",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Response (404)**

```json
{ "success": false, "message": "Profile not found" }
```

---

## 4. Update Profile

**Endpoint**

```
PUT /:id
```

**Path Parameters**

| Name | Type | Description           |
| ---- | ---- | --------------------- |
| `id` | int  | Profile’s primary key |

**Request Body**

Any subset of:

```json
{
  "docs_name": "Profile",
  "data": { /* updated JSON data */ },
  "updated_by": "550e8…",
  "user_id": "550e8…"           // if you need to reassign to a different user
}
```

**Example**

```bash
curl -X PUT \
  'http://192.168.54.220:3000/api/v1/onscan/enduser/profile/123' \
  -H 'Content-Type: application/json' \
  -d '{ "data": { "fullName": "Jane Doe" } }'
```

**Success Response (200)**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "docs_name": "Aadhar",
    "data": { "fullName": "Jane Doe", … },
    "is_active": true,
    "updated_at": "2025-06-13T09:00:00.000Z"
  }
}
```

**Error Response (404)**

```json
{ "success": false, "message": "Profile not found or inactive" }
```

---

## 5. Delete Profile

Soft‐delete by default; use `?force=true` for hard delete.

**Endpoint**

```
DELETE /:id
```

**Query**

| Name    | Type    | Default | Description                                           |
| ------- | ------- | ------- | ----------------------------------------------------- |
| `force` | boolean | `false` | If `true`, permanently remove the row from the table. |

**Example (soft delete)**

```
DELETE /123
```

**Example (hard delete)**

```
DELETE /123?force=true
```

**Responses**

* **204 No Content** (hard delete)
* **200 OK** (soft delete)

```json
{ "success": true, "message": "Profile deleted successfully", "data": { "deleted": 1 } }
```

**404 if not found / already deleted**

---

## 6. Bulk Delete Profiles

**Endpoint**

```
DELETE /
```

**Query**

| Name    | Type    | Default | Description                            |
| ------- | ------- | ------- | -------------------------------------- |
| `force` | boolean | `false` | Hard vs. soft delete for all matching. |

**Example**

```
DELETE /?force=false
```

**Response (200)**

```json
{ "success": true, "message": "Profiles deleted successfully", "data": { "deleted": 5 } }
```

---

## 7. Restore Profile by ID

Soft‑deleted profiles only.

**Endpoint**

```
PATCH /:id/restore
```

**Example**

```
PATCH /123/restore
```

**Response (200)**

```json
{ "success": true, "message": "Profile restored successfully", "data": { "restored": 1 } }
```

**404 if not found or not deleted**

---

## 8. Bulk Restore Profiles

**Endpoint**

```
PATCH /restore
```

**Example**

```
PATCH /restore
```

**Response (200)**

```json
{ "success": true, "message": "Profiles restored successfully", "data": { "restored": 4 } }
```

---

### Notes

* All endpoints return JSON with the structure:

  ```json
  {
    "success": boolean,
    "message": string,
    "data": any
  }
  ```

* On unexpected errors, you’ll receive:

  ```json
  { "success": false, "message": "Failed to ...", "error": { /* stack/info */ } }
  ```

* Make sure to include your JWT in `Authorization: Bearer <token>` headers for any protected routes.

Feel free to adjust examples for your preferred HTTP client (Axios, fetch, etc.).
