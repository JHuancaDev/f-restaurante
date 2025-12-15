export const environment = {
  production: false,
  apiUrl: 'http://192.168.101.8:8000',
  wsUrl: 'ws://192.168.101.8:8000/orders/ws',

  // configuración de Firebase si necesitas
  firebaseConfig: {
    apiKey: "AIzaSyCWD8O8VuV6ujCWxSHB0eUbc41GHKXigAY",
    authDomain: "back-restaurante.firebaseapp.com",
    projectId: "back-restaurante",
    storageBucket: "back-restaurante.firebasestorage.app",
    messagingSenderId: "928527277564",
    appId: "1:928527277564:web:b7750bf314036e1e0d2679",
    measurementId: "G-Q7PXNS7NX7"
  }
};

// src/environments/environment.prod.ts
export const environmentProd = {
  production: true,
  apiUrl: 'https://tu-api-produccion.com'
};
