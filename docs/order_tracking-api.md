# Order Tracking API Documentation

**Base URL:** `https://api.example.com/api/v1/onscan/enduser/order_tracking`

## Table of Contents

* [POST /order_tracking](#post-order-tracking)
* [GET /order_tracking](#get-order-tracking)
* [GET /order_tracking/{id}](#get-order-tracking-id)
* [PUT /order_tracking/{id}](#put-order-tracking-id)
* [DELETE /order_tracking/{id}](#delete-order-tracking-id)
* [DELETE /order_tracking (bulk)](#delete-order-tracking-bulk)
* [PATCH /order_tracking/{id}/restore](#patch-order-tracking-id-restore)
* [PATCH /order_tracking/restore (bulk)](#patch-order-tracking-restore-bulk)  


<a id="post-order-tracking"></a>

## POST /api/v1/onscan/enduser/order\_tracking

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
```

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

## GET /api/v1/onscan/enduser/order\_tracking

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

## GET /api/v1/onscan/enduser/order\_tracking/{id}

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

## PUT /api/v1/onscan/enduser/order\_tracking/{id}

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

## DELETE /api/v1/onscan/enduser/order\_tracking/{id}

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

## DELETE /api/v1/onscan/enduser/order\_tracking (bulk)

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

## PATCH /api/v1/onscan/enduser/order\_tracking/{id}/restore

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

## PATCH /api/v1/onscan/enduser/order\_tracking/restore (bulk)

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
