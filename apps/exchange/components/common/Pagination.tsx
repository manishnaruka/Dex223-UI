import "react-loading-skeleton/dist/skeleton.css";

import clsx from "clsx";
import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import Svg from "@/components/atoms/Svg";
import { clsxMerge } from "@/functions/clsxMerge";
import { DOTS, usePagination } from "@/hooks/usePagination";

interface Props {
  onPageChange: (page: number | string) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
  isLoading?: boolean;
}
export default function Pagination({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className,
  isLoading = false,
}: Props) {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (isLoading) {
    return (
      <div className="flex items-center flex-row gap-5 justify-center">
        <SkeletonTheme
          baseColor="#1D1E1E"
          highlightColor="#272727"
          borderRadius="0.5rem"
          enableAnimation={false}
          // duration={5}
        >
          <Skeleton width={24} height={16} />
          <Skeleton circle width={48} height={48} />
          <Skeleton width={24} height={16} />
          <Skeleton width={24} height={16} />
          <Skeleton width={24} height={16} />
          <Skeleton width={24} height={16} />
          <Skeleton width={24} height={16} />
        </SkeletonTheme>
      </div>
    );
  }

  // If there are less than 2 times in pagination range we shall not render the component
  if (!paginationRange || currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];
  return (
    <ul className="flex items-center gap-2 justify-center">
      {/* Left navigation arrow */}
      <li
        className={clsxMerge(
          "text-tertiary-text w-10 lg:w-12 h-10 lg:h-12 hocus:bg-green-bg hocus:text-primary-text rounded-full text-16 flex items-center duration-200 justify-center cursor-pointer",
          currentPage === 1 && "opacity-50 text-tertiary-text pointer-events-none",
        )}
        onClick={onPrevious}
      >
        <Svg className="rotate-90" iconName="small-expand-arrow" />
      </li>
      {paginationRange.map((pageNumber, index) => {
        // If the pageItem is a DOT, render the DOTS unicode character
        if (pageNumber === DOTS) {
          return (
            <li
              key={`${pageNumber}-${index}`}
              className="w-10 lg:w-12 h-10 lg:h-12 rounded-full text-16 flex items-center justify-center duration-200"
            >
              &#8230;
            </li>
          );
        }

        // Render our Page Pills
        return (
          <li
            key={`${pageNumber}-${index}`}
            className={clsx(
              "w-10 lg:w-12 h-10 lg:h-12 rounded-full text-16 cursor-pointer flex items-center justify-center duration-200",
              pageNumber === currentPage
                ? "bg-green text-black"
                : "bg-transparent hocus:bg-green-bg text-primary-text",
            )}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </li>
        );
      })}
      {/*  Right Navigation arrow */}
      <li
        className={clsxMerge(
          "text-tertiary-text w-10 lg:w-12 h-10 lg:h-12 rounded-full hocus:bg-green-bg hocus:text-primary-text text-16 cursor-pointer duration-200 flex items-center justify-center",
          currentPage === lastPage && "opacity-50 text-tertiary-text pointer-events-none",
        )}
        onClick={onNext}
      >
        <Svg className="-rotate-90" iconName="small-expand-arrow" />
      </li>
    </ul>
  );
}
