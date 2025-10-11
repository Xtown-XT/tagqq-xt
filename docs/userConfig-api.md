**API Documentation (MD format)** 
---

#  UserConfig API Documentation

**Base Route**: `/api/v1/onscan/enduser`

---

##  Model: UserConfig

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `id`            | UUID    | Primary key                      |
| `user_id`       | UUID    | References `Users(id)`           |
| `has_profile`   | Boolean | Indicates if profile exists      |
| `has_vehicle`   | Boolean | Indicates if vehicle exists      |
| `has_user_info` | Boolean | Indicates if user info is set    |
| `is_active`     | Boolean | Soft delete flag (default: true) |
| `createdAt`     | Date    | Timestamp (auto)                 |
| `updatedAt`     | Date    | Timestamp (auto)                 |

---

##  POST `/`

**Create UserConfig**

### Request Body:

```json
{
  "user_id": "b93ad9f7-c271-4ff9-a464-67b4e4ab5ab8",
  "has_profile": true,
  "has_vehicle": false,
  "has_user_info": true
}
```

### Success Response:

```json
{
  "success": true,
  "message": "UserConfig created successfully",
  "data": {
    "id": "UUID",
    "user_id": "UUID",
    "has_profile": true,
    "has_vehicle": false,
    "has_user_info": true,
    "is_active": true,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

##  GET `/`

**Fetch UserConfigs (Paginated & Filtered)**

### Query Params:

| Param     | Type   | Description                                   |
| --------- | ------ | --------------------------------------------- |
| `filter`  | string | `all` \| `profile` \| `vehicle` \| `userinfo` |
| `page`    | int    | Page number                                   |
| `limit`   | int    | Results per page                              |
| `orderBy` | string | `asc` \| `desc` (createdAt sort)              |
| `userId`  | UUID   | Optional specific user filter                 |

### Success Response:

```json
{
  "success": true,
  "message": "UserConfigs retrieved successfully",
  "data": {
    "total": 25,
    "totalPages": 3,
    "currentPage": 1,
    "userConfigs": [
      {
        "id": "UUID",
        "user_id": "UUID",
        "has_profile": true,
        "has_vehicle": false,
        "has_user_info": true,
        "is_active": true,
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      },
      ...
    ]
  }
}
```

---

##  GET `/:id`

**Fetch Single UserConfig by ID**

### URL Params:

* `id`: UUID of the UserConfig

### Success Response:

```json
{
  "success": true,
  "message": "UserConfig retrieved successfully",
  "data": {
    "userConfig": {
      "id": "UUID",
      "user_id": "UUID",
      "has_profile": true,
      "has_vehicle": false,
      "has_user_info": true,
      "is_active": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
}
```

### Error Response:

```json
{
  "success": false,
  "error": "UserConfig not found"
}
```

---

##  PUT `/:id`

**Update UserConfig by ID**

### Request Body:

```json
{
  "has_vehicle": true,
  "has_user_info": false
}
```

### Success Response:

```json
{
  "success": true,
  "message": "UserConfig updated successfully",
  "data": {
    "userConfig": {
      "id": "UUID",
      "user_id": "UUID",
      "has_profile": true,
      "has_vehicle": true,
      "has_user_info": false,
      "is_active": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
}
```

---

##  PATCH `/:id/deactivate`

**Soft Delete UserConfig**

### Success Response:

```json
{
  "success": true,
  "message": "UserConfig deactivated successfully"
}
```

### Already Deactivated Response:

```json
{
  "success": false,
  "error": "UserConfig is already deactivated"
}
```

---

##  PATCH `/:id/activate`

**Restore a Soft Deleted UserConfig**

### Success Response:

```json
{
  "success": true,
  "message": "UserConfig restored successfully"
}
```

### Already Active Response:

```json
{
  "success": false,
  "error": "UserConfig is already active"
}
```

---

## DELETE `/:id`

**Hard Delete UserConfig**

### Success Response:

```json
{
  "success": true,
  "message": "UserConfig deleted permanently",
  "data": {
    "message": "UserConfig deleted permanently"
  }
}
```

---

##  Error Handling Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

---

Let me know if you'd like this exported as a `.md` file.
