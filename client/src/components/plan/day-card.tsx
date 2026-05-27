import ExerciseRow from "./exercise-row";
import type { DaySchedule } from "../../types";

const abbr = (day: string) => day.slice(0, 3).toUpperCase();

const DayCard = ({ schedule }: { schedule: DaySchedule }) => {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg tracking-wider">
            {abbr(schedule.day)}
          </span>
          <div>
            <h3 className="font-semibold text-sm leading-tight">
              {schedule.focus}
            </h3>
            <p className="text-xs text-muted mt-0.5">{schedule.day}</p>
          </div>
        </div>
        <span className="text-xs text-muted/60 tabular-nums shrink-0">
          {schedule.exercises.length} ex
        </span>
      </div>

      {/* Table — fixed layout, no horizontal scroll */}
      <div className="border-t border-white/[0.06]">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-auto" />
            <col className="w-28" />
            <col className="w-16 hidden sm:table-column" />
            <col className="w-14" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-2.5 px-5 text-[10px] font-medium text-muted/60 uppercase tracking-wider">
                Exercise
              </th>
              <th className="py-2.5 px-3 text-[10px] font-medium text-muted/60 uppercase tracking-wider text-center">
                Sets × Reps
              </th>
              <th className="py-2.5 px-3 text-[10px] font-medium text-muted/60 uppercase tracking-wider text-center hidden sm:table-cell">
                Rest
              </th>
              <th className="py-2.5 px-3 text-[10px] font-medium text-muted/60 uppercase tracking-wider text-center">
                RPE
              </th>
            </tr>
          </thead>
          <tbody>
            {schedule.exercises.map((exercise, key) => (
              <ExerciseRow exercise={exercise} index={key} key={key} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DayCard;
