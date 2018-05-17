import D from "debug";
import admin from "firebase-admin";
// import util from "util";
import serviceAccount from "./keys/trakapp-b7695-firebase-adminsdk-p1nfq-fbafb8005f.json";

const debug = D("ciris:util/pushNotifications.js");

function iniciarFireBase() {
  debug("Inciando Firebase");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://trakapp-b7695.firebaseio.com",
  });
}

async function enviarPush(data) {
  debug("Enviando push");
  debug(data);
  return admin.messaging().send(data)
    .then(response => debug("Successfully sent message:", response))
    .catch(error => debug("Error sending message:", error));
}

export default iniciarFireBase;
export {
  iniciarFireBase,
  enviarPush,
};
