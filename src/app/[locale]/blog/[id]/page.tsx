import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import { PropsWithChildren } from "react";

import { PostDetails } from "@/app/[locale]/blog/types/Post";
import Container from "@/components/atoms/Container";
import { locales } from "@/navigation";

export const dynamic = "force-static";
export async function generateStaticParams() {
  const res = await fetch("https://api.dex223.io/v1/core/api/blog/list/ids");

  const allIds: string[] = await res.json();

  const params = allIds.flatMap((value) => locales.map((locale) => ({ id: value, lang: locale })));
  console.log("Generated Static Params:", params); // Debug output

  return params;
}

function PostContainer({ children }: PropsWithChildren<{}>) {
  return <div className="w-[720px] mx-auto">{children}</div>;
}
export default async function PostPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const res = await fetch(`https://api.dex223.io/v1/core/api/blog/detail/${id}`);
  const post: PostDetails = await res.json();

  console.log(post);

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "IFRAME") {
      const src = node.getAttribute("src") || "";
      if (!src.startsWith("https://www.youtube.com/embed/")) {
        node.remove(); // Remove iframe if it's not from YouTube
      }
    }
  });

  const sanitizedData = () => ({
    __html: DOMPurify.sanitize(post.content, {
      ALLOWED_TAGS: ["iframe", "p", "b", "i", "u", "a", "div", "span"], // Add 'iframe' to the allowed tags
      ALLOWED_ATTR: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "style"], // Allow necessary iframe attributes
    }).replace(
      /<iframe([\s\S]*?)<\/iframe>/g,
      '<div class="aspect-w-16 aspect-h-9"><iframe$1</iframe></div>',
    ),
  });

  if (!post) {
    return (
      <div>
        <h1>Post not found</h1>
      </div>
    );
  }
  return (
    <>
      <PostContainer>
        <div className="flex justify-between mb-10">
          <button>Back to blog</button>
          <div className="bg-tertiary-bg">
            Publication date:{" "}
            {new Date(post.createdAt)
              .toLocaleString("en", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              .replace(/\//, ".")}
          </div>
        </div>

        <h1 className="mb-5 text-32">{post.title}</h1>
        <p className="text-20 mb-[60px]">{post.description}</p>
      </PostContainer>
      {!post.links[0]?.link && (
        <Container>
          <div className="w-full relative min-h-[400px] mb-[60px]">
            <Image
              objectFit="cover"
              layout="fill"
              src={post.thumbnail.link}
              alt={post.thumbnail.alt}
            />
          </div>
        </Container>
      )}
      <PostContainer>
        <div className="prose prose-lg prose-p:text-secondary-text prose-strong:text-inherit max-w-none prose-a:text-green prose-h2:text-primary-text prose-h3:text-primary-text">
          <div dangerouslySetInnerHTML={sanitizedData()} />
        </div>
      </PostContainer>
    </>
  );
}
