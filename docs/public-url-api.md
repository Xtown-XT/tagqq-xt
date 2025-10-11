## Public URL API Documentation

Base URL: `https://api.example.com/api/v1`

All endpoints below require an `Authorization` header:

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

### 1. Create Public URL

**Endpoint**: `POST /public-url`

**Request Body**:

```json
{
  "user_id": "<uuid>",
  "status": "Not payed"
}
```

**Response (201 Created)**:

```json
{
  "success": true,
  "message": "Public URL created successfully",
  "data": {
    "id": "<uuid>",
    "user_id": "<uuid>",
    "status": "Not payed",
    "is_active": true,
    "created_by": "<uuid>",
    "updated_by": "<uuid>",
    "createdAt": "2025-06-16T08:30:00.000Z",
    "updatedAt": "2025-06-16T08:30:00.000Z"
  }
}
```

---

### 2. List Public URLs

**Endpoint**: `GET /public-url`

**Query Parameters**:

* `includeInactive` (boolean, default: `false`)
* `user_id` (UUID)
* `status` (`Paid`, `Expried`, `Not Paid`)
* `page` (integer, default: `1`)
* `limit` (integer, default: `10`)
* `orderBy` (string, default: `createdAt`)
* `order` (`asc`, `desc`)

**Example**:

```
GET /public-url?status=Not%20payed&page=1&limit=5
```

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Public URLs retrieved successfully",
  "data": {
    "data": [
      {
        "id": "<uuid>",
        "user_id": "<uuid>",
        "status": "Not paid",
        "is_active": true,
        "createdAt": "2025-06-15T10:00:00.000Z",
        "updatedAt": "2025-06-15T10:00:00.000Z",
        "user": { /* nested user + profiles */ }
      }
      // ...
    ],
    "meta": {
      "total": 42,
      "totalPages": 9,
      "currentPage": 1
    }
  }
}
```

---

### 3. Get Public URL by ID

**Endpoint**: `GET /public-url/:id`

**Path Parameter**:

* `id` (UUID)

**Query Parameters**:

* `includeInactive` (boolean, default: `false`)

**Example**:

```
GET /public-url/123e4567-e89b-12d3-a456-426614174000
```

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Public URL retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "<uuid>",
    "status": "Not Paid",
    "is_active": true,
    "createdAt": "2025-06-15T10:00:00.000Z",
    "updatedAt": "2025-06-15T10:00:00.000Z",
    "user": { /* nested user + profiles */ }
  }
}
```

---

### 4. Get Emergency Public URL by ID

**Endpoint**: `GET /emergency/:id`

### Dont want Token

**Path Parameter**:

* `id` (UUID)

> This endpoint only returns URLs with `status=Paid` and `is_active=true`.

**Example**:

```
GET /emergency/123e4567-e89b-12d3-a456-426614174000
```

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Public URL retrieved successfully",
  "data": { /* same as Get by ID */ }
}
```

---

### 5. Update Public URL

**Endpoint**: `PUT /public-url/:id`

**Path Parameter**:

* `id` (UUID)

**Request Body**:

```json
{
  "status": "Payment"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Public URL updated successfully",
  "data": {
    /* updated resource */ }
}
```

---

### 6. Delete Public URL

**Endpoint**: `DELETE /public-url/:id`

**Path Parameter**:

* `id` (UUID)

**Query Parameters**:

* `force` (boolean, default: `false`) — permanent delete if `true`, soft-delete otherwise.

**Example**:

```
DELETE /public-url/123e4567-e89b-12d3-a456-426614174000?force=true
```

**Response (204 No Content)** — if `force=true`

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Public URL deleted successfully",
  "data": { "deleted": 1 }
}
```

---

### 7. Bulk Delete Public URLs

**Endpoint**: `DELETE /public-url`

**Query Parameters**: same as List + `force`

**Example**:

```
DELETE /public-url?force=false
```

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Public URLs deleted successfully",
  "data": { "deleted": 5 }
}
```

---

### 8. Restore Public URL by ID

**Endpoint**: `PATCH /public-url/:id/restore`

**Path Parameter**:

* `id` (UUID)

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Public URL restored successfully",
  "data": { "restored": 1 }
}
```

---

### 9. Bulk Restore Public URLs

**Endpoint**: `PATCH /public-url/restore`

**Query Parameters**: same as List

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "Public URLs restored successfully",
  "data": { "restored": 8 }
}
```

---

*All endpoints return errors in the format:*

```json
{
  "success": false,
  "message": "Error description",
  "errors": { /* detailed errors */ }
}
```
