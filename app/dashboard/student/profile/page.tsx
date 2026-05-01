import { getProfileData } from "./_lib/getProfileData";
import { ProfilePage } from "./_components/ProfilePage";

export default async function ProfilePageRoute() {
  const data = await getProfileData();
  return <ProfilePage data={data} />;
}
