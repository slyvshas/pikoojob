import { getJobById } from '@/lib/jobs';
import JobDetailClient from '@/components/jobs/JobDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const job = await getJobById(params.id);

  if (!job) {
    return {
      title: 'Job Not Found | Career Compass',
    };
  }

  return {
    title: `${job.title} at ${job.companyName} | Career Compass`,
    description: job.description,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const job = await getJobById(params.id);

  if (!job) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft size={16} className="mr-2" />
          Back to Listings
        </Link>
      </Button>
      <JobDetailClient job={job} />
    </div>
  );
}

// Enable ISR or dynamic rendering for job pages
export const revalidate = 60; // Revalidate every 60 seconds

// Optional: Pre-render paths if you have a known set of jobs at build time
// export async function generateStaticParams() {
//   const jobs = await getAllJobs(); // Assuming getAllJobs is available
//   return jobs.map((job) => ({
//     id: job.id,
//   }));
// }

