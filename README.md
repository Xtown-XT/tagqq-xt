
# OnScan API Documentation

## Profile API

### Base URL

http://192.168.54.220:3000/api/v1/onscan/enduser/profile
```

### 1. Create Profile
**Endpoint**  
`POST /`

**Request Body**
```json
{
  "docs_name": "Aadhar",
  "data": {
    "fullName": "John Doe",
    "address": "123 Main St"
  },
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_by": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Example (cURL)**
```bash
curl -X POST 'http://192.168.54.220:3000/api/v1/onscan/enduser/profile' \
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

### 2. List Profiles
**Endpoint**  
`GET /`

**Query Parameters**
| Parameter         | Type    | Default | Description                          |
|-------------------|---------|---------|--------------------------------------|
| `page`            | number  | 1       | Page number for pagination           |
| `limit`           | number  | 10      | Profiles per page                    |
| `includeInactive` | boolean | false   | Include soft-deleted entries         |
| `user_id`         | UUID    | —       | Filter by user UUID                  |
| `docs_name`       | string  | —       | Filter by document type              |
| `search`          | string  | —       | Search on docs_name or data.fullName |
| `orderBy`         | string  | createdAt | Field to sort by                   |
| `order`           | string  | asc      | Sort direction (asc/desc)          |

**Success Response (200)**
```json
{
  "success": true,
  "message": "Profiles retrieved successfully",
  "data": {
    "data": [ ... ],
    "meta": {
      "total": 42,
      "totalPages": 9,
      "currentPage": 2
    }
  }
}
```

### 3. Get Profile by ID
**Endpoint**  
`GET /:id`

**Success Response (200)**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 123,
    "docs_name": "RC",
    "data": { ... },
    "is_active": false,
    "user_id": "...",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

### 4. Update Profile
**Endpoint**  
`PUT /:id`

**Request Body**
```json
{
  "docs_name": "Profile",
  "data": { ... },
  "updated_by": "550e8…",
  "user_id": "550e8…"
}
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

### 5. Delete Profile
**Endpoint**  
`DELETE /:id?force=true`

**Responses**  
- Soft delete (200):
```json
{ "success": true, "message": "Profile deleted successfully", "data": { "deleted": 1 } }
```
- Hard delete (204): No Content

### 6. Bulk Delete Profiles
**Endpoint**  
`DELETE /?force=false`

**Response (200)**
```json
{ "success": true, "message": "Profiles deleted successfully", "data": { "deleted": 5 } }
```

### 7. Restore Profile
**Endpoint**  
`PATCH /:id/restore`

**Response (200)**
```json
{ "success": true, "message": "Profile restored successfully", "data": { "restored": 1 } }
```

### 8. Bulk Restore Profiles
**Endpoint**  
`PATCH /restore`

**Response (200)**
```json
{ "success": true, "message": "Profiles restored successfully", "data": { "restored": 4 } }
```

---

## Third Party API Keys

### Base URL
```
/api/v1/onscan/thridpartyapi/apikeys
```

### 1. Create API Key
**Endpoint**  
`POST /`

**Request Body**
```json
{
  "name": "quickekyc",
  "keys": {
    "publicKey": "ABCD1234EFGH5678",
    "usageLimit": 1000,
    "active": true
  }
}
```

### 2. List API Keys
**Endpoint**  
`GET /?limit=10&page=1&search=smtp`

**Response**
```json
{
  "status": "success",
  "message": "API keys fetched successfully",
  "data": {
    "data": [ ... ],
    "total": 3,
    "page": 1,
    "totalPages": 1
  }
}
```

### 3. Get API Key by ID
**Endpoint**  
`GET /:id`

### 4. Update API Key
**Endpoint**  
`PUT /:id`

### 5. Delete API Key
**Endpoint**  
`DELETE /:id`

---

# User API Documentation

**Base URL:**
`http://192.168.1.6:3000/api/v1/onscan/enduser`

---

## 🧾 Table of Contents

1. [User Registration](#1-user-registration)
2. [User Login](#2-user-login)
3. [Get Current User (`/me`)](#3-get-current-user)
4. [Get All Users](#4-get-all-users)
5. [Get User by ID](#5-get-user-by-id)
6. [Update User](#6-update-user)
7. [Soft Delete User](#7-soft-delete-user)
8. [Restore User](#8-restore-user)
9. [Refresh Token](#9-refresh-token)

---

## 1. User Registration

**Endpoint:** `POST /users/register`
**Requires Auth:**  No
**Validation:** Yes (using `userRegisterSchema`)

###  Request Body

```json
{
  "username": "user",
  "email": "user@gmail.com",
  "password": "town@123",
  "phone": "9637418520",
  "referral_id": "REF123" //optional
}
```

###  Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": cd95572a,
    "username": "johndoe",
    "email": "johndoe@example.com",
    "phone": "9876543210",
    "referral_id": "REF123",
    "token": "access_token_here"
  }
}
```

---

## 2. User Login

**Endpoint:** `POST /users/login`
**Requires Auth:**  No

###  Request Body

```json
{
  "identifier": "johndoe@example.com" or "98765412302",(email or phone)
  "password": "YourPassword@123"
}
```

###  Response

```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "access_token_here",
  "refreshToken": "refresh_token_here",
  "username": "johndoe",
  "email": "johndoe@example.com",
}
```

---

## 3. Get Current User

**Endpoint:** `GET /users/me`
**Requires Auth:**  Yes (Bearer Token)

###  Response

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "johndoe@example.com",
    "phone": "9876543210",
    "referral_id": "REF123",
    "is_active": true,
    "createdAt": "2025-06-01T12:34:56.000Z"
  }
}
```

---

## 4. Get All Users

**Endpoint:** `GET /users?filter=active&page=1&limit=10&orderBy=desc`
**Requires Auth:**  Yes

###  Response

```json
{
  "success": true,
  "total": 25,
  "totalPages": 3,
  "currentPage": 1,
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "johndoe@example.com",
      "phone": "9876543210",
      "referral_id": "REF123",
      "is_active": true,
      "createdAt": "2025-06-01T12:34:56.000Z",
      "updatedAt": "2025-06-02T09:00:00.000Z"
    }
  ]
}
```

---

## 5. Get User by ID

**Endpoint:** `GET /users/:id`
**Requires Auth:** Yes

###  Response

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "johndoe@example.com",
    "phone": "9876543210",
    "referral_id": "REF123",
    "is_active": true,
    "createdAt": "2025-06-01T12:34:56.000Z"
  }
}
```

---

## 6. Update User

**Endpoint:** `PUT /users/:id`
**Requires Auth:** Yes
**Validation:** Yes (using `updateUserSchema`)

### Request Body

```json
{
  "username": "john_updated",
  "email": "john_updated@example.com",
  "phone": "1234567890"
}
```

###  Response

```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "username": "john_updated",
    "email": "john_updated@example.com",
    "phone": "1234567890",
    "referral_id": "REF123",
    "updatedAt": "2025-06-12T13:05:33.000Z"
  }
}
```

---

## 7. Soft Delete User

**Endpoint:** `DELETE /users/:id`
**Requires Auth:**  Yes

###  Response

```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

###  Already Inactive Example

```json
{
  "success": false,
  "message": "User is already deactivated"
}
```

---

## 8. Restore User

**Endpoint:** `PATCH /users/restore/:id`
**Requires Auth:** Yes

### Response

```json
{
  "success": true,
  "message": "User restored successfully"
}
```

### Already Active Example

```json
{
  "success": false,
  "message": "User is already active"
}
```

---

## 9. Refresh Token

**Endpoint:** `POST /users/refreshtoken`
**Requires Auth:** No

### Request Body

```json
{
  "refreshToken": "your_refresh_token_here"
}
```

###  Response

```json
{
  "success": true,
  "accessToken": "new_access_token_here",
  "refreshToken": "new_refresh_token_here"
}
```

---

##  Authorization Header

For all protected routes, pass the access token as:

```http
Authorization: Bearer your_access_token_here
```

---

##  Token Expiry

| Token Type    | Expiry Duration |
| ------------- | --------------- |
| Access Token  | 2 hours         |
| Refresh Token | 7 Days          |

---



## Order Tracking API

### Base URL
```
https://api.example.com/api/v1/onscan/enduser/order_tracking
```

### 1. Create Order Tracking
**Endpoint**  
`POST /`

**Request Body**
```json
{
  "order_id": "e5bcb37e-2cf4-4a3a-8b1d-e4e082b02c73",
  "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "Packing"
}
```

### 2. List Order Tracking
**Endpoint**  
`GET /?page=1&limit=10&status=Shipped`

### 3. Get Order Tracking by ID
**Endpoint**  
`GET /:id`

### 4. Update Order Tracking
**Endpoint**  
`PUT /:id`

### 5. Delete Order Tracking
**Endpoint**  
`DELETE /:id`

### 6. Bulk Delete Order Tracking
**Endpoint**  
`DELETE /`

### 7. Restore Order Tracking
**Endpoint**  
`PATCH /:id/restore`

### 8. Bulk Restore Order Tracking
**Endpoint**  
`PATCH /restore`

---

## Models

### Customer Document Model
```markdown
- id
- user_id
- doctype (license, insurance, registration, idproof, others)
- doc_name
- doc_blob (BLOB)
- mime_type 
- file_size (2MB max)
- created_at
- remarks
```

### Order Tracking Model
```markdown
- id (UUID)
- order_id (UUID)
- user_id (UUID)
- status (string)
- created_at (timestamp)
- updated_at (timestamp)
```

## Authorization
```http
Authorization: Bearer your_access_token_here
```

## Token Expiry
| Token Type    | Expiry Duration |
|---------------|-----------------|
| Access Token  | 2 hours         |
| Refresh Token | 7 days          |


---

## Order Tracking API Documentation

**Base URL:** `https://api.example.com/api/v1/onscan/enduser/order_tracking`

### Table of Contents

* [POST /order_tracking](#post-order-tracking)
* [GET /order_tracking](#get-order-tracking)
* [GET /order_tracking/{id}](#get-order-tracking-id)
* [PUT /order_tracking/{id}](#put-order-tracking-id)
* [DELETE /order_tracking/{id}](#delete-order-tracking-id)
* [DELETE /order_tracking (bulk)](#delete-order-tracking-bulk)
* [PATCH /order_tracking/{id}/restore](#patch-order-tracking-id-restore)
* [PATCH /order_tracking/restore (bulk)](#patch-order-tracking-restore-bulk)

<a id="post-order-tracking"></a>

### POST /api/v1/onscan/enduser/order\_tracking

Creates a new order tracking record.

**Headers:**

* `Authorization: Bearer <token>`
* `Content-Type: application/json`

**Request Body (JSON):**

* `order_id` (string, UUID, required): Unique ID of the order.
* `user_id` (string, UUID, required): Unique ID of the user.
* `status` (string, required): Current status of the order (e.g., "Packing", "Shipped", "Delivered").

```bash
curl -X POST "https://api.example.com/api/v1/onscan/enduser/order_tracking" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "e5bcb37e-2cf4-4a3a-8b1d-e4e082b02c73",
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "Packing"
  }'


**Success Response (201 Created):**

```json
HTTP/1.1 201 Created
{
  "success": true,
  "message": "Order tracking record created successfully.",
  "data": {
    "id": "7a1f6df4-3457-4de9-9f5d-e59aab7e9d4b",
    "order_id": "e5bcb37e-2cf4-4a3a-8b1d-e4e082b02c73",
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "Packing",
    "created_at": "2025-06-13T12:00:00.000Z",
    "updated_at": "2025-06-13T12:00:00.000Z"
  }
}
```

**Error Responses:**

* `400 Bad Request`: Validation error or missing fields.

```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "status": "Status is required."
  }
}
```

* `404 Not Found`: Referenced `order_id` or `user_id` not found.

```json
HTTP/1.1 404 Not Found
{
  "success": false,
  "message": "User not found."
}
```

* `500 Internal Server Error`: Generic server error.

```json
HTTP/1.1 500 Internal Server Error
{
  "success": false,
  "message": "Internal Server Error"
}
```

<a id="get-order-tracking"></a>

### GET /api/v1/onscan/enduser/order\_tracking

Retrieves a list of order tracking records, optionally paginated.

**Headers:**

* `Authorization: Bearer <token>`

**Query Parameters (optional):**

* `page` (integer): Page number for pagination (default: 1).
* `limit` (integer): Number of items per page (default: 10).
* `status` (string): Filter by order status (e.g., "Shipped").
* `user_id` (string, UUID): Filter by user ID.

```bash
curl -X GET "https://api.example.com/api/v1/onscan/enduser/order_tracking?page=1&limit=2" \
  -H "Authorization: Bearer <token>"
```

**Success Response (200 OK):**

```json
HTTP/1.1 200 OK
{
  "success": true,
  "message": "Order tracking records retrieved successfully.",
  "data": [
    {
      "id": "8c9f5e8f-5aa1-4dfa-9d6c-2ee3b0b4c7a1",
      "order_id": "a74d5a3e-2256-4a92-8123-7f5c3b9c0d67",
      "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "status": "Shipped",
      "created_at": "2025-06-12T10:00:00.000Z",
      "updated_at": "2025-06-12T11:00:00.000Z"
    },
    {
      "id": "f1e857b5-5075-438c-9742-1ffdf77acb22",
      "order_id": "b98dfe14-11a3-4d38-b5d7-48a2b2f3c8d9",
      "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "status": "Delivered",
      "created_at": "2025-06-10T09:30:00.000Z",
      "updated_at": "2025-06-12T13:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "count": 2,
    "per_page": 2,
    "current_page": 1,
    "total_pages": 25
  }
}
```

**Error Responses:**

* `400 Bad Request`: Invalid query parameters.

```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "message": "Invalid 'page' parameter.",
  "errors": {
    "page": "Page must be a positive integer."
  }
}
```

* `404 Not Found`: No order tracking records found.

```json
HTTP/1.1 404 Not Found
{
  "success": false,
  "message": "No order tracking records found."
}
```

* `500 Internal Server Error`: Generic server error.

```json
HTTP/1.1 500 Internal Server Error
{
  "success": false,
  "message": "Internal Server Error"
}
```

<a id="get-order-tracking-id"></a>

### GET /api/v1/onscan/enduser/order\_tracking/{id}

Retrieves a single order tracking record by its ID.

**Headers:**

* `Authorization: Bearer <token>`

**Path Parameters:**

* `id` (string, UUID, required): Unique ID of the order tracking record.

```bash
curl -X GET "https://api.example.com/api/v1/onscan/enduser/order_tracking/8c9f5e8f-5aa1-4dfa-9d6c-2ee3b0b4c7a1" \
  -H "Authorization: Bearer <token>"
```

**Success Response (200 OK):**

```json
HTTP/1.1 200 OK
{
  "success": true,
  "message": "Order tracking record retrieved successfully.",
  "data": {
    "id": "8c9f5e8f-5aa1-4dfa-9d6c-2ee3b0b4c7a1",
    "order_id": "a74d5a3e-2256-4a92-8123-7f5c3b9c0d67",
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "Shipped",
    "created_at": "2025-06-12T10:00:00.000Z",
    "updated_at": "2025-06-12T11:00:00.000Z"
  }
}
```

**Error Responses:**

* `400 Bad Request`: Invalid `id` format.

```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "message": "Invalid ID format.",
  "errors": {
    "id": "ID must be a valid UUID."
  }
}
```

* `404 Not Found`: Order tracking record not found.

```json
HTTP/1.1 404 Not Found
{
  "success": false,
  "message": "Order tracking record not found."
}
```

* `500 Internal Server Error`: Generic server error.

```json
HTTP/1.1 500 Internal Server Error
{
  "success": false,
  "message": "Internal Server Error"
}
```

<a id="put-order-tracking-id"></a>

### PUT /api/v1/onscan/enduser/order\_tracking/{id}

Updates an existing order tracking record by its ID.

**Headers:**

* `Authorization: Bearer <token>`
* `Content-Type: application/json`

**Path Parameters:**

* `id` (string, UUID, required): Unique ID of the order tracking record.

**Request Body (JSON):**

* `order_id` (string, UUID, required): ID of the order.
* `user_id` (string, UUID, required): ID of the user.
* `status` (string, required): Updated status of the order.

```bash
curl -X PUT "https://api.example.com/api/v1/onscan/enduser/order_tracking/7a1f6df4-3457-4de9-9f5d-e59aab7e9d4b" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "e5bcb37e-2cf4-4a3a-8b1d-e4e082b02c73",
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "Delivered"
  }'
```

**Success Response (200 OK):**

```json
HTTP/1.1 200 OK
{
  "success": true,
  "message": "Order tracking record updated successfully.",
  "data": {
    "id": "7a1f6df4-3457-4de9-9f5d-e59aab7e9d4b",
    "order_id": "e5bcb37e-2cf4-4a3a-8b1d-e4e082b02c73",
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "Delivered",
    "created_at": "2025-06-13T12:00:00.000Z",
    "updated_at": "2025-06-14T15:45:00.000Z"
  }
}
```

**Error Responses:**

* `400 Bad Request`: Validation error or invalid data.

```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "status": "Status is required."
  }
}
```

* `404 Not Found`: Order tracking record not found.

```json
HTTP/1.1 404 Not Found
{
  "success": false,
  "message": "Order tracking record not found."
}
```

* `500 Internal Server Error`: Generic server error.

```json
HTTP/1.1 500 Internal Server Error
{
  "success": false,
  "message": "Internal Server Error"
}
```

<a id="delete-order-tracking-id"></a>

### DELETE /api/v1/onscan/enduser/order\_tracking/{id}

Deletes an order tracking record by its ID.

**Headers:**

* `Authorization: Bearer <token>`

**Path Parameters:**

* `id` (string, UUID, required): Unique ID of the order tracking record.

```bash
curl -X DELETE "https://api.example.com/api/v1/onscan/enduser/order_tracking/7a1f6df4-3457-4de9-9f5d-e59aab7e9d4b" \
  -H "Authorization: Bearer <token>"
```

**Success Response (200 OK):**

```json
HTTP/1.1 200 OK
{
  "success": true,
  "message": "Order tracking record deleted successfully."
}
```

**Error Responses:**

* `404 Not Found`: Order tracking record not found.

```json
HTTP/1.1 404 Not Found
{
  "success": false,
  "message": "Order tracking record not found."
}
```

* `500 Internal Server Error`: Generic server error.

```json
HTTP/1.1 500 Internal Server Error
{
  "success": false,
  "message": "Internal Server Error"
}
```

<a id="delete-order-tracking-bulk"></a>

### DELETE /api/v1/onscan/enduser/order\_tracking (bulk)

Deletes multiple order tracking records.

**Headers:**

* `Authorization: Bearer <token>`
* `Content-Type: application/json`

**Request Body (JSON):**

* `ids` (array of strings, required): List of order tracking record IDs to delete.

```bash
curl -X DELETE "https://api.example.com/api/v1/onscan/enduser/order_tracking" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [
      "2a1d73c7-07b6-4fae-9086-1d7e8a0b123f",
      "3b2c53d8-18c7-5f8f-9097-2e8f9b1c345d"
    ]
  }'
```

**Success Response (200 OK):**

```json
HTTP/1.1 200 OK
{
  "success": true,
  "message": "2 order tracking records deleted successfully."
}
```

**Error Responses:**

* `400 Bad Request`: Invalid request body or missing `ids`.

```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "message": "Invalid request.",
  "errors": {
    "ids": "IDs array is required."
  }
}
```

* `404 Not Found`: One or more records not found.

```json
HTTP/1.1 404 Not Found
{
  "success": false,
  "message": "One or more order tracking records not found."
}
```

* `500 Internal Server Error`: Generic server error.

```json
HTTP/1.1 500 Internal Server Error
{
  "success": false,
  "message": "Internal Server Error"
}
```

<a id="patch-order-tracking-id-restore"></a>

### PATCH /api/v1/onscan/enduser/order\_tracking/{id}/restore

Restores a deleted order tracking record by its ID.

**Headers:**

* `Authorization: Bearer <token>`

**Path Parameters:**

* `id` (string, UUID, required): Unique ID of the order tracking record to restore.

```bash
curl -X PATCH "https://api.example.com/api/v1/onscan/enduser/order_tracking/7a1f6df4-3457-4de9-9f5d-e59aab7e9d4b/restore" \
  -H "Authorization: Bearer <token>"
```

**Success Response (200 OK):**

```json
HTTP/1.1 200 OK
{
  "success": true,
  "message": "Order tracking record restored successfully.",
  "data": {
    "id": "7a1f6df4-3457-4de9-9f5d-e59aab7e9d4b",
    "order_id": "e5bcb37e-2cf4-4a3a-8b1d-e4e082b02c73",
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "Delivered",
    "created_at": "2025-06-13T12:00:00.000Z",
    "updated_at": "2025-06-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

* `400 Bad Request`: Invalid `id` format.

```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "message": "Invalid ID format.",
  "errors": {
    "id": "ID must be a valid UUID."
  }
}
```

* `404 Not Found`: Order tracking record not found.

```json
HTTP/1.1 404 Not Found
{
  "success": false,
  "message": "Order tracking record not found."
}
```

* `500 Internal Server Error`: Generic server error.

```json
HTTP/1.1 500 Internal Server Error
{
  "success": false,
  "message": "Internal Server Error"
}
```

<a id="patch-order-tracking-restore-bulk"></a>

### PATCH /api/v1/onscan/enduser/order\_tracking/restore (bulk)

Restores multiple deleted order tracking records.

**Headers:**

* `Authorization: Bearer <token>`
* `Content-Type: application/json`

**Request Body (JSON):**

* `ids` (array of strings, required): List of order tracking record IDs to restore.

```bash
curl -X PATCH "https://api.example.com/api/v1/onscan/enduser/order_tracking/restore" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [
      "2a1d73c7-07b6-4fae-9086-1d7e8a0b123f",
      "3b2c53d8-18c7-5f8f-9097-2e8f9b1c345d"
    ]
  }'
```

**Success Response (200 OK):**

```json
HTTP/1.1 200 OK
{
  "success": true,
  "message": "2 order tracking records restored successfully."
}
```

**Error Responses:**

* `400 Bad Request`: Invalid request body or missing `ids`.

```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "message": "Invalid request.",
  "errors": {
    "ids": "IDs array is required."
  }
}
```

* `404 Not Found`: One or more records not found.

```json
HTTP/1.1 404 Not Found
{
  "success": false,
  "message": "One or more order tracking records not found."
}
```

* `500 Internal Server Error`: Generic server error.

```json
HTTP/1.1 500 Internal Server Error
{
  "success": false,
  "message": "Internal Server Error"
}
```
```

---



# Razorpay API Documentation

## 1. Create Payment for a User

**POST**

**URL:**



[http://192.168.1.110:3000/api/v1/onscan/thridpartyapi/razorpay/order](http://192.168.1.110:3000/api/v1/onscan/thridpartyapi/razorpay/order)

````

**Request Body:**

```json
{
  "amount": 1000,
  "currency": "INR",
  ["user_id":"4c787ee3-301b-4bde-bc63-e554428331f6"], // Optional
  "user_type": "USER",
  "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "payment_method": "UPI"
}
````

**Response Body:**

```json
{
  "message": "Order created successfully",
  "razorpayOrder": {
    "amount": 1000,
    "amount_due": 1000,
    "amount_paid": 0,
    "attempts": 0,
    "created_at": 1750072427,
    "currency": "INR",
    "entity": "order",
    "id": "order_QhqZj0niG3JgpD",
    "notes": [],
    "offer_id": null,
    "receipt": "c9a28c18-e447-48cf-9f95-f6d57079b101",
    "status": "created"
  },
  "payment": {
    "id": "a333cc5d-394d-4f92-bcac-87c83ea8e6f2",
    "user_id": "4c787ee3-301b-4bde-bc63-e554428331f6",
    "user_type": "USER",
    "razorpay_order_id": "order_QhqZj0niG3JgpD",
    "amount": 1000,
    "currency": "INR",
    "status": "created",
    "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "receipt": "c9a28c18-e447-48cf-9f95-f6d57079b101",
    "payment_method": "UPI",
    "updatedAt": "2025-06-16T11:13:47.998Z",
    "createdAt": "2025-06-16T11:13:47.998Z"
  }
}
```

---

## 2. Verify Payment After Success

**POST**

**URL:**

```
http://192.168.1.110:3000/api/v1/onscan/thridpartyapi/razorpay/verify
```

**Request Body:**

```json
{ how is possible parthiban please tell me that what can i do
  "razorpay_order_id": "order_Qhqj4qddU8qKcx",
  "razorpay_payment_id": "pay_QhqjOBEZbTaUe2",
  "razorpay_signature": "dfe23cfbbadcd96e0df8f93eba1e8af857eb82e8672a1204fca66b53d64d5fa1",
  "delivery_address_id": 1
}
```

**Response Body:**

```json
{
  "message": "Payment successfully verified for Payment ID pay_QhqjOBEZbTaUe2 and Order ID order_Qhqj4qddU8qKcx",
  "payment": {
    "id": "3e0aa4d6-6465-45eb-bab2-857fc1b39519",
    "user_id": "4c787ee3-301b-4bde-bc63-e554428331f6",
    "user_type": "USER",
    "razorpay_order_id": "order_Qhqj4qddU8qKcx",
    "razorpay_payment_id": "pay_QhqjOBEZbTaUe2",
    "razorpay_signature": "dfe23cfbbadcd96e0df8f93eba1e8af857eb82e8672a1204fca66b53d64d5fa1",
    "amount": "1000.00",
    "currency": "INR",
    "status": "CAPTURED",
    "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "receipt": "9bf75fff-955c-4ed7-a9c7-5724a0f7942b",
    "payment_method": "UPI",
    "createdAt": "2025-06-16T11:22:39.000Z",
    "updatedAt": "2025-06-16T11:36:03.804Z"
  }
}
```

---

## 3. Verify Payment by Razorpay Order ID

**GET**

**URL:**

```
http://192.168.1.110:3000/api/v1/onscan/thridpartyapi/order_Qhqj4qddU8qKcx
```

**Request Params:**

* `razorpay_order_id` (in URL)

**Response Body:**

```json
{
  "message": "Payment successfully verified for Payment ID pay_QhqjOBEZbTaUe2 and Order ID order_Qhqj4qddU8qKcx",
  "payment": {
    "id": "3e0aa4d6-6465-45eb-bab2-857fc1b39519",
    "user_id": "4c787ee3-301b-4bde-bc63-e554428331f6",
    "user_type": "USER",
    "razorpay_order_id": "order_Qhqj4qddU8qKcx",
    "razorpay_payment_id": "pay_QhqjOBEZbTaUe2",
    "razorpay_signature": "dfe23cfbbadcd96e0df8f93eba1e8af857eb82e8672a1204fca66b53d64d5fa1",
    "amount": "1000.00",
    "currency": "INR",
    "status": "CAPTURED",
    "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "receipt": "9bf75fff-955c-4ed7-a9c7-5724a0f7942b",
    "payment_method": "UPI",
    "createdAt": "2025-06-16T11:22:39.000Z",
    "updatedAt": "2025-06-16T11:36:03.804Z"
  }
}
```


**Admin User API Documentation**

This document describes the HTTP endpoints, request payloads, and response examples for the Admin User module. All routes under `/api` prefix unless otherwise noted.

---

## Authentication & Registration

### 1. Register Admin

* **URL**: `POST /api/admins/register`
* **Auth**: Public
* **Request Body** (JSON):

  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Secret123",
    "phone": "9876543210",
    "role": "Admin"
  }
  ```
* **Success Response** (201 Created):

  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-v4-id",
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "Admin",
      "token": "jwt-access-token"
    },
    "message": "Admin registered successfully"
  }
  ```
* **Error Responses**:

  * 409 Conflict: `{ "success": false, "message": "Username, email, or phone already exists" }`
  * 500 Internal Server Error

---

### 2. Login Admin

* **URL**: `POST /api/admins/login`
* **Auth**: Public
* **Request Body** (JSON):

  ```json
  {
    "identifier": "john@example.com", // or username or phone
    "password": "Secret123"
  }
  ```
* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "message": "Login successful",
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Admin"
  }
  ```
* **Error Responses**:

  * 401 Unauthorized: `{ "success": false, "message": "Invalid credentials" }`
  * 403 Forbidden: `{ "success": false, "message": "Account inactive. Contact Super Admin." }`
  * 500 Internal Server Error

---

### 3. Refresh Token

* **URL**: `POST /api/admins/refreshtoken`
* **Auth**: Public
* **Request Body** (JSON):

  ```json
  {
    "refreshToken": "jwt-refresh-token"
  }
  ```
* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-jwt-refresh-token"
  }
  ```
* **Error Responses**:

  * 400 Bad Request: `{ "success": false, "message": "Refresh token required" }`
  * 403 Forbidden: `{ "success": false, "message": "<error message>" }`

---

## Protected Routes (Requires Bearer `<accessToken>` in Authorization header)

### 4. Get Current Admin Profile

* **URL**: `GET /api/admins/me`
* **Auth**: Bearer
* **Request Headers**:

  ```http
  Authorization: Bearer jwt-access-token
  ```
* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "admin": {
      "id": "uuid-v4-id",
      "admin_username": "john_doe",
      "admin_email": "john@example.com",
      "admin_phone": "9876543210",
      "role": "Admin",
      "is_active": true,
      "createdAt": "2025-06-20T05:12:34.000Z"
    }
  }
  ```

---

### 5. List All Admins

* **URL**: `GET /api/admins`
* **Auth**: Bearer
* **Query Parameters**:

  * `filter`: `all` | `active` | `inactive` (default: `all`)
  * `page`: number (default: `1`)
  * `limit`: number (default: `10`)
  * `orderBy`: `asc` | `desc` (default: `desc`)
* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "total": 42,
    "totalPages": 5,
    "currentPage": 1,
    "admins": [
      {
        "id": "uuid-v4-id",
        "admin_username": "john_doe",
        "admin_email": "john@example.com",
        "admin_phone": "9876543210",
        "role": "Admin",
        "is_active": true,
        "createdAt": "2025-06-20T05:12:34.000Z",
        "updatedAt": "2025-06-20T05:12:34.000Z"
      }
      // ... more admins
    ]
  }
  ```

---

### 6. Get Admin By ID

* **URL**: `GET /api/admins/:id`
* **Auth**: Bearer
* **Path Parameters**:

  * `id`: Admin UUID
* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "admin": {
      "id": "uuid-v4-id",
      "admin_username": "john_doe",
      "admin_email": "john@example.com",
      "admin_phone": "9876543210",
      "role": "Admin",
      "is_active": true,
      "createdAt": "2025-06-20T05:12:34.000Z"
    }
  }
  ```
* **Error**: 400 Bad Request for invalid ID, 404 Not Found if no admin

---

### 7. Update Admin

* **URL**: `PUT /api/admins/:id`
* **Auth**: Bearer
* **Path Parameters**:

  * `id`: Admin UUID
* **Request Body** (JSON): *(all fields optional)*

  ```json
  {
    "username": "new_username",
    "email": "new@example.com",
    "password": "NewPass123",
    "phone": "9123456780",
    "role": "Support Team"
  }
  ```
* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "message": "Admin updated successfully",
    "admin": {
      "id": "uuid-v4-id",
      "username": "new_username",
      "email": "new@example.com",
      "phone": "9123456780",
      "role": "Support Team",
      "updatedAt": "2025-06-20T08:45:00.000Z"
    }
  }
  ```
* **Error**: 404 Not Found, 500 Internal Server Error

---

### 8. Deactivate (Soft Delete) Admin

* **URL**: `DELETE /api/admins/:id`
* **Auth**: Bearer
* **Success Response** (200 OK):

  ```json
  { "success": true, "message": "Admin deactivated successfully" }
  ```
* **Error**:

  * 404 Not Found: `{ "success": false, "message": "Admin not found" }`
  * 400 Bad Request: `{ "success": false, "message": "Admin already deactivated" }`

---

### 9. Restore (Activate) Admin

* **URL**: `PATCH /api/admins/restore/:id`
* **Auth**: Bearer
* **Success Response** (200 OK):

  ```json
  { "success": true, "message": "Admin restored successfully" }
  ```
* **Error**:

  * 404 Not Found: `{ "success": false, "message": "Admin not found" }`
  * 400 Bad Request: `{ "success": false, "message": "Admin already active" }`

---

> **Note**: All timestamps are in ISO 8601 format (UTC).

*End of Admin User API Documentation.*



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