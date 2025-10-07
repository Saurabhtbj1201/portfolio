# Portfolio Website

A complete portfolio website with an admin control panel to manage your content.

## What's Built With

- **Frontend**: React (fast development setup)
- **Backend**: Node.js web server
- **Database**: MongoDB (stores your data)
- **Login System**: Secure user authentication
- **Image Storage**: Cloud-based image hosting

## How to Set Up

### Setting Up the Server

1. Open the server folder:
   ```bash
   cd server
   ```

2. Install required packages:
   ```bash
   npm install
   ```

3. Add your account details to the `.env` file:
   - Database connection
   - Security key
   - Image hosting account details

4. Start the server:
   ```bash
   npm run dev
   ```

### Setting Up the Website

1. Open the client folder:
   ```bash
   cd client
   ```

2. Install required packages:
   ```bash
   npm install
   ```

3. Start the website:
   ```bash
   npm run dev
   ```

### Create Your Admin Account

Send a request to `http://localhost:5000/api/auth/register`:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Important**: Disable this registration feature after creating your admin account for security.

## How It's Organized

