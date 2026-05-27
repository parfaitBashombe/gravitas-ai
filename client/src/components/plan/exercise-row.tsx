import type { Exercise } from "../../types";

const rpeBadge = (rpe: number) => {
  if (rpe >= 8) return "text-red-400 bg-red-500/[0.08] border-red-500/20";
  if (rpe >= 7) return "text-amber-400 bg-amber-500/[0.08] border-amber-500/20";
  return "text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20";
};

const ExerciseRow = ({
  exercise,
  index,
}: {
  exercise: Exercise;
  index: number;
}) => {
  return (
    <tr className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors group">
      <td className="py-3 px-5">
        <div className="flex items-start gap-3">
          <span className="text-[10px] text-muted/30 mt-0.5 w-4 shrink-0 tabular-nums group-hover:text-muted/50 transition-colors">
            {index + 1}
          </span>
          <div>
            <p className="font-medium text-sm truncate">{exercise.name}</p>
            {exercise.notes && (
              <p className="text-xs text-muted/60 mt-0.5 leading-snug">
                {exercise.notes}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="py-3 px-4 text-center whitespace-nowrap">
        <span className="text-sm font-semibold tabular-nums">
          {exercise.sets}
        </span>
        <span className="text-muted/30 mx-1 text-xs">×</span>
        <span className="text-sm text-muted/70">{exercise.reps}</span>
      </td>

      <td className="py-3 px-3 text-center text-xs text-muted/60 hidden sm:table-cell">
        {exercise.rest}
      </td>

      <td className="py-3 px-4 text-center">
        <span
          className={`inline-block text-xs font-semibold tabular-nums px-2 py-0.5 rounded-md border ${rpeBadge(exercise.rpe)}`}
        >
          {exercise.rpe}
        </span>
      </td>
    </tr>
  );
};

export default ExerciseRow;
