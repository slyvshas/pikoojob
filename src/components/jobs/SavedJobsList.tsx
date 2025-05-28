// src/components/jobs/SavedJobsList.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { JobPosting } from '@/types';
import { JobCard } from './JobCard';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { getAllJobs } from '@/lib/jobs'; // We'll fetch all jobs and filter client-side
import { BookmarkX, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { Button } from '../ui/button';

export default function SavedJobsList() {
  const { savedJobIds, isJobSaved, toggleSaveJob, isLoaded: savedJobsHookLoaded } = useSavedJobs();
  const [allJobs, setAllJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      setIsLoading(true);
      const jobs = await getAllJobs();
      setAllJobs(jobs);
      setIsLoading(false);
    }
    if (savedJobsHookLoaded) { // Only fetch jobs once the hook has loaded saved IDs
        fetchJobs();
    }
  }, [savedJobsHookLoaded]);

  const savedJobs = useMemo(() => {
    if (!savedJobsHookLoaded || isLoading) return [];
    return allJobs.filter(job => savedJobIds.has(job.id));
  }, [allJobs, savedJobIds, savedJobsHookLoaded, isLoading]);

  if (isLoading || !savedJobsHookLoaded) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Your Saved Jobs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Your Saved Jobs</h1>
      {savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {savedJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={isJobSaved(job.id)}
              onToggleSave={toggleSaveJob}
              isLoaded={savedJobsHookLoaded}
            />
          ))}
        </div>
      ) : (
        <Alert className="max-w-md mx-auto">
          <BookmarkX className="h-5 w-5" />
          <AlertTitle>No Saved Jobs Yet</AlertTitle>
          <AlertDescription>
            You haven&apos;t saved any jobs. Start exploring and save jobs you&apos;re interested in!
             <Button variant="link" asChild className="p-0 h-auto ml-1">
                <Link href="/">Find Jobs</Link>
             </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
