import { Info } from "lucide-react";
import type { Exercise } from "../../types";

const ExerciseRow = ({
  exercise,
  index,
}: {
  exercise: Exercise;
  index: number;
}) => {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4">
        <div className="flex items-start gap-3">
          <span className="text-xs text-muted w-5">{index + 1}.</span>
          <div>
            <p className="font-medium">{exercise.name}</p>
            {exercise.notes && (
              <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {exercise.notes}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="py-3 px-4 text-center whitespace-nowrap">
        <span className="text-accent font-medium">{exercise.sets}</span>
        <span className="text-muted"> x </span>
        <span>{exercise.reps}</span>
      </td>

      <td className="py-3 px-4 text-center">
        <span className="text-muted">{exercise.rest}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium 
            ${
              exercise.rpe >= 8
                ? `bg-red-500/10 text-red-400`
                : exercise.rpe >= 7
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-green-500/10 text-green-400"
            }`}
        >
          {exercise.rpe}
        </span>
      </td>
    </tr>
  );
};

export default ExerciseRow;
