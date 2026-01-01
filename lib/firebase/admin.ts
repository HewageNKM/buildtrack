// Firebase Admin SDK Configuration for Server-side operations
import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Initialize Firebase Admin (prevent multiple initializations)
const adminApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: process.env.FIREBASE_PRIVATE_KEY
          ? cert(serviceAccount)
          : {
              getAccessToken: () =>
                Promise.resolve({
                  access_token: "mock-token",
                  expires_in: 3600,
                }),
            },
        projectId: process.env.FIREBASE_PROJECT_ID || "mock-project-id",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
export default adminApp;
