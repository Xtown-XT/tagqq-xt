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
  "identifier": "johndoe@example.com",
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

