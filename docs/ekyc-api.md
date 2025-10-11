**QuickEKYC Frontend API Documentation**

This document provides details on the QuickEKYC endpoints available for frontend integration, including request formats, required headers, and example responses.

---
```
base URL : /api/v1/onscan/enduser/rc-full
```
## 1. Generate Aadhaar OTP (v2)

* **Endpoint**: `POST /api/ekyc/generate-otp`
* **Description**: Initiates an OTP generation request for the provided Aadhaar number.
* **Authentication**: JWT bearer token required in `Authorization` header.

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "id_number": "<12-digit Aadhaar number>"
}
```

### Successful Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "status": "success",
    "request_id": 12345
  }
}
```

### Error Responses

* **400 Bad Request** - Missing `id_number` or invalid format.
* **409 Conflict** - Aadhaar number already exists in records.

```json
{
  "success": false,
  "message": "Aadhaar number 123456789012 already exists in our records",
  "status": 409
}
```

---

## 2. Submit Aadhaar OTP (v2)

* **Endpoint**: `POST /api/ekyc/submit-otp`
* **Description**: Submits the OTP received via SMS for verification and, upon success, stores the eKYC data in the user’s profile.
* **Authentication**: JWT bearer token required.

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "request_id": <request_id from generate-otp>,
  "otp": "<6-digit OTP>",
  "id_number": "<12-digit Aadhaar number>"
}
```

### Successful Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "status": "success",
    "data": {
      "name": "John Doe",
      "dob": "1990-05-20",
      "gender": "M",
      // ... other eKYC fields ...
    }
  }
}
```

### Error Responses

* **400 Bad Request** - Missing parameters (`request_id`, `otp`, `id_number`).
* **401 Unauthorized** - Invalid or missing JWT.
* **500 Internal Server Error** - External API failure or service error.

```json
{
  "success": false,
  "message": "QuickEKYC submit-otp failed: Invalid OTP",
  "status": 422
}
```

---

## 3. Fetch Full RC Details

* **Endpoint**: `POST /api/ekyc/rc-full`
* **Description**: Retrieves full vehicle registration certificate (RC) data for a given Aadhaar number. If data is already stored, it returns cached data without calling the external API.
* **Authentication**: JWT bearer token required.

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "id_number": "<12-digit Aadhaar number>"
}
```

### Successful Response (`200 OK`)

* **Case A: Data Already Exists**

```json
{
  "success": true,
  "data": {
    "alreadyExists": true,
    "data": {
      // previously stored RC details...  
    },
    "message": "RC data already exists in the system. No API call was made."
  }
}
```

* **Case B: New Data Fetched**

```json
{
  "success": true,
  "data": {
    "alreadyExists": false,
    "data": {
      "vehicle_number": "MH12DE1433",
      "owner_name": "Jane Doe",
      // ... other RC fields ...
    },
    "message": "New RC data fetched and stored."
  }
}
```

### Error Responses

* **400 Bad Request** - Missing `id_number`.
* **500 Internal Server Error** - Failure to obtain API key or external API error.

```json
{
  "success": false,
  "message": "Unable to obtain API key for fetchRcFull",
  "status": 500
}
```

---

## 4. Fetch Driving License Details

* **Endpoint**: `POST /api/ekyc/license`
* **Description**: Retrieves driving license details based on Aadhaar number and date of birth. Data is stored upon successful fetch.
* **Authentication**: JWT bearer token required.

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "id_number": "<12-digit Aadhaar number>",
  "dob": "YYYY-MM-DD"
}
```

### Successful Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "license_number": "DL0420150000001",
    "name": "John Smith",
    "issue_date": "2015-10-15",
    // ... other license fields ...
  }
}
```

### Error Responses

* **400 Bad Request** - Missing `id_number` or `dob`.
* **401 Unauthorized** - Invalid or missing JWT.
* **500 Internal Server Error** - External API or database error.

```json
{
  "success": false,
  "message": "key, id_number, and dob are required for fetchLicense",
  "status": 400
}
```

---

### Common Error Format

All error responses use the following JSON structure:

```json
{
  "success": false,
  "message": "<error message>",
  "status": <HTTP status code>
}
```

---

**Notes for Frontend Implementation**

1. Include the JWT token in the `Authorization` header for all requests.
2. Validate form inputs (e.g., 12-digit Aadhaar, proper date format) before making API calls.
3. Display both success messages and error messages to the user based on the `success` flag and `message` field in the response.
4. For `rc-full`, check the `alreadyExists` flag to adjust UI flow (e.g., avoid redundant loading indicators if data is cached).

---

*End of QuickEKYC Frontend API Documentation.*
