import { posts } from "@/app/[locale]/blog/test-posts";

export default function BlogPage() {
  return (
    <div>
      {posts.map((post) => {
        return (
          <div key={post.id} className="bg-tertiary-bg rounded-2 p-4 flex gap-3">
            {post.title}
            <a href={`/blog/${post.id}`} className="text-green underline hocus:text-green-hover">
              Link to article
            </a>
          </div>
        );
      })}
    </div>
  );
}
