import { useState, useEffect } from "react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Provider, Network, Types } from "aptos";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import ExerciseList from "./components/ExerciseList";
import UserProfile from "./components/UserProfile";
import RandomWorkout from "./components/RandomWorkout";

const MODULE_ADDRESS = "0x99b5445840dd5de2802c9c3dcb96abc5545e50d0cfaeb62a3dd2c3fc40be4139";
const MODULE_NAME = "workout_dapp";

const provider = new Provider(Network.TESTNET);

interface Exercise {
  name: string;
}

interface ProfileExercise {
  name: string;
  total_workouts: number;
}

interface UserProfile {
  total_workouts: number;
  top_exercises: ProfileExercise[];
}

function App() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (account) {
      fetchExercises();
      fetchUserProfile();
    }
  }, [account]);

  const fetchExercises = async () => {
    if (!account) return;

    const count = Number(
      (
        await provider.view({
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_exercises_list_count`,
          type_arguments: [],
          arguments: [MODULE_ADDRESS],
        })
      )[0],
    );
    console.log("count", count);

    const exercises: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const [name] = await provider.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_exercise_name_by_index`,
        type_arguments: [],
        arguments: [MODULE_ADDRESS, i.toString()],
      });
      console.log("name", name);
      //exercises.push({ name });
    }
    setExercises(exercises);
  };

  const fetchUserProfile = async () => {
    if (!account) return;

    const top3Exercises = (await provider.view({
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_top_3_exercises`,
      type_arguments: [],
      arguments: [account.address],
    })) as ProfileExercise[];

    const [totalWorkouts] = (await provider.view({
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_profile_exercise`,
      type_arguments: [],
      arguments: [account.address, 0],
    })) as [number];

    setUserProfile({
      total_workouts: totalWorkouts,
      top_exercises: top3Exercises,
    });
  };

  const startExercise = async (index: number) => {
    if (!account) return;

    const payload: Types.TransactionPayload_EntryFunctionPayload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::start_exercise`,
      type_arguments: [],
      arguments: [MODULE_ADDRESS, index],
    };

    try {
      const transaction = await signAndSubmitTransaction({
        data: payload as any,
      });
      await provider.waitForTransaction(transaction.hash);
      fetchUserProfile();
    } catch (error) {
      console.error("Error starting exercise:", error);
    }
  };

  const mintNFT = async (index: number) => {
    if (!account) return;

    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::mint_nft`,
      type_arguments: [],
      arguments: [index],
    };

    try {
      await signAndSubmitTransaction({
        data: payload as any,
      });
      alert("NFT minted successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  const resetStats = async () => {
    if (!account) return;

    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::reset_my_stats`,
      type_arguments: [],
      arguments: [],
    };

    try {
      await signAndSubmitTransaction({
        data: payload as any,
      });
      fetchUserProfile();
    } catch (error) {
      console.error("Error resetting stats:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Workout dApp</h1>
        <div className="absolute top-4 right-4">
          <div className="p-1 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:bg-[rgba(55,65,81,0.8)] hover:bg-none">
            <WalletSelector />
          </div>
        </div>
        {account ? (
          <div className="space-y-8">
            <ExerciseList exercises={exercises} onStartExercise={startExercise} />
            <UserProfile profile={userProfile} onMintNFT={mintNFT} onResetStats={resetStats} />
            <RandomWorkout />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-16 text-center space-y-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Welcome to the Workout dApp!
            </h1>
            <p className="text-xl max-w-2xl">
              Connect your wallet to start tracking your workouts and earning rewards.
            </p>
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-500">
                Features
              </h2>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Track your workouts on the blockchain
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Earn NFTs for your achievements
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  View your top exercises and total workouts
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  Generate random workouts for variety
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
