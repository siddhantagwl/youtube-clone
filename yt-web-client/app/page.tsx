// server side component
import Link from "next/link";
import Image from "next/image";
import { getVideos } from "./firebase/functions";
import styles from "./page.module.css";

export default async function Home() {
  const videos = await getVideos(); // by default, nextjs caches the server side component and this will show the same set of videos
  // console.log("Videos on home page:", videos);

  return (
    <main>
      {
        videos.map((video) => {
          if (!video.id) return null;
          return (
            <Link key={video.id} href={`/watch/${video.id}`}>
              <Image src={"/thumbnail.png"} alt="thumbnail" width={200}
               height={100} className={styles.thumbnail} />
            </Link>
          );
        })
      }
    </main>
  );
}

// as per docs:
// on this entire page , disbale caching and make it revalidate
// every 30 seconds and render page in 30 sec
// and this way. we can reduce the load on getVideos function
export const revalidate = 30;
