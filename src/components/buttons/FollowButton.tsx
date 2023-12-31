import React from 'react';
import { api } from '~/utils/api';
import { LoadingSpinner } from '../LoadingSpinner';
import { PlusCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';

interface FollowButtonProps {
  followerId: string; // Logged-in user's ID
  followeeId: string; // Profile user's ID
  small?: boolean;
  large?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  followerId,
  followeeId,
  large = false,
  small = false,
}: FollowButtonProps) => {
  // TODO add variants based on size for styling
  const sizeClasses = small ? 'w-12' : large ? 'w-28' : 'w-24';
  const { data: isFollowing, isLoading } = api.user.isFollowing.useQuery({ followerId, followeeId });
  const trpcUtils = api.useContext();

  // Call toggleFollow mutation to update the user's follower count for display on profile
  const toggleFollow = api.user.toggleFollow.useMutation({
    onSuccess: async (result) => {
      // Update profile of user who was followed to display new follower count
      const updateFollowee: Parameters<typeof trpcUtils.user.getUserProfile.setData>[1] = (oldData) => {
        if (oldData == null) {
          return;
        }
        let followerCountModifier = oldData.isFollowing ? -1 : 1;
        let isFollowingNew = oldData.isFollowing ? false : true;

        return {
          ...oldData,
          isFollowing: isFollowingNew,
          followerCount: oldData.followerCount + followerCountModifier,
        };
      };

      // Update the isFollowing status for the user who followed
      const updateFollower: Parameters<typeof trpcUtils.user.isFollowing.setData>[1] = (wasFollowing) => {
        if (wasFollowing == null) {
          return;
        }

        return !wasFollowing;
      };

      trpcUtils.user.getUserProfile.setData({ userId: followeeId }, updateFollowee);
      trpcUtils.user.isFollowing.setData({ followerId: followerId, followeeId: followeeId }, updateFollower);
    },
  });

  const handleFollowToggle = async () => {
    await toggleFollow.mutate({ userId: followeeId });
  };

  // If initial toggle state is loading return spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <button
      disabled={toggleFollow.isLoading}
      className={`rounded py-2 px-3 ${sizeClasses} font-semibold flex items-center justify-center overflow-hidden text-white ${
        isFollowing ? 'bg-red-500' : '  bg-blue-500'
      }`}
      onClick={handleFollowToggle}
    >
      <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
    </button>
  );
};

export default FollowButton;
