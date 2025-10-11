# Delivery Address API Documentation

**Base URL:**
`http://192.168.1.5:3000/api/v1/onscan/enduser`

---

##  Table of Contents

1. [Create Delivery Address](#1-create-delivery-address)
2. [Get All Delivery Addresses](#2-get-all-delivery-addresses)
3. [Get Delivery Address by ID](#3-get-delivery-address-by-id)
4. [Update Delivery Address](#4-update-delivery-address)
5. [Delete Delivery Address (Soft Delete)](#5-delete-delivery-address-soft-delete)
6. [Restore Delivery Address](#6-restore-delivery-address)

---

## 1. Create Delivery Address

**Endpoint:** `POST /delivery-address`
**Requires Auth:** Yes
**Validation:** Yes

### Request Body

```json
{
  "address1": "123, Green Avenue",
  "address2": "Near City Park",
  "district": "Chennai",
  "state": "Tamil Nadu",
  "country": "India",
  "pincode": 600001,
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 4,
    "address1": "green Avenue",
    "address2": "Near City Park",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "country": "India",
    "pincode": 600001,
    "user_id": "1a1dd41b-d884-4ff2-8dad-4c4a92c7de30",
    "createdBy": "1a1dd41b-d884-4ff2-8dad-4c4a92c7de30",
    "is_active": true,
    "updatedAt": "2025-06-17T12:37:24.334Z",
    "createdAt": "2025-06-17T12:37:24.334Z"
  }
}
```

---

## 2. Get All Delivery Addresses

**Endpoint:** `GET /delivery-address`
**Requires Auth:** Yes

### Query Parameters (Optional)

| Param      | Type    | Description                  |
| ---------- | ------- | ---------------------------- |
| user_id    | UUID    | Filter by user ID            |
| state      | string  | Filter by state              |
| district   | string  | Filter by district           |
| country    | string  | Filter by country            |
| pincode    | number  | Filter by pincode            |
| is_active  | boolean | Filter by active status      |
| page       | number  | Page number for pagination   |
| limit      | number  | Limit of records per page    |
| order      | string  | Sort order (`ASC` or `DESC`) |

### Example Request

```
GET /delivery-address?user_id=...&state=Tamil%20Nadu&district=Chennai&is_active=true&page=1&limit=10&order=DESC
```

### Response

```json
{
  "success": true,
  "total": 2,
  "pages": 1,
  "currentPage": 1,
  "docs": [
    {
      "id": 1,
      "user_id": "...",
      "address1": "123, Green Avenue",
      "state": "Tamil Nadu",
      ...
    },
    {
        ...
    }
  ]
}
```

---

## 3. Get Delivery Address by ID

**Endpoint:** `GET /delivery-address/:id`
**Requires Auth:** Yes

### Response

```json
{
  "success": true,
  "data": {
    "id": 2,
    "user_id": "1a1dd41b-d884-4ff2-8dad-4c4a92c7de30",
    "address1": "123, Green Avenue",
    "address2": "Near City Park",
    "district": "chennai",
    "state": "Tamil Nadu",
    "country": "India",
    "pincode": 600001,
    "is_active": true
  }
}
```

---

## 4. Update Delivery Address

**Endpoint:** `PUT /delivery-address/:id`
**Requires Auth:** Yes

### Request Body

```json
{
  "address1": "456, Blue Avenue",
  "district": "Coimbatore",
  "updatedBy": "1a1dd41b-d884-4ff2-8dad-4c4a92c7de30"
}
```

### Response

```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "id": 1,
    "address1": "456, Blue Avenue",
    ...
  }
}
```

---

## 5. Delete Delivery Address (Soft Delete)

**Endpoint:** `DELETE /delivery-address/:id`
**Requires Auth:** Yes

### Response

```json
{
  "success": true,
  "message": "Address soft deleted"
}
```

### Response if already deactivated

```json
{
  "success": false,
  "message": "Address already deleted or not found"
}
```

### If already active

---

## 6. Restore Delivery Address

**Endpoint:** `PATCH /delivery-address/restore/:id`
**Requires Auth:** Yes

### Response

```json
{
  "success": true,
  "message": "Address restored successfully"
}
```

### Response if already active
```json
{
  "success": false,
  "message": "Address not found or already active"
}
```


---

##  Authorization Header

```http
Authorization: Bearer <access_token>
```

---

##  Token Expiry

| Token Type    | Expiry  |
| ------------- | ------- |
| Access Token  | 2 hours |
| Refresh Token | 7 days  |
