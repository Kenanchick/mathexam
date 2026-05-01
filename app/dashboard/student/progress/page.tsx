import { getProgressData } from "./_lib/getProgressData";
import { ProgressPage } from "./_components/ProgressPage";

export default async function ProgressPageRoute() {
  const data = await getProgressData();
  return <ProgressPage data={data} />;
}
