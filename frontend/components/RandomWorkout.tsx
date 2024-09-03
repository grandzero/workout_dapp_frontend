import React, { useState } from "react";
import { Provider, Network } from "aptos";

const MODULE_ADDRESS = "YOUR_MODULE_ADDRESS";
const MODULE_NAME = "workout_dapp";

const provider = new Provider(Network.TESTNET);

interface Exercise {
  name: string;
}

const RandomWorkout: React.FC = () => {
  const [randomExercises, setRandomExercises] = useState<Exercise[]>([]);

  const generateRandomWorkout = async () => {
    try {
      const exercises = (await provider.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_seven_exercises`,
        type_arguments: [],
        arguments: [MODULE_ADDRESS],
      })) as Exercise[];
      setRandomExercises(exercises);
    } catch (error) {
      console.error("Error generating random workout:", error);
    }
  };

  return (
    <div>
      <h2>Random Workout</h2>
      <button onClick={generateRandomWorkout}>Generate Random Workout</button>
      <ul>
        {randomExercises.map((exercise, index) => (
          <li key={index}>{exercise.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default RandomWorkout;
