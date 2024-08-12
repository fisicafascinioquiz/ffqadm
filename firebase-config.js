// Importar as funções necessárias dos SDKs do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Configuração do Firebase do seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyDunPWHBhPejSRjC1NjEaUrJ1CYD25zSEg",
  authDomain: "fisicafascinioquiz.firebaseapp.com",
  projectId: "fisicafascinioquiz",
  storageBucket: "fisicafascinioquiz.appspot.com",
  messagingSenderId: "889980799945",
  appId: "1:889980799945:web:8016ac992736010b867618",
  measurementId: "G-C5KZFLPLKL"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar os serviços de autenticação e Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar os serviços para uso em outros arquivos
export { db, auth };
