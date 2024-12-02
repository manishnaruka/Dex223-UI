import { posts } from "@/app/[locale]/blog/test-posts";
import { Link } from "@/navigation";

export default function BlogPage() {
  return (
    <div>
      {posts.map((post) => {
        return (
          <div key={post.id} className="bg-tertiary-bg rounded-2 p-4 flex gap-3">
            {post.title}
            <Link href={`/blog/${post.id}`} className="text-green underline hocus:text-green-hover">
              Link to article
            </Link>
          </div>
        );
      })}
    </div>
  );
}
