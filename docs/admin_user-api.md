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
