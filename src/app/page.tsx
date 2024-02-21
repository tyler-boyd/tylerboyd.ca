import { posts } from "@/blog/posts";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-y-2">
        <h1 className="text-3xl font-bold">Hey there!</h1>
        <p>
          I'm a full-stack web developer with experience working on both large
          projects and rapid prototyping.
        </p>
        <p>Check out some of my blog posts below:</p>
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="transition-all hover:bg-slate-100 p-2 -mx-2 rounded grid gap-2"
          >
            <h2 className="text-xl font-bold">{post.title}</h2>
            <h3 className="text-slate-500">{post.date}</h3>
            <p>{post.shortContent}</p>
            <p className="text-slate-700 font-bold">Read more...</p>
          </Link>
        ))}
      </div>
    </>
  );
}
