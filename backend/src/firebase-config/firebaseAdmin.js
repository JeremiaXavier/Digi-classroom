import admin from "firebase-admin";
import serviceAccount from "../../credentials.json" with { type: 'json' }; // Adjust path if necessary

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
