// src/components/jobs/SavedJobsList.tsx
"use client";

import { useState, useEffect } from 'react';
import type { JobPosting } from '@/types';
import { JobCard } from './JobCard';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { BookmarkX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { Button } from '../ui/button';
import { mapDbJobToJobPosting } from '@/types';
import type { Job as DbJob } from '@/lib/jobs';
import { createClient } from '@/lib/supabase/client';

export default function SavedJobsList() {
  const { savedJobIds, isJobSaved, toggleSaveJob, isLoaded: savedJobsHookLoaded } = useSavedJobs();
  const [savedJobs, setSavedJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedJobDetailsClientSide() {
      setIsLoading(true);
      if (savedJobsHookLoaded && savedJobIds.size > 0) {
        try {
          const supabase = createClient();
          const { data: jobDetails, error } = await supabase
            .from('job_postings')
            .select('id, title, company_name, location, employment_type, experience_level, salary_range, description, requirements, benefits, external_apply_link, company_logo, created_at, tags')
            .in('id', Array.from(savedJobIds))
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching saved job details client-side:', error);
            setSavedJobs([]);
          } else {
            const mappedJobDetails = (jobDetails as DbJob[]).map(mapDbJobToJobPosting);
            setSavedJobs(mappedJobDetails);
          }
        } catch (error) {
          console.error('Unexpected error fetching saved job details client-side:', error);
          setSavedJobs([]);
        } finally {
          setIsLoading(false);
        }
      } else if (savedJobsHookLoaded && savedJobIds.size === 0) {
        setSavedJobs([]);
        setIsLoading(false);
      } else if (!savedJobsHookLoaded) {
        setIsLoading(true);
      }
    }

    fetchSavedJobDetailsClientSide();
  }, [savedJobIds, savedJobsHookLoaded]);

  if (isLoading || !savedJobsHookLoaded) {
    return (
      <div className="container py-4">
        <h1 className="h2 mb-4">Your Saved Jobs</h1>
        <div className="row g-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4">
              <Skeleton className="h-100 w-100 rounded-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">Your Saved Jobs</h1>
      {savedJobs.length > 0 ? (
        <div className="row g-4">
          {savedJobs.map(job => (
            <div key={job.id} className="col-12 col-md-6 col-lg-4">
              <JobCard
                job={job}
                isSaved={isJobSaved(job.id)}
                onToggleSave={toggleSaveJob}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <Alert className="text-center">
              <BookmarkX className="h-5 w-5 mb-2" />
              <AlertTitle>No Saved Jobs Yet</AlertTitle>
              <AlertDescription>
                You haven&apos;t saved any jobs. Start exploring and save jobs you&apos;re interested in!
                <Button variant="link" asChild className="p-0 h-auto ms-1">
                  <Link href="/">Find Jobs</Link>
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
}
