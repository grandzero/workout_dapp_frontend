import React from "react";

interface ProfileExercise {
  name: string;
  total_workouts: number;
}

interface UserProfileData {
  total_workouts: number;
  top_exercises: ProfileExercise[];
}

interface UserProfileProps {
  profile: UserProfileData | null;
  onMintNFT: (index: number) => void;
  onResetStats: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, onMintNFT, onResetStats }) => {
  if (!profile) return null;

  return (
    <div>
      <h2>User Profile</h2>
      <p>Total Workouts: {profile.total_workouts}</p>
      <h3>Top 3 Exercises:</h3>
      <ul>
        {profile.top_exercises.map((exercise, index) => (
          <li key={index}>
            {exercise.name}: {exercise.total_workouts}
            {exercise.total_workouts >= 5 && <button onClick={() => onMintNFT(index)}>Mint NFT</button>}
          </li>
        ))}
      </ul>
      <button onClick={onResetStats}>Reset Stats</button>
    </div>
  );
};

export default UserProfile;
