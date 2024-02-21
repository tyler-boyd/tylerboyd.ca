import { posts } from "@/blog/posts";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

export default function BlogPostPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = posts.find((post) => post.slug === slug);
  if (!post) notFound();

  return (
    <div className={styles.post}>
      <div className="text-slate-500">{post.date}</div>
      <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
    </div>
  );
}
