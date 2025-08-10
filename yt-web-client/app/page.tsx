
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Welcome to the Home Page</h1>
        <p>This is where the main content will be displayed.</p>
      </main>
    </div>
  );
}
