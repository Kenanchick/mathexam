export interface TeacherStat {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  trend: "up" | "down" | "neutral";
  variant: "blue" | "green" | "orange" | "purple";
}
