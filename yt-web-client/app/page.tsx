// server side component
import Link from "next/link";
import Image from "next/image";
import { getVideos } from "./firebase/functions";
import styles from "./page.module.css";

export default async function Home() {
  const videos = await getVideos();
  console.log("Videos on home page:", videos);

  return (
    <main>
      {
        videos.map((video) => (
          <Link key={video.id || video.filename} href={`/watch?v=${video.filename}`}>
            <Image src={"/thumbnail.png"} alt="thumbnail" width={200}
             height={100} className={styles.thumbnail} />
          </Link>
        ))
      }
    </main>
  );
}
