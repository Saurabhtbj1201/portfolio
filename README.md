# Portfolio Website

Full-stack portfolio website with admin panel.

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT
- **Image Storage**: Cloudinary

## Setup Instructions

### Server Setup

1. Navigate to server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update `.env` file with your credentials:
   - MongoDB URI
   - JWT Secret
   - Cloudinary credentials

4. Start server:
   ```bash
   npm run dev
   ```

### Client Setup

1. Navigate to client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Create Admin User

Make a POST request to `http://localhost:5000/api/auth/register`:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Note**: Remove or protect this route after creating the admin user.

## Project Structure

