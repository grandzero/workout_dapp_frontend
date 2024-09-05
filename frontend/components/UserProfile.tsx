import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileExercise {
  name: string;
  total_workouts: number;
}

interface UserProfileData {
  total_workouts: { name: string; total_workouts: number }[];
  top_exercises: ProfileExercise[];
}

interface UserProfileProps {
  profile: UserProfileData | null;
  onMintNFT: (index: number) => void;
  onResetStats: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, onMintNFT, onResetStats }) => {
  if (!profile) return null;

  const totalWorkouts = profile.total_workouts.reduce((sum, exercise) => sum + exercise.total_workouts, 0);

  return (
    <Card className="w-full bg-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-bold mb-4">Top Exercises:</h3>
        <ul className="space-y-4">
          {profile.top_exercises
            .sort((a, b) => b.total_workouts - a.total_workouts)
            .map((exercise, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-lg">{exercise.name}</span>
                <span className="text-xl font-bold">{exercise.total_workouts}</span>
              </li>
            ))}
        </ul>
        <h3 className="text-xl font-bold mt-8 mb-4">All Completed Exercises:</h3>
        <ul className="space-y-4">
          {profile.total_workouts.map((exercise, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
              <span className="text-lg">{exercise.name}</span>
              <div className="flex items-center">
                <span className="text-xl font-bold mr-4">{exercise.total_workouts}</span>
                {exercise.total_workouts > 5 && (
                  <Button
                    onClick={() => onMintNFT(index)}
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Mint NFT
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-8">
          <Button
            onClick={onResetStats}
            className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            variant="outline"
            style={{ background: "none" }}
          >
            Reset Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
