**SMTP Email Service API Documentation** 

---

#  SMTP Email Service API Documentation

This document describes the HTTP endpoints, request payloads, and response examples for the SMTP Email Service module. All routes are prefixed with `/api/v1/onscan/thridpartyapi/smtp`.

---

## SMTP Email Endpoints

### 1. Send OTP

* **URL**: `POST /smtp/send-otp`

* **Auth**: Public

* **Request Body** (JSON):

  ```json
  {
    "email": "user@example.com"
  }
  ```

* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "message": "OTP Sent Successfully",
    "data": {
      "encryptedOtp": "9d87a7f3f63a..."
    }
  }
  ```

* **Error Responses**:

  * 400 Bad Request: `{ "success": false, "error": "Email is required" }`
  * 404 Not Found: `{ "success": false, "error": "User with email not found" }`
  * 409 Conflict: `{ "success": false, "error": "User is already verified" }`
  * 500 Internal Server Error

---

### 2. Send Greeting Email

* **URL**: `POST /smtp/send-greeting`

* **Auth**: Public

* **Request Body** (JSON):

  ```json
  {
    "email": "user@example.com"
  }
  ```

* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "message": "Greeting Sent Successfully",
    "data": {
      "message": "Greeting email sent to verified user"
    }
  }
  ```

* **Error Responses**:

  * 400 Bad Request: `{ "success": false, "error": "Email is required" }`
  * 500 Internal Server Error

---

### 3. Order Confirmation Alert

* **URL**: `POST /smtp/alert/order-confirmed`

* **Auth**: Public

* **Request Body** (JSON):

  ```json
  {
    "email": "user@example.com"
  }
  ```

* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "message": "Order Confirmation Email Sent",
    "data": {
      "message": "Alert email sent to user@example.com"
    }
  }
  ```

---

### 4. Payment Success Alert

* **URL**: `POST /smtp/alert/payment-success`

* **Auth**: Public

* **Request Body** (JSON):

  ```json
  {
    "email": "user@example.com"
  }
  ```

* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "message": "Payment Success Email Sent",
    "data": {
      "message": "Alert email sent to user@example.com"
    }
  }
  ```

---

### 5. Payment Failed Alert

* **URL**: `POST /smtp/alert/payment-failed`

* **Auth**: Public

* **Request Body** (JSON):

  ```json
  {
    "email": "user@example.com"
  }
  ```

* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "message": "Payment Failure Email Sent",
    "data": {
      "message": "Alert email sent to user@example.com"
    }
  }
  ```

---

### 6. Custom Alert Email

* **URL**: `POST /smtp/alert/custom`

* **Auth**: Public

* **Request Body** (JSON):

  ```json
  {
    "email": "user@example.com",
    "title": "Important Update",
    "message": "Your account has been updated successfully."
  }
  ```

* **Success Response** (200 OK):

  ```json
  {
    "success": true,
    "message": "Custom Alert Email Sent",
    "data": {
      "message": "Alert email sent to user@example.com"
    }
  }
  ```

* **Error Responses**:

  * 400 Bad Request: `{ "success": false, "error": "Email, title, and message are required" }`
  * 500 Internal Server Error

---

##  Additional Notes

### Email Transporter Configuration (Nodemailer)

```js
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

---

### Recommended Headers

```http
Content-Type: application/json
```

---



