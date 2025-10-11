# Customer Document API Documentation

**Base URL:**
`http://192.168.1.6:3000/api/v1/onscan/enduser`

## Table of Contents

1. [Upload Document](#1-upload-document)
2. [Get All Documents](#2-get-all-documents)
3. [Get Document by ID](#3-get-document-by-id)
4. [Update Document](#4-update-document)
5. [Soft Delete Document](#5-soft-delete-document)
6. [Restore Document](#6-restore-document)

---

## 1. Upload Document

**Endpoint:** `POST /docs/`
**Requires Auth:** Yes
**Validation:** Yes (`createCustomerDocSchema`)
**Content Type:** `multipart/form-data`

###  Sample Request

```
POST /docs/
Content-Type: multipart/form-data
Authorization: Bearer your_access_token_here
```
### Form Data

| Field    | Type   | Required |Description                                                                   | --------------------------------------------------------------------------------------------------------------|
| user_id  | uuid   | yes      | foreignkey- user table                                                       |
| file     | File   | yes      | The document file(Max2MB)                                                    |
| doc_type | String | yes      | enum     (`license`, `insurance`, `registration`, `idproof`,`others`)        |
| doc_name | String | Optional | Document name (max 50 chars)                                                 |
| remarks  | String | Optional | Additional info (max 200 chars)                                              |

### Response

```json
{
  "success": true,
  "data": {
    "id": "doc_id",
    "user_id": "user_id",
    "doc_type": "license",
    "doc_name": "Driver License",
    "doc_blob": "base64_string_here",
    "mime_type": "application/pdf",
    "file_size": 0.25,
    "remarks": "Uploaded front side",
    "is_active": true,
    "createdBy": "1a1dd41b-d884-4ff2-8dad-4c4a92c7de30",
    "updatedAt": "2025-06-16T09:59:02.685Z",
    "createdAt": "2025-06-16T09:59:02.685Z"
  }
}
```
---

## 2. Get All Documents

**Endpoint:** `GET /docs/`
**Requires Auth:** Yes

### Query Params

| Param      | Type   | Description                               |
| ---------- | ------ | ----------------------------------------- |
| page       | Int    | Page number (default: 1)                  |
| limit      | Int    | Number per page (default: 10)             |
| order      | String | `ASC` or `DESC` (default: DESC)           |
| user_id    | UUID   | Filter by user ID                         |
| doc_name   | String | Search by document name (partial allowed) |
| doc_type   | String | Filter by doc type                        |
| mime_type  | String | Filter by file type (e.g. `image/png`)    |
| file_size  | Float  | Filter max size in MB                     |
| is_active  | Bool   | Filter by status (`true` or `false`)      |

### Sample Request

```
GET /docs/?is_active=true&page=1&limit=5&order=DESC&doc_type=license
   
Authorization: Bearer your_access_token_here
```

### Response

```json
{
  "success": true,
  "total": 3,
  "pages": 1,
  "currentPage": 1,
  "docs": [
    {
      "id": "1",
      "user_id": "uuid",
      "doc_type": "license",
      "doc_name": "Driver License",
      "doc_blob": "base64_string",
      "mime_type": "image/png",
      "file_size": 0.56,
      "remarks": "Scanned copy",
      "is_active": true
    }
  ]
}
    
```

---

## 3. Get Document by ID

**Endpoint:** `GET /docs/:id`
**Requires Auth:** Yes

### Sample Request

```
GET /docs/5
Authorization: Bearer your_access_token_here
```

###  Response

```json
{
  "success": true,
  "data": {
    "id": "2",
    "user_id": "uuid",
    "doc_type": "insurance",
    "doc_name": "Policy Document",
    "doc_blob": "base64_encoded_data",
    "mime_type": "application/pdf",
    "file_size": 1.2,
    "remarks": "Full document",
    "is_active": true
  }
}
```

---

## 4. Update Document

**Endpoint:** `PUT /docs/:id`
**Requires Auth:** Yes
**Validation:** Yes (`updateCustomerDocSchema`)
**Content Type:** `multipart/form-data`

### Optional Fields

| Field     | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| file      | File   | New file (if updating)          |
| doc_type  | String | Type of document- enum          |
| doc_name  | String | Document name (max 50 chars)    |
| remarks   | String | Additional info (max 200 chars) |

###  Sample Request

```
PUT /docs/5
Authorization: Bearer your_access_token_here
```

### Response

```json
{
  "success": true,
  "message": "Document updated successfully",
  "data": {
    "id": "doc_id",
    "user_id": "user_id",
    "doc_type": "insurance",
    "doc_name": "Updated Policy",
    "doc_blob": "updated_base64_data",
    "mime_type": "application/pdf",
    "file_size": 1.0,
    "remarks": "Updated with latest version",
    "is_active": true
  }
}
```
---

## 5. Soft Delete Document

**Endpoint:** `DELETE /docs/:id`
**Requires Auth:**  Yes

### Sample Request

```
DELETE /docs/4
Authorization: Bearer your_access_token_here
```

### Response

```json
{
  "success": true,
  "message": "Document soft deleted"
}
```

###  Already Deleted

```json
{
  "success": false,
  "message": "Document already deleted or not found"
}
```
---

## 6. Restore Document

**Endpoint:** `PATCH /docs/restore/:id`
**Requires Auth:**  Yes

###  Sample Request

```
PATCH /docs/restore/4
Authorization: Bearer your_access_token_here
```

###  Response

```json
{
  "success": true,
  "message": "Document restored"
}
```
### Already Active

```json
{
  "success": false,
  "message": "Document not found or already active"
}
```

## Authorization Header Format

```
Authorization: Bearer your_access_token_here
```