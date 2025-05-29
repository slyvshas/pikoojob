// src/components/jobs/SavedJobsList.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { JobPosting } from '@/types';
import { JobCard } from './JobCard';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { getAllJobs, getJobsByIds } from '@/lib/jobs'; // Remove getJobsByIds
import { BookmarkX, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { Button } from '../ui/button';
import { mapDbJobToJobPosting } from '@/types';
import type { Job as DbJob } from '@/lib/jobs';
import { createClient } from '@/lib/supabase/client'; // Import client-side supabase

export default function SavedJobsList() {
  const { savedJobIds, isJobSaved, toggleSaveJob, isLoaded: savedJobsHookLoaded } = useSavedJobs();
  const [savedJobs, setSavedJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedJobDetailsClientSide() {
      setIsLoading(true);
      // Only fetch if the hook has loaded and there are saved job IDs
      if (savedJobsHookLoaded && savedJobIds.size > 0) {
        try {
          const supabase = createClient(); // Use client-side supabase
          const { data: jobDetails, error } = await supabase
            .from('job_postings')
            .select('id, title, company_name, location, employment_type, experience_level, salary_range, description, requirements, benefits, external_apply_link, company_logo, created_at, tags') // Corrected from job_type
            .in('id', Array.from(savedJobIds))
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching saved job details client-side:', error);
            // Optionally show a toast error here
            setSavedJobs([]); // Set to empty array on error
          } else {
             // Map the fetched data to JobPosting type if necessary, or use as is if types match
             // Assuming fetched data structure from client is compatible, otherwise map explicitly
             const mappedJobDetails = (jobDetails as DbJob[]).map(mapDbJobToJobPosting);
             setSavedJobs(mappedJobDetails);
          }
        } catch (error) {
          console.error('Unexpected error fetching saved job details client-side:', error);
           setSavedJobs([]); // Set to empty array on unexpected error
        } finally {
          setIsLoading(false);
        }
      } else if (savedJobsHookLoaded && savedJobIds.size === 0) {
         // If hook is loaded but no saved jobs, set loading false and savedJobs to empty
        setSavedJobs([]);
        setIsLoading(false);
      } else if (!savedJobsHookLoaded) {
        // If hook is not loaded yet, keep loading true. The effect will re-run when it loads.
         setIsLoading(true); // Keep loading true while hook data is awaited
      }
    }

    fetchSavedJobDetailsClientSide();
  }, [savedJobIds, savedJobsHookLoaded]); // Depend on savedJobIds and hook loaded status

  // Remove the useMemo for filtering as we now fetch only saved jobs
  // const savedJobs = useMemo(() => {
  //   if (!savedJobsHookLoaded || isLoading) return [];
  //   return allJobs.filter(job => savedJobIds.has(job.id));
  // }, [allJobs, savedJobIds, savedJobsHookLoaded, isLoading]);

  // Keep the loading check, but adjust for the new state structure
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
              // isLoaded prop is no longer strictly necessary for JobCard based on its likely implementation
              // but can be kept if JobCard itself has loading states based on individual save status.
              // Assuming JobCard doesn't need this prop based on the new SavedJobsList logic:
              // isLoaded={savedJobsHookLoaded}
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
