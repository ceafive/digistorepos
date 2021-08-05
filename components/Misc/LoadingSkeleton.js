import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const LoadingSkeleton = () => {
  return (
    <SkeletonTheme color="#fff" highlightColor="#eee">
      {/* <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full"> */}
      <div className="min-h-screen-75 flex flex-col justify-center pb-6 pt-6">
        <div className="flex">
          <div className="w-7/12 xl:w-8/12 px-4">
            <Skeleton height={50} />
            <div className="flex w-full justify-between my-4">
              <Skeleton height={100} width={100} />
              <Skeleton height={100} width={100} />
              <Skeleton height={100} width={100} />
              <Skeleton height={100} width={100} />
              <Skeleton height={100} width={100} />
              <Skeleton height={100} width={100} />
              <Skeleton height={100} width={100} />
              <Skeleton height={100} width={100} />
            </div>
            <div className="flex w-full justify-between">
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
            </div>
            <div className="flex w-full justify-between">
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
            </div>
            <div className="flex w-full justify-between">
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
              <Skeleton height={200} width={150} />
            </div>
          </div>
          <div className="w-5/12 xl:w-4/12 px-4">
            <Skeleton height={50} />

            <Skeleton height={500} />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default LoadingSkeleton;
