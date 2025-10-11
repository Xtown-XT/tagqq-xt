Here’s a concise reference for your User‑Agent “Partner” APIs. All URLs are relative to:

```
https://<your-domain>/api/v1/onscan/useragent/partner
```

---

## Authentication

All endpoints require a valid JWT in the `Authorization: Bearer <token>` header.

---

## 1. Create Partner

**Request**

```
POST /partner
Content-Type: application/json
Authorization: Bearer <admin‑jwt>
```

```json
{
  "partner_type": "showroom",
  "name": "Acme Autos",
  "address1": "123 Spring Street",
  "address2": "Suite 200",
  "state": "Maharashtra",
  "district": "Mumbai",
  "country": "India",
  "pincode": "400001",
  "phone": "9876543210",
  "email": "contact@acmeautos.com",
  "gst_in": "27ABCDE1234F1Z5",
  "udyog_aadhar": "UAM123456789012",
  "rc": "RC123456",
  "createdBy": "550e8400-e29b-41d4-a716-446655440000",
  "updatedBy": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Successful Response** (201)

```json
{
  "success": true,
  "message": "Partner created successfully",
  "data": {
    "partner": {
      "id": "c0a8012b-7f54-11eb-9439-0242ac130002",
      "partner_type": "showroom",
      "name": "Acme Autos",
      "address1": "123 Spring Street",
      "address2": "Suite 200",
      "state": "Maharashtra",
      "district": "Mumbai",
      "country": "India",
      "pincode": "400001",
      "phone": "9876543210",
      "email": "contact@acmeautos.com",
      "gst_in": "27ABCDE1234F1Z5",
      "udyog_aadhar": "UAM123456789012",
      "rc": "RC123456",
      "is_active": true,
      "createdAt": "2025-06-21T09:30:45.000Z",
      "updatedAt": "2025-06-21T09:30:45.000Z",
      "createdBy": "550e8400-e29b-41d4-a716-446655440000",
      "updatedBy": "550e8400-e29b-41d4-a716-446655440000"
    },
    "useragent": {
      "id": "d4b0f9a8-7f54-11eb-9439-0242ac130002",
      "useragent_name": "Acme Autos",
      "email": "contact@acmeautos.com",
      "phone": "9876543210",
      "partner_id": "c0a8012b-7f54-11eb-9439-0242ac130002",
      "is_active": true,
      "createdAt": "2025-06-21T09:30:45.000Z",
      "updatedAt": "2025-06-21T09:30:45.000Z"
    }
  }
}
```

---

## 2. List Partners

**Request**

```
GET /partner?search=acme&page=1&limit=10&orderBy=name&order=desc
Authorization: Bearer <admin‑jwt>
```

| Query Parameter   | Type    | Description                                                 |
| ----------------- | ------- | ----------------------------------------------------------- |
| `search`          | string  | substring match on name, address1, email or phone           |
| `includeInactive` | boolean | include soft‑deleted partners (default: false)              |
| `is_active`       | boolean | filter by active/inactive                                   |
| `partner_type`    | enum    | one of `showroom`/`workshop`/`delivery_partner`/`ambulance` |
| `page`            | integer | 1‑based page number (default: 1)                            |
| `limit`           | integer | results per page (default: 10)                              |
| `orderBy`         | string  | field to sort on (default: `createdAt`)                     |
| `order`           | string  | `asc` or `desc` (default: `asc`)                            |

**Successful Response** (200)

```json
{
  "success": true,
  "message": "Partners retrieved successfully",
  "data": [
    { /* partner object */ },
    { /* partner object */ }
  ],
  "meta": {
    "total": 42,
    "totalPages": 5,
    "currentPage": 1
  }
}
```

---

## 3. Get Partner by ID

**Request**

```
GET /partner/{id}?includeInactive=true
Authorization: Bearer <admin‑jwt>
```

**Successful Response** (200)

```json
{
  "success": true,
  "message": "Partner retrieved successfully",
  "data": { /* partner object */ }
}
```

**404 Response**

```json
{
  "success": false,
  "message": "Partner not found"
}
```

---

## 4. Update Partner

**Request**

```
PUT /partner/{id}
Content-Type: application/json
Authorization: Bearer <admin‑jwt>
```

```json
{
  "name": "Acme Autos Pvt. Ltd.",
  "address2": "Floor 3B",
  "updatedBy": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Successful Response** (200)

```json
{
  "success": true,
  "message": "Partner updated successfully",
  "data": { /* updated partner object */ }
}
```

**404 Response**

```json
{
  "success": false,
  "message": "Partner not found or inactive"
}
```

---

## 5. Delete Partner

### 5.1 Soft Delete

**Request**

```
DELETE /partner/{id}
Authorization: Bearer <admin‑jwt>
```

**Successful Response** (200)

```json
{
  "success": true,
  "message": "Partner deleted successfully",
  "data": { "deleted": 1 }
}
```

### 5.2 Force Delete

**Request**

```
DELETE /partner/{id}?force=true
Authorization: Bearer <admin‑jwt>
```

**Successful Response** (204 No Content)

*No body.*

---

## 6. Bulk Delete Partners

**Request**

```
DELETE /partner?force=false
Authorization: Bearer <admin‑jwt>
```

**Successful Response** (200)

```json
{
  "success": true,
  "message": "Partners deleted successfully",
  "data": { "deleted": 5 }
}
```

---

## 7. Restore Partner

### 7.1 Restore by ID

**Request**

```
PATCH /partner/{id}/restore
Authorization: Bearer <admin‑jwt>
```

**Successful Response** (200)

```json
{
  "success": true,
  "message": "Partner restored successfully",
  "data": { "restored": 1 }
}
```

### 7.2 Bulk Restore

**Request**

```
PATCH /partner/restore
Authorization: Bearer <admin‑jwt>
```

**Successful Response** (200)

```json
{
  "success": true,
  "message": "Partners restored successfully",
  "data": { "restored": 7 }
}
```

---

