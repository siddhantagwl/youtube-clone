import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import * as logger from "firebase-functions/logger";
import {Firestore} from "firebase-admin/firestore";
// import {auth} from "firebase-functions/v1";
// import {onCall} from "firebase-functions/v2/https";
// import {beforeUserCreated} from "firebase-functions/v2/identity";


initializeApp();

const dbFirestore = new Firestore();

export const createUser = functions.auth.user().onCreate(async (user) => {
  // Check if user exists
  if (!user) {
    logger.error("User data is undefined");
    return;
  }
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoURL: user.photoURL,
  };

  // if coll does not exist, it will create it automatically
  await dbFirestore.collection("users").doc(user.uid).set(userInfo);

  logger.info(`User created: ${JSON.stringify(userInfo)}`);
  return;
});
