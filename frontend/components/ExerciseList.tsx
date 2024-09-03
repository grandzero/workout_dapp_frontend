import React from "react";

interface Exercise {
  name: string;
}

interface ExerciseListProps {
  exercises: Exercise[];
  onStartExercise: (index: number) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onStartExercise }) => {
  return (
    <div>
      <h2>Exercise List</h2>
      <ul>
        {exercises.map((exercise, index) => (
          <li key={index}>
            {exercise.name}
            <button onClick={() => onStartExercise(index)}>Start Exercise</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExerciseList;
