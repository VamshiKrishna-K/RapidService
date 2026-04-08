# MERN Service Marketplace Architecture

## 1. 🏗️ High-Level System Architecture

The application follows a monolithic MVC (Model-View-Controller) pattern on the backend using **Node.js + Express**, and a modern component-based UI using **React** on the frontend. 

### Data Flow
- **Client (React)**: Communicates with the backend REST API via Axios/Fetch over HTTPS.
- **WebSocket (Socket.io)**: Establishes a persistent TCP connection for real-time features (Chat, Notifications).
- **Backend (Node.js/Express)**: Acts as the central hub handling business logic, authenticating users (JWT & Firebase Admin), and communicating with the database.
- **Database (MongoDB Atlas)**: Stores state persistently. Accessed via Mongoose ODM.
- **Third-Party Services**:
  - **Firebase Auth**: Verifies Google Sign-in tokens from the frontend.
  - **Razorpay**: Handles payment gateway operations (order creation/verification).
  - **Google Maps API**: Frontend uses this to display maps, Backend geometry logic uses standard MongoDB 2dsphere indexes instead for location computations to save API costs.

---

## 2. 🗄️ Database Design (MongoDB Schemas)

### Users Schema
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (Unique, Indexed)",
  "passwordHash": "String",
  "role": "Enum['user', 'provider', 'admin']",
  "isEmailVerified": "Boolean",
  "firebaseUid": "String (Optional)",
  "location": {
    "type": "Point",
    "coordinates": ["Longitude", "Latitude"]
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### ServiceProviders Schema
```json
{
  "_id": "ObjectId",
  "user": "ObjectId(User) (Ref, Indexed)",
  "bio": "String",
  "experienceYears": "Number",
  "rating": "Number",
  "totalReviews": "Number",
  "availability": ["String (Dates/Slots)"],
  "bankDetails": {
    "accountNumber": "String",
    "ifscCode": "String"
  }
}
```

### Services Schema
```json
{
  "_id": "ObjectId",
  "provider": "ObjectId(User) (Ref, Indexed)",
  "category": "String (Indexed)",
  "title": "String",
  "description": "String",
  "basePrice": "Number",
  "priceUnit": "Enum['hourly', 'fixed']",
  "images": ["String (URLs)"],
  "isActive": "Boolean"
}
```

### Bookings Schema
```json
{
  "_id": "ObjectId",
  "customer": "ObjectId(User) (Ref)",
  "provider": "ObjectId(User) (Ref)",
  "service": "ObjectId(Service) (Ref)",
  "status": "Enum['pending', 'accepted', 'rejected', 'completed', 'cancelled']",
  "scheduleDate": "Date",
  "totalAmount": "Number",
  "paymentStatus": "Enum['pending', 'paid', 'refunded']",
  "createdAt": "Date"
}
```

### Reviews Schema
```json
{
  "_id": "ObjectId",
  "booking": "ObjectId(Booking) (Ref)",
  "customer": "ObjectId(User) (Ref)",
  "provider": "ObjectId(User) (Ref)",
  "rating": "Number (1-5)",
  "comment": "String",
  "createdAt": "Date"
}
```

### Payments Schema
```json
{
  "_id": "ObjectId",
  "booking": "ObjectId(Booking) (Ref)",
  "razorpayOrderId": "String",
  "razorpayPaymentId": "String",
  "amount": "Number",
  "currency": "String",
  "status": "Enum['created', 'authorized', 'captured', 'failed']",
  "createdAt": "Date"
}
```

### Chats Schema
```json
{
  "_id": "ObjectId",
  "participants": ["ObjectId(User) (Ref, Indexed)"],
  "messages": [
    {
      "sender": "ObjectId(User) (Ref)",
      "content": "String",
      "timestamp": "Date"
    }
  ],
  "startedAt": "Date",
  "lastMessageAt": "Date"
}
```

---

## 3. 🤖 Recommendation Engine Logic
The goal is to sort available providers by a dynamic score when users browse:
**Score = (w1 * NormalizedRating) + (w2 * NormalizedDistanceInverse) + (w3 * NormalizedPriceInverse) + (w4 * AvailabilityBoost)**

* `w1 = 0.4` (Rating is highest priority)
* `w2 = 0.3` (Distance is second priority)
* `w3 = 0.2` (Price competitiveness)
* `w4 = 0.1` (Immediate availability)
