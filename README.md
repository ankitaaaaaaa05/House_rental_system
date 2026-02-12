# House Rental System

A secure role-based rental management platform with identity verification, property approvals, and protected user access.

## Overview
The House Rental System allows Admins, Landlords, and Renters to interact within a safe and controlled rental ecosystem. Landlords and renters must be verified before accessing core features, and all properties require admin approval before becoming visible.

## Features
- Identity verification for landlords & renters
- Property listing with document uploads
- Admin approval workflow for users and properties
- Secure JWT authentication
- Role-based access control
- Favorites & contact landlord options
- Base64 document storage in MongoDB
- User blocking capability

## User Roles
### Admin
- Approves/rejects users
- Approves/rejects properties
- Views platform statistics
- Can block users

### Landlord
- Uploads ID for verification
- Adds property listings after approval
- Tracks approval status

### Renter
- Must be verified to view properties
- Can browse approved properties
- Can save favorites & contact landlords

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js (Express.js)
- **Database:** MongoDB
- **Security:** JWT, bcrypt, base64 document storage

## Running the Project

### Backend Setup
```
cd BACKEND
npm install
npm start
```

Create a `.env` file inside BACKEND:
```
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

### Frontend Setup
Simply open:
```
FRONTEND/index.html
```

## API Summary
### Authentication
- Signup, login, upload ID, get current user

### Admin
- Stats, pending users, approval endpoints
- Pending properties, approval endpoints

### Properties
- List properties
- Create listing
- Favorite/unfavorite
- Contact landlord

## Completed Modules
- Verification module
- Admin dashboard
- Property approval system
- Secure document handling
- Role-based routing
- Property browsing & filtering
- Favorites feature

## Conclusion
The House Rental System ensures secure and verified interactions among admins, landlords, and renters. It provides a reliable and structured solution for property rental workflows.

