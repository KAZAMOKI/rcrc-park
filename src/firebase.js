import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 👇 ضع الكود الذي نسخته من فايربيس هنا 👇
const firebaseConfig = {
  apiKey: "AIzaSyCI0z0RjY3jw1wSpLwPpDtjI44BOfZ4SkU",
  authDomain: "rcrc-park-db.firebaseapp.com",
  projectId: "rcrc-park-db",
  storageBucket: "rcrc-park-db.firebasestorage.app",
  messagingSenderId: "904175781977",
  appId: "1:904175781977:web:d75d33579b46fc90a0c948"
};
// 👆 ================================= 👆

// تهيئة الاتصال بقاعدة البيانات
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);