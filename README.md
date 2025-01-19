# Image Annotation App

This is a **Frontend Image Annotation Application** built with **Next.js** and **Firebase**. It allows users to upload images, annotate them by drawing rectangles and adding text, and manage tasks with authentication and task filtering.

## Features

### 1\. Image Annotation

- Upload images and annotate them by drawing rectangles.
- Add text annotations to each rectangle.
- Render saved annotations on the image.
- Advanced undo/redo functionality (up to 50 steps).

### 2\. Task Management

- View a list of tasks assigned to the user.
- Filter tasks by status: **Pending**, **In Progress**, or **Completed**.
- Navigate between tasks using "Previous" and "Next" buttons.

### 3\. User Authentication

- Email/password authentication using **Firebase Authentication**.
- Restrict access to tasks and images based on user authentication.

### 4\. Responsive Design

- Works seamlessly on both desktop and mobile devices.

### 5\. Real-Time Updates

- Real-time updates for tasks and annotations using **Firestore**.

## Tech Stack

### Frontend

- **Next.js**: Framework for building the application.
- **React**: UI library for building components.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Firebase Authentication**: For user authentication.
- **Firestore**: Real-time database for tasks and annotations.

### Backend

- **Firebase**: Backend-as-a-Service for authentication, database, and storage.
- **Next.js API Routes**: For handling backend logic (e.g., saving annotations).

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v16 or higher).
- **Firebase Project**: Create a Firebase project and set up Firestore, Authentication, and Storage.

### Installation

1.  **Clone the Repository**

        git clone https://github.com/AhmedAyman-96/image-annotation-ap.git
        cd image-annotation-app

2.  **Install Dependencies**

        npm install

3.  **Set Up Firebase**

    Create a `.env.local` file in the root directory and add your Firebase credentials:

        NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
        NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

FireStore Rules Example:

                service cloud.firestore {
                  match /databases/{database}/documents {
                    // Allow users to create their own document in the "users" collection
                    match /users/{userId} {
                      // Allow creation of a user document if the document ID matches the authenticated user's UID
                      allow create: if request.auth != null && request.auth.uid == userId;
                      
                      // Allow read and write access to the user's own document
                      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
                    }
                
                    // Rules for the "tasks" collection
                    match /tasks/{task} {
                      // Allow read and write access if the user is authenticated and the task is assigned to them
                      allow read, write: if request.auth != null && request.auth.uid == resource.data.assignedTo;
                    }
                
                    // Example rule for another collection
                    match /otherCollection/{document} {
                      allow read, write: if request.auth != null;
                    }
                  }
                }

4.  **Run the Application**

        npm run dev

    The app will be running at [http://localhost:3000](http://localhost:3000).

## Project Structure

    image-annotation-app/
    ├── app/
    │   ├── (auth)/            # Authentication pages (login, signup)
    │   ├── api/               # API routes for backend logic
    │   ├── tasks/             # Task-related pages
    │   └── layout.tsx         # Main layout component
    ├── components/            # Reusable UI components
    │   ├── AnnotationCanvas.tsx
    │   ├── ImageUpload.tsx
    │   ├── Navbar.tsx
    │   └── Spinner.tsx
    ├── firebase/              # Firebase configuration files
    │   ├── firebase.ts
    │   └── firebase-admin.ts
    ├── public/                # Static assets (images, icons)
    │   └── uploads/           # Directory for uploaded images
    ├── styles/                # Global styles
    │   └── globals.css
    ├── .env.local             # Environment variables
    ├── .gitignore             # Files and directories to ignore
    ├── package.json           # Project dependencies
    ├── README.md              # Project documentation
    └── tailwind.config.js     # Tailwind CSS configuration

## Firebase Database Structure

### Collections

1.  **Users Collection**
    - `userId` (string): Unique identifier for the user.
    - `email` (string): User's email address.
    - `tasks` (array): List of task IDs assigned to the user.
2.  **Tasks Collection**
    - `taskId` (string): Unique identifier for the task.
    - `imageURL` (string): URL of the image for annotation.
    - `assignedTo` (string): User ID of the assigned user.
    - `status` (string): Task status (`Pending`, `In Progress`, `Completed`).
    - `annotations` (array): List of annotations (rectangles and text).
    - `createdAt` (timestamp): Timestamp of task creation.

## Usage

### 1\. Authentication

- Sign up or log in using your email and password.
- Only authenticated users can access tasks and perform annotations.

### 2\. Task Management

- View a list of tasks assigned to you.
- Filter tasks by status: **Pending**, **In Progress**, or **Completed**.
- Click on a task to view its details and annotate the image.

### 3\. Image Annotation

- Upload an image and draw rectangles over specific sections.
- Add text annotations to each rectangle.
- Save your annotations and move to the next task.

### 4\. Real-Time Updates

- Changes to tasks and annotations are reflected in real time.

## Deployment

### Vercel

- Deploy the application to **Vercel** for production:

  vercel

### Firebase Hosting

- Deploy the application to **Firebase Hosting**:

  firebase init hosting
  firebase deploy
