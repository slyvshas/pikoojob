import { getAllJobs } from '@/lib/jobs';
import JobListings from '@/components/jobs/JobListings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Jobs | Career Compass',
  description: 'Search and filter through available job opportunities.',
};

export default async function HomePage() {
  // Fetching on server component, then passing to client component
  const jobs = await getAllJobs();

  return (
    <JobListings initialJobs={jobs} />
  );
}
