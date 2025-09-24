# PinkyTrust Normal User API - Postman Collection

## 📱 Overview
This Postman collection covers all API endpoints available to normal users of the PinkyTrust Women's Health application. It includes authentication, health profile management, symptom tracking, appointment booking, and notifications.

## 🔐 Authentication Setup

### Base URL
```
http://localhost:5001
```

### Environment Variables
Create these variables in your Postman environment:
- `base_url`: `http://localhost:5001`
- `auth_token`: (will be set automatically after login)
- `user_id`: (will be set automatically after login)

## 📋 Collection Structure

### 1. Authentication Endpoints

#### 1.1 Register New User
```
POST {{base_url}}/api/auth/register
```
**Body (JSON):**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePass123!",
  "role": "normal_user"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id_here",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "normal_user"
  }
}
```

#### 1.2 Login User
```
POST {{base_url}}/api/auth/login
```
**Body (JSON):**
```json
{
  "email": "jane.doe@example.com",
  "password": "SecurePass123!"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id_here",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "normal_user"
  }
}
```

**Post-response Script (to save token):**
```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    pm.environment.set("auth_token", responseJson.token);
    pm.environment.set("user_id", responseJson.user._id);
}
```

#### 1.3 Get Current User Profile
```
GET {{base_url}}/api/auth/me
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

### 2. Health Profile Management

#### 2.1 Get Health Profile
```
GET {{base_url}}/api/health/profile
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 2.2 Create/Update Health Profile
```
POST {{base_url}}/api/health/profile
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "lastScreeningDate": "2023-12-01",
  "familyHistory": {
    "breastCancer": true,
    "ovarianCancer": false,
    "other": "Heart disease",
    "details": "Mother had breast cancer at age 55"
  },
  "riskFactors": {
    "hasChildren": true,
    "numberOfChildren": 2,
    "ageAtFirstChild": 28,
    "breastfeedingHistory": true,
    "breastfeedingDuration": 18,
    "hormoneTherapy": false,
    "birthControl": true,
    "smokingStatus": "never",
    "alcoholConsumption": "light",
    "exerciseFrequency": "weekly",
    "weight": 65,
    "height": 165
  },
  "medicalHistory": {
    "previousBreastProblems": false,
    "breastBiopsy": false,
    "breastCancer": false,
    "menstrualHistory": {
      "ageAtFirstPeriod": 13,
      "menopauseStatus": "pre",
      "ageAtMenopause": null
    }
  },
  "preferences": {
    "reminderFrequency": "yearly",
    "language": "en",
    "contactMethod": "push",
    "privacySettings": {
      "shareDataForResearch": false,
      "allowCommunityInteraction": true
    }
  },
  "emergencyContact": {
    "name": "John Doe",
    "relationship": "spouse",
    "phone": "+1234567890"
  }
}
```

#### 2.3 Get Health Analytics
```
GET {{base_url}}/api/health/analytics
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

### 3. Symptom Tracking

#### 3.1 Log New Symptom (with Photo)
```
POST {{base_url}}/api/health/symptoms
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```
**Body (form-data):**
```
photo: [Select Image File]
symptoms: [
  {
    "type": "breast_pain",
    "location": "left_breast",
    "severity": 3,
    "description": "Sharp pain in upper left breast",
    "duration": "1_3_days",
    "frequency": "intermittent"
  }
]
notes: "Pain started after exercise yesterday"
overallMood: "worried"
painLevel: 4
menstrualCycle: {
  "dayOfCycle": 15,
  "cyclePhase": "ovulation"
}
triggers: ["exercise", "stress"]
```

#### 3.2 Log Symptom (without Photo)
```
POST {{base_url}}/api/health/symptoms
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "symptoms": [
    {
      "type": "breast_tenderness",
      "location": "both_breasts",
      "severity": 2,
      "description": "General tenderness, especially when touched",
      "duration": "1_week",
      "frequency": "constant"
    }
  ],
  "notes": "Tenderness has been consistent for the past week",
  "overallMood": "neutral",
  "painLevel": 3,
  "menstrualCycle": {
    "dayOfCycle": 7,
    "cyclePhase": "follicular"
  },
  "triggers": ["menstrual_cycle"]
}
```

#### 3.3 Get Symptom History
```
GET {{base_url}}/api/health/symptoms?page=1&limit=10
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 3.4 Get Single Symptom Log
```
GET {{base_url}}/api/health/symptoms/:symptom_id
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 3.5 Update Symptom Log
```
PUT {{base_url}}/api/health/symptoms/:symptom_id
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "notes": "Updated notes: Pain has decreased significantly",
  "overallMood": "good",
  "painLevel": 1
}
```

#### 3.6 Delete Symptom Log
```
DELETE {{base_url}}/api/health/symptoms/:symptom_id
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 3.7 Get Symptom Statistics
```
GET {{base_url}}/api/health/symptoms/stats
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

### 4. Appointment Management

