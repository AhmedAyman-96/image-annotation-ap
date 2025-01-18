import * as admin from "firebase-admin";

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./firebase-admin-key.json"; // for who's using this repo put your admin key path here

if (!admin.apps.length) {
  initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const dbAuth = getAuth();
export const db = getFirestore();
