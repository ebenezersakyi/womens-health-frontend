# Event Reviews API Documentation

## Overview
The Event Reviews API allows users to create, read, update, and delete reviews for events. Users can rate events on a scale of 1-5 stars, write detailed reviews, and vote on the helpfulness of other users' reviews. Event organizers can respond to reviews.

## Features
- ⭐ **Rating System**: 1-5 star ratings with half-star support
- 📝 **Detailed Reviews**: Title and comment fields for comprehensive feedback
- 🔍 **Review Discovery**: Browse reviews by event, user, or recent activity
- 👍 **Helpfulness Voting**: Users can vote on review helpfulness
- 💬 **Organizer Responses**: Event organizers can respond to reviews
- 📊 **Review Statistics**: Average ratings and distribution analytics
- 🔒 **Privacy Options**: Anonymous review option
- 🛡️ **Security**: Only past events can be reviewed, one review per user per event

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Review
**POST** `/api/reviews`

Create a new review for an event.

**Authentication**: Required

**Request Body**:
```json
{
  "eventId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "rating": 4.5,
  "title": "Great workshop on women's health",
  "comment": "The event was very informative and well-organized. The speaker was knowledgeable and answered all our questions.",
  "isAnonymous": false
}
```

**Validation Rules**:
- `eventId`: Valid MongoDB ObjectId, required
- `rating`: Number between 1-5, supports half-stars (1, 1.5, 2, 2.5, etc.)
- `title`: 2-100 characters, required
- `comment`: 10-1000 characters, required
- `isAnonymous`: Boolean, optional (default: false)

**Response**:
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "eventId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Women's Health Workshop",
      "date": "2024-01-15T10:00:00.000Z",
      "location": {
        "address": "Community Center, Accra",
        "region": "Greater Accra"
      }
    },
    "userId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "rating": 4.5,
    "title": "Great workshop on women's health",
    "comment": "The event was very informative and well-organized...",
    "isAnonymous": false,
    "helpfulVotes": 0,
    "totalVotes": 0,
    "helpfulPercentage": 0,
    "createdAt": "2024-01-20T15:30:00.000Z",
    "updatedAt": "2024-01-20T15:30:00.000Z"
  }
}
```

### 2. Get Event Reviews
**GET** `/api/reviews/event/:eventId`

Get all reviews for a specific event with statistics.

**Authentication**: Not required

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `sortBy`: Sort field (`createdAt`, `rating`, `helpfulVotes`)
- `sortOrder`: Sort direction (`asc`, `desc`)
- `rating`: Filter by specific rating (1-5)

**Example**: `/api/reviews/event/64f8a1b2c3d4e5f6a7b8c9d0?page=1&limit=5&sortBy=rating&sortOrder=desc`

**Response**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "eventId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "title": "Women's Health Workshop",
          "date": "2024-01-15T10:00:00.000Z"
        },
        "userId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "rating": 4.5,
        "title": "Great workshop on women's health",
        "comment": "The event was very informative...",
        "isAnonymous": false,
        "helpfulVotes": 3,
        "totalVotes": 5,
        "helpfulPercentage": 60,
        "createdAt": "2024-01-20T15:30:00.000Z"
      }
    ],
    "event": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Women's Health Workshop",
      "date": "2024-01-15T10:00:00.000Z"
    },
    "ratingStats": {
      "averageRating": 4.2,
      "totalReviews": 15,
      "ratingDistribution": {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 6,
        "5": 6
      }
    },
    "pagination": {
      "current": 1,
      "total": 2,
      "count": 5,
      "totalRecords": 15
    }
  }
}
```

### 3. Get My Reviews
**GET** `/api/reviews/my`

Get all reviews written by the authenticated user.

**Authentication**: Required

**Query Parameters**: Same as event reviews

**Response**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "eventId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "title": "Women's Health Workshop",
          "date": "2024-01-15T10:00:00.000Z",
          "location": {
            "address": "Community Center, Accra",
            "region": "Greater Accra"
          }
        },
        "rating": 4.5,
        "title": "Great workshop on women's health",
        "comment": "The event was very informative...",
        "isAnonymous": false,
        "createdAt": "2024-01-20T15:30:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "total": 1,
      "count": 1,
      "totalRecords": 1
    }
  }
}
```

### 4. Get Single Review
**GET** `/api/reviews/:id`

Get a specific review by ID.

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "eventId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Women's Health Workshop",
      "date": "2024-01-15T10:00:00.000Z",
      "location": {
        "address": "Community Center, Accra",
        "region": "Greater Accra"
      }
    },
    "userId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "rating": 4.5,
    "title": "Great workshop on women's health",
    "comment": "The event was very informative...",
    "isAnonymous": false,
    "helpfulVotes": 3,
    "totalVotes": 5,
    "helpfulPercentage": 60,
    "response": {
      "text": "Thank you for your feedback! We're glad you found it helpful.",
      "respondedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Dr. Sarah Johnson",
        "email": "sarah@healthcenter.com"
      },
      "respondedAt": "2024-01-21T09:15:00.000Z"
    },
    "createdAt": "2024-01-20T15:30:00.000Z",
    "updatedAt": "2024-01-20T15:30:00.000Z"
  }
}
```

