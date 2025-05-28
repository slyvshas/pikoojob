
import { getAllJobs } from '@/lib/jobs';
import JobListings from '@/components/jobs/JobListings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Jobs | Career Compass',
  description: 'Search and filter through available job opportunities.',
};

export default async function HomePage() {
  // Fetching on server component. This function (getAllJobs) will re-run
  // when this page is revalidated. Revalidation is typically triggered
  // by a server action (like posting a new job) that calls `revalidatePath('/')`.
  // This ensures that the `jobs` variable always contains the latest data.
  const jobs = await getAllJobs();

  return (
    <JobListings initialJobs={jobs} />
  );
}
