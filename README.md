# ReUse App

ReUse is a second-hand fashion marketplace web application developed as a final year project.

The application allows users to create an account, log in, view fashion posts, upload second-hand items, like posts and interact with other users.

---

## Technologies Used

- React
- TypeScript
- Vite
- Firebase Authentication
- Firestore Database
- Firebase Storage
- CSS
- GitHub

---

## Main Features

- User registration
- User login
- Feed with second-hand fashion posts
- Add new post with image upload
- Like posts
- User profile information
- Chat/message feature
- Firebase database integration

---

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/eliza-souza/reuse-app.git

### 2. Open the project folder

```bash
cd reuse-app

### 3. Install dependencies

```bash
npm install

### 4. Run the project

```bash
npm run dev

### 5. Open the application

After running the project, open the local URL shown in the terminal.

Usually: http://localhost:5173

Firebase Configuration

Firebase configuration is already included in the project for academic assessment purposes.

The project uses:

Firebase Authentication for user login and registration
Firestore Database for storing posts, users, likes and messages
Firebase Storage for storing uploaded images
How to Test the App
### 1. Run the project using:
```bash
npm run dev

### 2. Create a new account using the sign-up page.
### 3. Log in with the created account.
### 4. Navigate through the application pages.
### 5. Create a post by uploading an image and adding item details.
### 6. Check if the post appears in the feed.
### 7. Test likes and interactions.
### 8. Test the chat/message feature if available.

Folder Structure
reuse-app
│
├── public
├── src
│   ├── assets
│   ├── components
│   ├── firebase
│   │   └── config.ts
│   ├── pages
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── package-lock.json
├── README.md
└── vite.config.ts

Important Notes
The application was developed using React and TypeScript.
Firebase is used as the backend service.
The project should be run locally using npm install and npm run dev.
The Firebase configuration is included directly in the project to make the assessment process easier.
No additional environment file is required to run the app.

Author

Developed by Eliza Souza as a final year Computer Science project.
