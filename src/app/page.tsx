import { getAllJobs } from '@/lib/jobs';
import JobListings from '@/components/jobs/JobListings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Jobs | PikooJobs',
  description: 'Search and filter through available job opportunities.',
};

export default async function HomePage() {
  // Fetching on server component. This function (getAllJobs) will re-run
  // when this page is revalidated. Revalidation is typically triggered
  // by a server action (like posting a new job) that calls `revalidatePath('/')`.
  // This ensures that the `jobs` variable always contains the latest data.
  const jobs = await getAllJobs();
  console.log('Fetched jobs:', jobs); // Debug log

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-center mb-2">Welcome to PikooJobs</h1>
        <p className="mb-2">Find your next career opportunity</p>
        <button>Get Started</button>
      </div>
      
      <div className="grid mt-4">
        <div className="card">
          <h2>Featured Jobs</h2>
          <p>Browse through our latest job listings</p>
        </div>
        <div className="card">
          <h2>For Employers</h2>
          <p>Post jobs and find the best talent</p>
        </div>
        <div className="card">
          <h2>Career Resources</h2>
          <p>Tips and guides for your job search</p>
        </div>
      </div>

      <div className="mt-4">
        <JobListings initialJobs={jobs} />
      </div>
    </div>
  );
}
