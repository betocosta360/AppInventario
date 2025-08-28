import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore'; // 👈 IMPORTAR AQUI

const firebaseConfig = {
  apiKey: "AIzaSyCLCr4B3_4_YhKqVAjVeKi4W0IuJKgaYfY",
  authDomain: "inventario-fa5ad.firebaseapp.com",
  databaseURL: "https://inventario-fa5ad-default-rtdb.firebaseio.com",
  projectId: "inventario-fa5ad",
  storageBucket: "inventario-fa5ad.appspot.com",
  messagingSenderId: "1046112012876",
  appId: "1:1046112012876:web:be02820ef1b9412bcf82e9",
  measurementId: "G-9W7RPNPP5F",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let authInitialized = false;

const authPromise = (async () => {
  try {
    const existingAuth = getAuth(app);
    if (existingAuth.app) {
      authInitialized = true;
      return existingAuth;
    }
  } catch (e) {
    // Se não tiver auth ainda
  }

  const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  authInitialized = true;
  return auth;
})();

const db = getFirestore(app); // 👈 ADICIONAR ESTA LINHA

export { app, authPromise, db }; // 👈 AGORA `db` É EXPORTADO

