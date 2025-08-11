import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css"; // Importing CSS module for styling
import SignIn from "./sign-in";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <Link href="/">
          <Image src="/youtube-logo.svg" alt="YT Logo" width={90} height={20} />
          <SignIn />
      </Link>
    </nav>
  );
}