'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css"; // Importing CSS module for styling
import SignIn from "./sign-in";
import { onAuthStateChangedHelper } from "../firebase/filebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";

import Upload from "./upload";

export default function Navbar() {

  // inint user state
  const [user, setUser] = useState<User | null>(null);

  // hook
  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    // cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <nav className={styles.nav}>
      <Link href="/">
          <Image src="/youtube-logo.svg" alt="YT Logo" width={90} height={20} />
      </Link>
      {
        user && <Upload />
      }
      <SignIn user={user} />
    </nav>
  );
}