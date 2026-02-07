# API Documentation

## Authentication

### POST /api/auth/login
Login with phone and verification code.

**Request:**
```json
{
  "phone": "13800138000",
  "code": "000000"
}
```

**Response:**
```json
{
  "data": {
    "user": { "id": "...", "phone": "..." },
    "token": "..."
  }
}
```

## Tasks

### POST /api/tasks
Generate daily task.

### GET /api/tasks/today
Get today's task.

### POST /api/tasks/:id/complete
Complete a task.

## Scripts

### POST /api/scripts/generate
Generate script with AI.

### POST /api/scripts/adapt
Adapt script for multiple platforms.

## Hot Topics

### GET /api/hot-topics
Get trending topics.

### POST /api/hot-topics/generate
Generate topic from hot trend.
