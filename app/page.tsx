import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getStationsWithPlaces } from '@/lib/route-explore';
import HomeExplore from './components/explore/HomeExplore';

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  let stations: Awaited<ReturnType<typeof getStationsWithPlaces>> = [];
  try {
    stations = await getStationsWithPlaces();
  } catch {
    stations = [];
  }

  const firstName =
    typeof user.name === 'string' && user.name.trim() ? user.name.trim() : 'คุณ';

  return <HomeExplore userFirstName={firstName} stations={stations} />;
}