#### 4.1 Book New Appointment
```
POST {{base_url}}/api/appointments
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "eventId": "event_id_here",
  "appointmentDate": "2024-02-15",
  "timeSlot": {
    "startTime": "10:00",
    "endTime": "10:30",
    "duration": 30
  },
  "appointmentType": "screening",
  "contactInfo": {
    "phone": "+1234567890",
    "email": "jane.doe@example.com",
    "preferredContact": "sms"
  },
  "personalInfo": {
    "age": 33,
    "emergencyContact": {
      "name": "John Doe",
      "phone": "+0987654321",
      "relationship": "spouse"
    }
  },
  "symptoms": {
    "hasSymptoms": true,
    "symptomList": [
      {
        "type": "breast_pain",
        "severity": 3,
        "duration": "1_week",
        "description": "Persistent pain in left breast"
      }
    ],
    "concernLevel": "medium"
  },
  "notes": {
    "userNotes": "First time booking a screening appointment"
  }
}
```

#### 4.2 Get My Appointments
```
GET {{base_url}}/api/appointments/my?status=pending&page=1&limit=10
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 4.3 Get Single Appointment
```
GET {{base_url}}/api/appointments/:appointment_id
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 4.4 Update Appointment (Reschedule)
```
PUT {{base_url}}/api/appointments/:appointment_id
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "appointmentDate": "2024-02-20",
  "timeSlot": {
    "startTime": "14:00",
    "endTime": "14:30"
  },
  "rescheduleReason": "Schedule conflict with work"
}
```

#### 4.5 Cancel Appointment
```
DELETE {{base_url}}/api/appointments/:appointment_id
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "cancellationReason": "Personal emergency"
}
```

### 5. Notifications & Reminders

#### 5.1 Get My Notifications
```
GET {{base_url}}/api/notifications?isRead=false&type=reminder&page=1&limit=10
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 5.2 Mark Notification as Read
```
PUT {{base_url}}/api/notifications/:notification_id/read
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 5.3 Create Personal Reminder
```
POST {{base_url}}/api/notifications/reminders
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "type": "self_exam",
  "title": "Monthly Breast Self-Examination",
  "message": "Don't forget to perform your monthly breast self-examination",
  "dueDate": "2024-02-01T09:00:00.000Z",
  "priority": "high",
  "category": "self_care",
  "recurring": {
    "enabled": true,
    "frequency": "monthly",
    "interval": 1
  },
  "notifications": {
    "enabled": true,
    "methods": ["push", "email"],
    "schedule": [
      {
        "timeBeforeDue": 1440,
        "method": "push"
      },
      {
        "timeBeforeDue": 60,
        "method": "email"
      }
    ]
  },
  "actionRequired": "self_exam"
}
```

#### 5.4 Get My Reminders
```
GET {{base_url}}/api/notifications/reminders?isCompleted=false&type=self_exam&page=1&limit=10
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 5.5 Update Reminder
```
PUT {{base_url}}/api/notifications/reminders/:reminder_id
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "isCompleted": true,
  "completedAt": "2024-01-15T10:30:00.000Z",
  "notes": "Self-examination completed - no concerns"
}
```

#### 5.6 Delete Reminder
```
DELETE {{base_url}}/api/notifications/reminders/:reminder_id
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

### 6. Health Events & Tips

#### 6.1 Get Available Events
```
GET {{base_url}}/api/events?status=active&page=1&limit=10
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 6.2 Search Events by Location
```
GET {{base_url}}/api/events/search?lat=40.7128&lng=-74.0060&radius=10&unit=miles
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

#### 6.3 Get Health Tips
```
GET {{base_url}}/api/tips?category=prevention&priority=high&page=1&limit=10
```
**Headers:**
```
Authorization: Bearer {{auth_token}}
```

## 🔧 Testing Tips

### 1. Authentication Flow
1. Start with user registration
2. Login to get the auth token
3. Use the token for all subsequent requests

### 2. Complete User Journey
1. Register/Login
2. Create health profile
3. Log symptoms (with/without photos)
4. Find and book appointments
5. Set up reminders
6. View notifications

### 3. Error Handling
Test these scenarios:
- Invalid authentication (401)
- Missing required fields (400)
- Unauthorized access (403)
- Resource not found (404)

### 4. File Upload Testing
- Use actual image files for symptom photo uploads
- Test different file formats (JPG, PNG, WebP)
- Test file size limits (max 5MB)

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate data) |
| 500 | Internal Server Error |

## 🎯 Collection Import

To import this collection into Postman:
1. Copy the JSON structure above
2. Create a new collection in Postman
3. Add requests following the structure above
4. Set up environment variables
5. Configure authentication scripts

## 📝 Notes
- All dates should be in ISO 8601 format
- File uploads use `multipart/form-data`
- JSON requests use `application/json` content type
- Always include the Authorization header for protected routes
- Use pagination parameters (`page`, `limit`) for list endpoints
