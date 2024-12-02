import { posts } from "@/app/[locale]/blog/test-posts";

async function getPost(id: string) {
  // const res = await fetch(`https://.../posts/${params.id}`);
  // const post = await res.json();
  console.log(posts);
  return posts.find((p) => p.id === id);
}

export default async function Post({ params }: { params: { id: string } }) {
  console.log(params.id);
  const post = await getPost(params.id);

  console.log(post);
  return (
    <div className="text-primary-text">
      <h2>{post?.title}</h2>
      <img src={post?.thumbnail} alt="" />
    </div>
  );
}

export async function generateStaticParams() {
  return posts.map((post) => ({ id: post.id }));
}
