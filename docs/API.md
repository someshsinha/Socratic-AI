# Socratic AI — REST API Specification

This document details all RESTful endpoints provided by the Socratic AI backend service, including authentication requirements, request payloads, response schemas, and error codes.

---

## Base URL & Headers

- **Local Development Base URL**: `http://localhost:3000/api`
- **Production Base URL**: `https://<your-api-domain>/api`

### Common Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <Auth0_JWT_Access_Token>  # (Required for protected endpoints)
```

---

## 1. Courses Endpoints

### 1.1. Generate Course Curriculum Outline
Creates a new course syllabus with sequenced modules and lessons using the Gemini AI curriculum synthesis engine.

- **URL**: `/api/courses`
- **Method**: `POST`
- **Authentication**: Optional (Guest or Authenticated)
- **Request Body**:
```json
{
  "topic": "Distributed Systems"
}
```

- **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "data": {
    "_id": "66bcf1234a9b8c0012345678",
    "topic": "Distributed Systems",
    "title": "Foundations of Distributed Systems & Consensus",
    "description": "A comprehensive, first-principles exploration of distributed computing, replication models, fault tolerance, and consensus algorithms.",
    "category": "Computer Science",
    "level": "Advanced",
    "userSub": "auth0|64a1b2c3d4e5f6g7h8i9j0",
    "modules": [
      {
        "_id": "66bcf1234a9b8c0012345679",
        "course": "66bcf1234a9b8c0012345678",
        "title": "Foundations & System Models",
        "order": 1,
        "lessons": [
          {
            "_id": "66bcf1234a9b8c0012345680",
            "title": "What is a Distributed System?",
            "order": 1,
            "readingTime": 8
          },
          {
            "_id": "66bcf1234a9b8c0012345681",
            "title": "Processes, Networking & RPCs",
            "order": 2,
            "readingTime": 12
          }
        ]
      }
    ],
    "createdAt": "2026-08-15T00:00:00.000Z"
  }
}
```

---

### 1.2. Get User's Courses
Retrieves all courses created by or associated with the currently authenticated user.

- **URL**: `/api/courses/user-courses`
- **Method**: `GET`
- **Authentication**: **Required** (`Bearer <JWT>`)

- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "66bcf1234a9b8c0012345678",
      "topic": "Distributed Systems",
      "title": "Foundations of Distributed Systems & Consensus",
      "category": "Computer Science",
      "modules": [ ... ],
      "createdAt": "2026-08-15T00:00:00.000Z"
    }
  ]
}
```

---

### 1.3. Get Course by ID
Fetches full course details including populated modules and nested lesson outlines.

- **URL**: `/api/courses/:id`
- **Method**: `GET`
- **Authentication**: Public

- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "_id": "66bcf1234a9b8c0012345678",
    "topic": "Distributed Systems",
    "title": "Foundations of Distributed Systems & Consensus",
    "description": "...",
    "modules": [ ... ]
  }
}
```

---

### 1.4. Delete Course
Deletes a course and cascades deletion to all associated modules and lessons.

- **URL**: `/api/courses/:id`
- **Method**: `DELETE`
- **Authentication**: **Required** (`Bearer <JWT>`)

- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Course and associated modules successfully deleted"
}
```

---

## 2. Lessons Endpoints

### 2.1. Get Lesson Content by ID
Retrieves full lesson content. If the lesson has not yet been generated, triggers on-demand AI lesson synthesis and video discovery automatically.

- **URL**: `/api/lessons/:id`
- **Method**: `GET`
- **Authentication**: Public

- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "_id": "66bcf1234a9b8c0012345680",
    "title": "What is a Distributed System?",
    "order": 1,
    "readingTime": 10,
    "objectives": [
      "Define the fundamental characteristics of distributed computing",
      "Explain the CAP theorem and trade-offs in network partitioning",
      "Identify failure modes in asynchronous networks"
    ],
    "content": [
      {
        "type": "heading",
        "text": "1. Defining Distributed Systems from First Principles"
      },
      {
        "type": "paragraph",
        "text": "A distributed system is a collection of autonomous computing entities that communicate over a network..."
      },
      {
        "type": "definition",
        "title": "Asynchronous Network Model",
        "text": "A system model where messages may be arbitrarily delayed, reordered, or lost without a global physical clock."
      },
      {
        "type": "code",
        "language": "c",
        "text": "#include <stdio.h>\n#include <unistd.h>\n\nint main() {\n    printf(\"Distributed Node Initialized\\n\");\n    return 0;\n}"
      },
      {
        "type": "video",
        "query": "Distributed Systems Basics Introduction Core Functions"
      },
      {
        "type": "mcq",
        "question": "Which property describes a system where every non-failing node eventually agrees on a value?",
        "options": [
          "Linearizability",
          "Consensus",
          "Eventual Consistency",
          "Partition Tolerance"
        ],
        "answer": 1,
        "explanation": "Consensus requires all non-faulty processes to agree on the same value."
      }
    ]
  }
}
```

---

## 3. Supplementary Services

### 3.1. YouTube Video Metadata Search
Queries supplementary YouTube lecture video IDs matching a lesson topic.

- **URL**: `/api/youtube/search`
- **Method**: `GET`
- **Authentication**: Public
- **Query Parameters**:
  - `q` (string, required): Search query keywords (e.g. `q=Distributed+Systems+Lamport+Clocks`)

- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "videoId": "Y6Ev8GKD3Hc",
  "title": "MIT 6.824: Distributed Systems - Lecture 1",
  "channelTitle": "MIT OpenCourseWare"
}
```

---

### 3.2. Health & Uptime Check
Monitors service availability and database connectivity.

- **URL**: `/api/health`
- **Method**: `GET`
- **Authentication**: Public

- **Success Response (`200 OK`)**:
```json
{
  "status": "healthy",
  "uptime": 3642.18,
  "timestamp": "2026-08-15T00:00:00.000Z",
  "database": "connected",
  "aiEngine": "ready"
}
```

---

## 4. Standard Error Response Format

All error responses return structured JSON with uniform error keys:

```json
{
  "success": false,
  "error": "UnauthorizedError",
  "message": "Missing or invalid Bearer authentication token."
}
```

### Common HTTP Status Codes

| Code | Status | Meaning |
|---|---|---|
| `200` | OK | Request succeeded |
| `201` | Created | Resource successfully generated and persisted |
| `400` | Bad Request | Validation error or missing required body parameters |
| `401` | Unauthorized | Missing or expired Auth0 JWT Bearer token |
| `404` | Not Found | Requested course, module, or lesson does not exist |
| `429` | Too Many Requests | Upstream API quota limit exceeded (YouTube / Gemini) |
| `500` | Internal Server Error | Unhandled server exception (logged in `ERROR_LOG.md`) |
