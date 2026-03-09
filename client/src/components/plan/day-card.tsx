import { Card } from "../ui/card";
import { Dumbbell } from "lucide-react";
import ExerciseRow from "./exercise-row";
import type { DaySchedule } from "../../types";

const DayCard = ({ schedule }: { schedule: DaySchedule }) => {
  return (
    <Card variant="bordered" className="overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{schedule.day}</h3>
          <p className="text-sm text-accent">{schedule.focus}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Dumbbell className="w-4 h-4" />
          <span>{schedule.exercises.length} exercises</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs uppercase tracking-wider">
              <th className="text-left py-2 pr-4 font-medium">Excercise</th>
              <th className="py-2 px-4 font-medium">Sets x Reps</th>
              <th className="py-2 px-4 font-medium">Rest</th>
              <th className="py-2 px-4 font-medium">RPE</th>
            </tr>
          </thead>

          <tbody>
            {schedule.exercises.map((exercise, key) => (
              <ExerciseRow exercise={exercise} index={key} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default DayCard;
