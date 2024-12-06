"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Post } from "@/app/[locale]/blog/types/Post";
import Container from "@/components/atoms/Container";
import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import SelectButton from "@/components/atoms/SelectButton";
import { IIFE } from "@/functions/iife";
import { Link } from "@/navigation";

function useAllPosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    IIFE(async () => {
      const res = await fetch(
        "https://api.dex223.io/v1/core/api/blog/list?lang=en&page=1&limit=100",
      );
      const posts: { data: Post[] } = await res.json();

      setPosts(posts.data);
    });
  }, []);

  return {
    posts,
    latestPosts: posts?.slice(0, 4),
    isLoading: !posts,
  };
}

export default function BlogPage() {
  const [searchValue, setSearchValue] = useState("searchValue");
  const { posts, latestPosts, isLoading } = useAllPosts();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Preloader />
      </div>
    );
  }

  return (
    <Container>
      <div className="flex items-center justify-between py-10">
        <h1 className="text-40">Blog</h1>
        <div className="flex items-center gap-3">
          <SelectButton className="flex-shrink-0">Articles and videos</SelectButton>
          <SelectButton className="flex-shrink-0">All categories</SelectButton>
          <SearchInput className="bg-primary-bg" />
        </div>
      </div>

      <div className="">
        <h2 className="text-32 mb-5 ">Latest news</h2>
        <div className="grid grid-cols-[8fr_4fr] gap-5">
          <Link
            href={`/blog/${latestPosts[0]?.id}?slug=${latestPosts[0]?.slug}`}
            className="flex flex-col group cursor-pointer"
          >
            <div className="w-full flex-grow relative">
              <Image
                className="rounded-t-5"
                src={latestPosts[0]?.thumbnail.link}
                layout="fill"
                objectFit="cover"
                alt={latestPosts[0]?.thumbnail.alt}
              />
            </div>
            <div className="px-5 pt-4 pb-6 flex flex-col gap-1 bg-primary-bg rounded-b-5 group-hocus:bg-tertiary-bg duration-200">
              <h3 className="font-medium line-clamp-1 text-24 group-hocus:text-green duration-200">
                {latestPosts[0]?.title}
              </h3>
              <p className="line-clamp-3 text-secondary-text text-72">
                {latestPosts[0]?.description}
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-5">
            {latestPosts?.slice(1).map((post) => {
              return (
                <Link
                  href={`/blog/${post.id}?slug=${post.slug}`}
                  key={post.id}
                  className="flex group cursor-pointer"
                >
                  <div className="w-[132px] h-[132px] relative flex-shrink-0">
                    <Image
                      className="rounded-l-5"
                      src={post.thumbnail.link}
                      layout="fill"
                      objectFit="cover"
                      alt={post.thumbnail.alt}
                    />{" "}
                  </div>
                  <div className="px-5 pt-4 pb-6 flex flex-col gap-1 bg-primary-bg rounded-r-5 group-hocus:bg-tertiary-bg duration-200">
                    <h3 className="font-medium line-clamp-2 group-hocus:text-green duration-200">
                      {post.title}
                    </h3>
                    <p className="line-clamp-2 text-secondary-text text-14">{post.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-px bg-secondary-border mt-10 mb-8" />

      <div>
        <h2 className="text-32 mb-5 ">All news</h2>

        <div className="grid grid-cols-3 gap-5 auto-rows-fr">
          {posts.map((post) => {
            return (
              <Link
                href={`/blog/${post.id}?slug=${post.slug}`}
                key={post.id}
                className="flex flex-col group cursor-pointer"
              >
                <div className="w-full min-h-[217px] relative">
                  <Image
                    className="rounded-t-5"
                    src={post.thumbnail.link}
                    layout="fill"
                    objectFit="cover"
                    alt={post.thumbnail.alt}
                  />
                </div>
                <div className="px-5 pt-4 pb-6 flex flex-col gap-1 bg-primary-bg flex-grow rounded-b-5 group-hocus:bg-tertiary-bg duration-200 cursor-pointer">
                  <h3 className="font-medium line-clamp-2 text-24 group-hocus:text-green duration-200">
                    {post.title}
                  </h3>
                  <p className="line-clamp-3 text-secondary-text text-72">{post.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
