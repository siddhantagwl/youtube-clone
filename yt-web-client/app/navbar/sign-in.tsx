// by default next JS components are server side rendered and if we add some click hanlders and execute some JS on client side, we need to use client components component
"use client";

import { Fragment } from "react";
import styles from "./sign-in.module.css";
import { signInWithGoogle, signOut  } from "../firebase/filebase";

export default function SignIn() {

  return (
      <Fragment>
         <button className={styles.signin} onClick={signOut}>Sign Out</button>
         <button className={styles.signin} onClick={signInWithGoogle}>Sign In</button>
      </Fragment>
  );
}
