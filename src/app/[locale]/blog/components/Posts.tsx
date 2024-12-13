import Image from "next/image";
import React from "react";

import { CategoryTag, YoutubeTag } from "@/app/[locale]/blog/components/PostTag";
import { Post } from "@/app/[locale]/blog/types/Post";
import { Link } from "@/i18n/routing";

export default function Posts({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
      {posts.map((post) => {
        return (
          <Link
            href={`/blog/${post.id}?slug=${post.slug}`}
            key={post.id}
            className="flex flex-col group cursor-pointer"
          >
            <div className="w-full aspect-[16/9] relative">
              {!!post.links[0] && <YoutubeTag />}
              {!!post.tags[0] && <CategoryTag tag={post.tags[0]} />}
              <Image
                className="rounded-t-5  object-cover"
                src={post.thumbnail.link}
                layout="fill"
                // objectFit="cover"
                alt={post.thumbnail.alt}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="px-5 pt-4 pb-6 flex flex-col gap-1 bg-primary-bg flex-grow rounded-b-5 group-hocus:bg-tertiary-bg duration-200 cursor-pointer">
              <h3 className="font-medium line-clamp-2 md:text-24 group-hocus:text-green duration-200">
                {post.title}
              </h3>
              <p className="line-clamp-3 text-secondary-text max-md:text-14">{post.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
