import { useState, useEffect } from "react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Provider, Network, Types } from "aptos";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import ExerciseList from "./components/ExerciseList";
import UserProfile from "./components/UserProfile";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

//const MODULE_ADDRESS = "0xa268d07a4d0ca54e224ccc7b1b8507cac4d1529fa8f91a6961d42cf8c79a6655";
const MODULE_ADDRESS = "0x60406b0cf10e915ddc6d2f99d0075ba238aa1405f12310ccc56781b1f310429a";
const MODULE_NAME = "workout_dapp";

const provider = new Provider(Network.TESTNET);

interface Exercise {
  name: string;
}

interface ProfileExercise {
  name: string;
  total_workouts: number;
}

interface TotalWorkouts {
  name: string;
  total_workouts: number;
}

interface UserProfile {
  total_workouts: TotalWorkouts[];
  top_exercises: ProfileExercise[];
}

interface NFT {
  name: string;
  description: string;
  uri: string;
}

function App() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);

  useEffect(() => {
    if (account) {
      fetchUserNFTs();
      fetchExercises();
      fetchUserProfile();
    }
  }, [account]);

  function hexToString(hexString: any) {
    try {
      // Ensure the input is a string
      if (typeof hexString !== "string") {
        throw new Error("Input must be a string.");
      }

      // Ensure the string has an even number of characters
      if (hexString.length % 2 !== 0) {
        throw new Error("Hex string must have an even number of characters.");
      }

      // Ensure the string only contains valid hexadecimal characters
      if (!/^0x[0-9a-fA-F]+$/.test(hexString)) {
        throw new Error("Invalid hex string. Only characters 0-9, a-f, and A-F are allowed.");
      }

      // Split the string into an array of hex pairs (2 characters each)
      let hexPairs = hexString.match(/.{1,2}/g);
      if (!hexPairs) {
        throw new Error("Invalid hex string.");
      }
      // Convert each hex pair to a character
      let resultString = hexPairs
        .map((hex) => {
          // Convert hex pair to decimal (base 10)
          let decimalValue = parseInt(hex, 16);
          // Convert decimal to character
          return String.fromCharCode(decimalValue);
        })
        .join("");

      // Return the final human-readable string
      return resultString;
    } catch (error: any) {
      // Log the error message
      console.error("Error converting hex string:", error.message);
      // Return null or an empty string, depending on your preference
      return ""; // or return '';
    }
  }

  const fetchExercises = async () => {
    if (!account) return;

    const count = Number(
      (
        await provider.view({
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_exercises_list_count`,
          type_arguments: [],
          arguments: [account.address],
        })
      )[0],
    );

    const exercises: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const [name] = await provider.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_exercise_name_by_index`,
        type_arguments: [],
        arguments: [account.address, i.toString()],
      });

      exercises.push({ name: hexToString(name) });
    }
    setExercises(exercises);
  };

  const fetchUserProfile = async () => {
    if (!account) return;

    let top3Exercises = (await provider.view({
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_top_3_exercises`,
      type_arguments: [],
      arguments: [account.address],
    })) as any;
    let topExercises = top3Exercises[0];
    let topEx = topExercises.map((exercise: any) => {
      exercise.name = hexToString(exercise.name).replace("\x00", " ").trim();
      return exercise;
    });

    const workouts = await getProfileExercises();

    setUserProfile({
      total_workouts: workouts,
      top_exercises: topEx,
    });
  };

  const startExercise = async (index: number) => {
    if (!account) return;

    const payload: any = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::start_exercise`,
      typeArguments: [],
      functionArguments: [account.address, index],
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

    const payload = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::mint_nft`,
      typeArguments: [],
      functionArguments: [index],
    };

    try {
      const transaction = await signAndSubmitTransaction({
        data: payload as any,
      });
      await provider.waitForTransaction(transaction.hash);
      alert("NFT minted successfully!");
      fetchUserProfile();
      fetchUserNFTs();
    } catch (error) {
      console.error("Error minting NFT:", error);
      if (error instanceof Error) {
        alert(`Error minting NFT: ${error.message}`);
      } else {
        alert("An unknown error occurred while minting NFT");
      }
    }
  };

  const generateRandomWorkout = async () => {
    if (!account) return;
    const payload = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_random_exercise`,
      typeArguments: [],
      functionArguments: [],
    };
    try {
      const transaction = await signAndSubmitTransaction({
        data: payload as any,
      });

      await provider.waitForTransaction(transaction.hash);
      fetchUserProfile();
    } catch (error) {
      console.error("Error generating random workout:", error);
    }
  };

  const getProfileExercises: () => Promise<{ name: string; total_workouts: number }[]> = async () => {
    if (!account) return;
    let exList: any = [];

    for (let i = 0; i < 6; i++) {
      try {
        const [exercise]: any = await provider.view({
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_profile_exercise`,
          type_arguments: [],
          arguments: [account.address, i.toString()],
        });

        exList.push({
          name: hexToString(exercise.name).replace("\x00", " ").trim(),
          total_workouts: exercise.total_workouts,
        });
      } catch (error) {
        //console.error("Error getting profile exercises:", error);
      }
    }

    return exList;
  };

  const resetStats = async () => {
    if (!account) return;

    const payload = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::reset_my_stats`,
      typeArguments: [],
      functionArguments: [],
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

  const createProfile = async () => {
    if (!account) return;

    const payload = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_profile`,
      typeArguments: [],
      functionArguments: [],
    };

    try {
      await signAndSubmitTransaction({
        data: payload as any,
      });
      fetchExercises();
      fetchUserProfile();
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const fetchUserNFTs = async () => {
    if (!account) return;
    console.log("Fetching user NFTs");

    try {
      const aptosConfig = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(aptosConfig);
      const tokens = await aptos.getAccountOwnedTokens({ accountAddress: account.address });
      console.log("Fetched account owned tokens:", tokens);

      // Initialize an array to store the NFTs details
      const nfts = [];

      // Iterate through each token
      for (const token of tokens) {
        if (token.current_token_data) {
          const nftDetails = {
            name: token.current_token_data.token_name,
            description: token.current_token_data.description,
            uri: token.current_token_data.token_uri,
          };

          nfts.push(nftDetails);
        }
      }

      console.log("NFTs fetched:", nfts);
      setUserNFTs(nfts); // Store the fetched NFTs in the state
    } catch (error) {
      console.error("Error fetching user NFTs:", error);
      setUserNFTs([]); // Handle errors by clearing the NFT list
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Workout dApp</h1>
        <div className="absolute top-4 right-4">
          <div className="p-1 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:bg-[rgba(55,65,81,0.8)] hover:bg-none">
            <WalletSelector />
          </div>
        </div>
        {account ? (
          exercises.length === 0 ? (
            <div className="flex justify-center mt-16">
              <button
                className="px-6 py-3 text-lg font-semibold rounded-lg"
                onClick={createProfile}
                style={{
                  background: "none",
                  border: "2px solid transparent",
                  borderImage: "linear-gradient(to right, #3b82f6, #22c55e) 1",
                  boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                }}
              >
                Create Profile
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <ExerciseList exercises={exercises} onStartExercise={startExercise} />
              <UserProfile profile={userProfile} onMintNFT={mintNFT} onResetStats={resetStats} />
              <div className="flex justify-center mt-8">
                <button
                  className="px-6 py-3 text-lg font-semibold rounded-lg"
                  onClick={generateRandomWorkout}
                  style={{
                    background: "none",
                    border: "2px solid transparent",
                    borderImage: "linear-gradient(to right, #3b82f6, #22c55e) 1",
                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                  }}
                >
                  Generate Random Workout
                </button>
              </div>
              {userNFTs.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Your NFTs</h2>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">Name</th>
                        <th className="border px-4 py-2">Description</th>
                        <th className="border px-4 py-2">URI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userNFTs.map((nft, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2">{nft.name}</td>
                          <td className="border px-4 py-2">{nft.description}</td>
                          <td className="border px-4 py-2">{nft.uri}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
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
