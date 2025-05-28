// src/components/jobs/JobDetailClient.tsx
"use client";

import Image from 'next/image';
// Link component is no longer needed for this specific button, but might be used elsewhere.
// import Link from 'next/link';
import type { JobPosting } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button'; // Imported buttonVariants
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, ExternalLink, MapPin, Briefcase, Building2, CalendarDays, DollarSign } from 'lucide-react';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface JobDetailClientProps {
  job: JobPosting;
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
  const { isJobSaved, toggleSaveJob, isLoaded: savedJobsLoaded } = useSavedJobs();

  const formattedPostedDate = new Date(job.postedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-card p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div className="flex items-start gap-4">
          {job.companyLogoUrl && (
            <Image
              src={job.companyLogoUrl}
              alt={`${job.companyName} logo`}
              width={64}
              height={64}
              className="rounded-lg border hidden sm:block"
              data-ai-hint={job.companyLogoAiHint || "company logo"}
            />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">{job.title}</h1>
            <div className="flex items-center text-muted-foreground text-md">
              <Building2 size={18} className="mr-2 shrink-0" />
              <span>{job.companyName}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 items-start sm:items-center md:items-end w-full md:w-auto shrink-0">
          <a
            href={job.externalApplyLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full sm:w-auto md:w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            )}
          >
            Apply Now <ExternalLink size={18} className="ml-2" />
          </a>
          {savedJobsLoaded && (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                    variant="outline"
                    size="lg"
                    onClick={() => toggleSaveJob(job.id, job.title)}
                    aria-label={isJobSaved(job.id) ? 'Unsave job' : 'Save job'}
                    className="w-full sm:w-auto md:w-full"
                    >
                    <Bookmark size={18} className={cn("mr-2", isJobSaved(job.id) && "fill-primary text-primary")} />
                    {isJobSaved(job.id) ? 'Saved' : 'Save Job'}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isJobSaved(job.id) ? 'Remove from saved jobs' : 'Add to saved jobs'}</p>
                </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 text-sm">
        <div className="flex items-center bg-background p-3 rounded-md">
          <MapPin size={20} className="mr-3 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium">{job.location}</p>
          </div>
        </div>
        <div className="flex items-center bg-background p-3 rounded-md">
          <Briefcase size={20} className="mr-3 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Job Type</p>
            <p className="font-medium">{job.employmentType}</p>
          </div>
        </div>
        <div className="flex items-center bg-background p-3 rounded-md">
          <CalendarDays size={20} className="mr-3 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Date Posted</p>
            <p className="font-medium">{formattedPostedDate}</p>
          </div>
        </div>
        {job.salary && (
          <div className="flex items-center bg-background p-3 rounded-md md:col-span-3">
            <DollarSign size={20} className="mr-3 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Salary</p>
              <p className="font-medium">{job.salary}</p>
            </div>
          </div>
        )}
      </div>
      
      <Separator className="my-6 sm:my-8" />

      {job.fullDescription && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Job Description</h2>
          <div
            className="prose prose-sm max-w-none text-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: job.fullDescription }}
          />
        </div>
      )}

      {job.companyDescription && (
         <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">About {job.companyName}</h2>
           <p className="text-foreground/90 leading-relaxed">{job.companyDescription || "No company description provided."}</p>
        </div>
      )}

      {job.requirements && job.requirements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Requirements</h2>
          <ul className="list-disc list-inside space-y-1 text-foreground/90">
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {job.tags && job.tags.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
