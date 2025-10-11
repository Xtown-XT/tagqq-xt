**Base URL**: `/api/v1/onscan/thirdpartyapi`

---

## Authentication

All endpoints under this base URL require JWT-based authentication. Include the following header in every request:

```
Authorization: Bearer <token>
```

The `authenticate` middleware enforces roles: `end_user`, `admin`, or `user_agent`.

---

## Common Request Headers

| Header        | Value                | Description                         |
| ------------- | -------------------- | ----------------------------------- |
| Content-Type  | `application/json`   | Indicates JSON request body format. |
| Authorization | `Bearer <jwt_token>` | JWT token for authentication.       |

---

## Error Response Format

```json
{
  "success": false,
  "message": "<Error message>",
  "statusCode": <HTTP status code>,
  "data": null
}
```

---

## Endpoints

### 1. Create Razorpay Order

* **URL**: `/razorpay/order`
* **Method**: `POST`
* **Roles**: `end_user`, `admin`, `user_agent`

#### Request Body

```json
{
  "amount":  number,           // positive integer (in paise)
  "currency": "INR",         // optional, default "INR"
  "user_id": "<uuid>",       // optional, overrides req.user.id
  "user_type": "USER|AGENT|ADMIN",
  "agent_id": "<uuid>",      // optional
  "payment_method": "CARD|UPI|NETBANKING|WALLET"
}
```

#### Success Response

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "razorpayOrder": { /* Razorpay order object */ },
    "payment": { /* Saved payment record */ }
  }
}
```

---

### 2. Verify Razorpay Payment

* **URL**: `/razorpay/verify`
* **Method**: `POST`
* **Roles**: `end_user`, `admin`, `user_agent`

#### Request Body

```json
{
  "razorpay_order_id": "<string>",
  "razorpay_payment_id": "<string>",
  "razorpay_signature": "<string>",
  "delivery_address_id": number  // positive integer
}
```

#### Success Response

```json
{
  "success": true,
  "message": "Payment verified for Payment ID <id>",
  "data": {
    "payment": { /* Updated payment record */ },
    "publicStatus": { /* Updated public URL status */ },
    "ordertrack": { /* Created order tracking record */ }
  }
}
```

---

### 3. Get Payment by ID

* **URL**: `/:id`
* **Method**: `GET`
* **Roles**: `end_user`, `admin`, `user_agent`

#### Path Parameters

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| `id`      | `UUID` | The Razorpay order ID (string) |

#### Success Response

```json
{
  "success": true,
  "message": "Payment fetched successfully",
  "data": { /* Payment record */ }
}
```

---

### 4. Get All Payments

* **URL**: `/`
* **Method**: `GET`
* **Roles**: `end_user`, `admin`, `user_agent`

#### Query Parameters

| Parameter   | Type         | Description (default)                               |
| ----------- | ------------ | --------------------------------------------------- |
| `limit`     | integer      | Page size (10)                                      |
| `page`      | integer      | Page number (1)                                     |
| `search`    | string       | Filter by receipt/order/payment IDs (partial match) |
| `user_id`   | UUID string  | Filter by user ID                                   |
| `agent_id`  | UUID string  | Filter by agent ID                                  |
| `status`    | string       | One of `CREATED`, `CAPTURED`, etc.                  |
| `user_type` | string       | One of `USER`, `AGENT`                              |
| `orderBy`   | string       | Field to sort by (`createdAt`)                      |
| `orderDir`  | `asc`/`desc` | Sort direction (`DESC`)                             |

#### Success Response

```json
{
  "success": true,
  "message": "All payments fetched successfully",
  "data": {
    "data": [ /* Array of payments */ ],
    "total": number,
    "page": number,
    "totalPages": number
  }
}
```

---

### 5. Create UPI Payment (QR)

* **URL**: `/upi`
* **Method**: `POST`
* **Roles**: `end_user`, `admin`, `user_agent`

#### Request Body

```json
{
  "customerDetails": { "id": "<uuid>" },
  "amount": number,  // positive integer (in paise)
  "agentDetails": {  
    "id": "<uuid>",
    "name": "<string>"
  }
}
```

#### Success Response

```json
Status: 201 Created
{
  "message": "UPI payment created",
  "upiPayment": { /* Razorpay QR code object */ }
}
```

---

### 6. Close UPI Payment (QR)

* **URL**: `/upi/:upiPaymentId/close`
* **Method**: `POST`
* **Roles**: `end_user`, `admin`, `user_agent`

#### Path Parameters

| Parameter      | Type   | Description              |
| -------------- | ------ | ------------------------ |
| `upiPaymentId` | `UUID` | The QR code (receipt) ID |

#### Success Response

```json
{
  "message": "UPI payment closed",
  "result": { /* Closed QR code object */ }
}
```

---

### 7. Fetch Single UPI Payment

* **URL**: `/upi/:upiPaymentId`
* **Method**: `GET`
* **Roles**: `end_user`, `admin`, `user_agent`

#### Path Parameters

| Parameter      | Type   | Description              |
| -------------- | ------ | ------------------------ |
| `upiPaymentId` | `UUID` | The QR code (receipt) ID |

#### Success Response

```json
{ /* QR code/payment object */ }
```

---

### 8. Fetch UPI Payments by Customer

* **URL**: `/upi/customer/:customerId`
* **Method**: `GET`
* **Roles**: `end_user`, `admin`, `user_agent`

#### Path Parameters

| Parameter    | Type   | Description      |
| ------------ | ------ | ---------------- |
| `customerId` | `UUID` | Customer user ID |

#### Success Response

```json
[ /* Array of QR code objects */ ]
```

---

### 9. Fetch UPI Payments by Payment ID

* **URL**: `/upi/payment/:paymentId`
* **Method**: `GET`
* **Roles**: `end_user`, `admin`, `user_agent`

#### Path Parameters

| Parameter   | Type   | Description                |
| ----------- | ------ | -------------------------- |
| `paymentId` | `UUID` | Razorpay payment ID filter |

#### Success Response

```json
[ /* Array of QR code objects matching payment_id */ ]
```

---

**Note**: All date fields in responses are in ISO 8601 format.
