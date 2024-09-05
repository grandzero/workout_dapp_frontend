import React from "react";
import { FaDumbbell, FaRunning, FaBiking, FaSwimmer } from "react-icons/fa";
import { MdOutlineSportsGymnastics } from "react-icons/md";

interface Exercise {
  name: string;
}

interface ExerciseListProps {
  exercises: Exercise[];
  onStartExercise: (index: number) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onStartExercise }) => {
  const getExerciseIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "weightlifting":
        return <FaDumbbell />;
      case "running":
        return <FaRunning />;
      case "cycling":
        return <FaBiking />;
      case "swimming":
        return <FaSwimmer />;
      case "yoga":
        return <FaSwimmer />;
      case "boxing":
        return <MdOutlineSportsGymnastics />;
      default:
        return <MdOutlineSportsGymnastics />;
    }
  };

  return (
    <div className="container mx-auto px-4 relative">
      <h2 className="text-2xl font-bold mb-4 text-center">Exercise List</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {exercises.map((exercise, index) => (
          <button
            key={index}
            onClick={() => onStartExercise(index)}
            className="flex flex-col items-center justify-center p-3 border border-white rounded-md hover:border-opacity-100 transition-all duration-300 w-24 h-24 mb-2"
            style={{
              boxShadow: "0 0 5px rgba(255, 255, 255, 0.3)",
              background: "transparent",
            }}
          >
            <div className="text-2xl mb-1">{getExerciseIcon(exercise.name)}</div>
            <span className="text-xs font-semibold text-center">{exercise.name.slice(1)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExerciseList;