### 5. Update Review
**PUT** `/api/reviews/:id`

Update a review. Only the review author can update their review.

**Authentication**: Required

**Request Body**:
```json
{
  "rating": 5,
  "title": "Updated: Excellent workshop on women's health",
  "comment": "After reflecting more, I think this was even better than I initially thought...",
  "isAnonymous": false
}
```

**Validation Rules**: Same as create review, but all fields are optional

**Response**: Same as create review

**Note**: Reviews can only be edited within 24 hours of creation.

### 6. Delete Review
**DELETE** `/api/reviews/:id`

Delete a review. Only the review author can delete their review.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

### 7. Vote on Review
**POST** `/api/reviews/:id/vote`

Vote on whether a review is helpful.

**Authentication**: Required

**Request Body**:
```json
{
  "isHelpful": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "data": {
    "helpfulVotes": 4,
    "totalVotes": 6,
    "helpfulPercentage": 67
  }
}
```

### 8. Respond to Review
**POST** `/api/reviews/:id/respond`

Event organizer responds to a review.

**Authentication**: Required (Event organizer only)

**Request Body**:
```json
{
  "response": "Thank you for your feedback! We're glad you found the workshop helpful."
}
```

**Validation Rules**:
- `response`: 5-500 characters, required

**Response**: Same as get single review, with response field populated

### 9. Get Recent Reviews
**GET** `/api/reviews/recent`

Get recent reviews across all events.

**Authentication**: Not required

**Query Parameters**: Same as event reviews (except rating filter)

**Response**: Same structure as event reviews

### 10. Get Organizer Review Statistics
**GET** `/api/reviews/organizer/stats`

Get review statistics for an organizer's events.

**Authentication**: Required (Organizer only)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalEvents": 8,
    "totalReviews": 45,
    "averageRating": 4.1,
    "eventsWithReviews": [
      {
        "eventId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "title": "Women's Health Workshop",
        "reviewCount": 12,
        "averageRating": 4.3
      }
    ],
    "ratingDistribution": {
      "1": 2,
      "2": 3,
      "3": 8,
      "4": 15,
      "5": 17
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Rating must be between 1 and 5",
      "param": "rating",
      "value": 6
    }
  ]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to update this review"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Review not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error during review creation"
}
```

## Business Rules

1. **One Review Per User Per Event**: Users can only write one review per event
2. **Past Events Only**: Reviews can only be created for events that have already occurred
3. **24-Hour Edit Window**: Reviews can only be edited within 24 hours of creation
4. **Self-Vote Prevention**: Users cannot vote on their own reviews
5. **Organizer Response Limit**: Only one response per review from the event organizer
6. **Anonymous Option**: Users can choose to make their reviews anonymous

## Rate Limiting
- Create/Update/Delete operations: 10 requests per minute per user
- Read operations: 100 requests per minute per user

## Best Practices

1. **Review Content**:
   - Be constructive and specific
   - Focus on the event content and organization
   - Avoid personal attacks or inappropriate language

2. **Rating Guidelines**:
   - 5 stars: Excellent, exceeded expectations
   - 4 stars: Very good, met most expectations
   - 3 stars: Good, met basic expectations
   - 2 stars: Below average, some issues
   - 1 star: Poor, significant problems

3. **Helpfulness Voting**:
   - Vote based on how helpful the review was for making decisions
   - Consider accuracy, detail, and relevance

## Integration Examples

### Frontend Integration
```javascript
// Create a review
const createReview = async (eventId, reviewData) => {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      eventId,
      ...reviewData
    })
  });
  return response.json();
};

// Get event reviews with statistics
const getEventReviews = async (eventId, options = {}) => {
  const params = new URLSearchParams(options);
  const response = await fetch(`/api/reviews/event/${eventId}?${params}`);
  return response.json();
};
```

### Backend Integration
```javascript
// Add review stats to event data
const eventWithReviews = await Event.findById(eventId);
const reviewStats = await eventWithReviews.getReviewStats();
const hasReviewed = await eventWithReviews.hasUserReviewed(userId);

// Get reviews for an event
const reviews = await eventWithReviews.getReviews({
  limit: 5,
  page: 1,
  sortBy: 'rating',
  sortOrder: 'desc'
});
```

## Database Schema

### Review Model
```javascript
{
  eventId: ObjectId (ref: Event),
  userId: ObjectId (ref: User),
  rating: Number (1-5, supports 0.5 increments),
  title: String (2-100 chars),
  comment: String (10-1000 chars),
  isAnonymous: Boolean,
  helpfulVotes: Number,
  totalVotes: Number,
  response: {
    text: String (5-500 chars),
    respondedBy: ObjectId (ref: User),
    respondedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `{ eventId: 1, userId: 1 }` (unique) - Prevent duplicate reviews
- `{ eventId: 1, rating: 1 }` - Rating queries
- `{ userId: 1, createdAt: -1 }` - User's reviews
- `{ createdAt: -1 }` - Recent reviews

This comprehensive review system enhances the event management platform by allowing users to share their experiences and help others make informed decisions about attending events.
