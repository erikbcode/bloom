import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingSpinner } from './LoadingSpinner';
import Link from 'next/link';
import { api } from '~/utils/api';
import { HandThumbUpIcon } from '@heroicons/react/20/solid';
import FollowButton from './buttons/FollowButton';
import { useSession } from 'next-auth/react';
import ProfileImage from './ProfileImage';
import SmallFollowButton from './buttons/SmallFollowButton';

type Post = {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; image: string | null; name: string | null };
  likeCount: number;
  likedByMe: boolean;
};

type InfinitePostListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean | undefined;
  fetchNewPosts: () => Promise<unknown>;
  posts?: Post[];
};

export default function InfinitePostList({
  posts,
  isError,
  isLoading,
  fetchNewPosts,
  hasMore = false,
}: InfinitePostListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center w-fit h-fit">
        <LoadingSpinner />
      </div>
    );
  }
  if (isError) {
    return <h1 className="self-center text-xl pt-5">Error...</h1>;
  }
  if (posts == null || posts.length == 0) {
    return <h1 className="self-center text-xl pt-5">Nothing to display</h1>;
  }

  return (
    <ul className="w-full">
      <InfiniteScroll
        style={{ overflow: 'visible' }}
        dataLength={posts.length}
        next={fetchNewPosts}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <div className="flex flex-col items-center w-full">
          {posts.map((post) => {
            return <PostCard key={post.id} {...post} />;
          })}
        </div>
      </InfiniteScroll>
    </ul>
  );
}

function PostCard({ id, content, createdAt, likeCount, likedByMe, user }: Post) {
  const [isLiked, setIsLiked] = useState(likedByMe);
  const [numLikes, setNumLikes] = useState(likeCount);
  const session = useSession();

  // Convert the post's createdAt to a "time ago" format
  const timeAgo = new Date().getTime() - new Date(createdAt).getTime(); // This gives difference in milliseconds
  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
  let displayTime;
  if (hoursAgo < 0) {
    displayTime = 'Just Now';
  } else if (hoursAgo < 1) {
    displayTime = 'Less than an hour ago';
  } else if (hoursAgo < 24) {
    displayTime = `${hoursAgo}h ago`;
  } else {
    displayTime = `${Math.floor(hoursAgo / 24)}d ago`;
  }

  const likePost = api.post.likePost.useMutation();

  const handleLike = () => {
    // The following two operations must occur in this order
    isLiked ? setNumLikes(numLikes - 1) : setNumLikes(numLikes + 1);
    setIsLiked(!isLiked);
    likePost.mutate({ postId: id });
  };

  return (
    <div className="flex flex-col justify-between dark:bg-dark-800 p-4 mb-3 w-5/6 xl:w-full h-56 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 space-y-1">
      <div>
        <div className="flex gap-5">
          <Link className="flex gap-2 items-center" href={`/profiles/${user.id}`}>
            <ProfileImage src={user.image} className="w-10 h-10 rounded-full" />
            <div>
              <h4 className="font-bold">{user.name}</h4>
            </div>
          </Link>
          {user.id != session?.data?.user.id && (
            <>
              <div className="hidden xl:contents">
                <FollowButton followerId={session.data?.user.id || ''} followeeId={user.id} />
              </div>
              <div className="contents xl:hidden">
                <SmallFollowButton followerId={session.data?.user.id || ''} followeeId={user.id} />
              </div>
            </>
          )}
        </div>
        <p className="text-dark-500">{displayTime}</p>
      </div>

      <p className="xl:text-md 2xl:text-lg font-normal">{content}</p>
      <LikeButton isLiked={isLiked} isLoading={likePost.isLoading} likeCount={numLikes} onClick={handleLike} />
    </div>
  );
}

type LikeButtonProps = {
  isLoading: boolean;
  isLiked: boolean;
  likeCount: number;
  onClick: () => void;
};

function LikeButton({ isLiked, isLoading, likeCount, onClick }: LikeButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`relative w-fit flex gap-2 rounded-md ${
        isLiked
          ? 'bg-green-600 dark:bg-green-300 hover:bg-green-700 dark:hover:bg-green-400'
          : 'bg-slate-300 hover:bg-slate-400 dark:bg-dark-700 dark:hover:bg-dark-600'
      } px-2 py-1`}
    >
      <HandThumbUpIcon className={`h-6 w-6 ${isLiked ? 'text-white dark:text-black' : 'text-black dark:text-white'}`} />
      <p className={`${isLiked ? 'text-white dark:text-black' : 'text-black dark:text-white'} font-semibold`}>
        {likeCount}
      </p>
      {showTooltip && (
        <div
          className={`${
            isLiked ? 'w-36' : 'w-28'
          }  text-base z-50 absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-dark-500 dark:bg-dark-900 text-white rounded-md shadow-lg`}
        >
          {isLiked ? <span>Remove like 💔</span> : <span>Like post ❤️</span>}
        </div>
      )}
    </button>
  );
}
