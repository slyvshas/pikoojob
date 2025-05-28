// src/components/jobs/JobCard.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import type { JobPosting } from '@/types'; // Ensure this type matches the new structure
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, MapPin, Briefcase, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface JobCardProps {
  job: JobPosting;
  isSaved: boolean;
  onToggleSave: (jobId: string, jobTitle: string) => void;
  isLoaded: boolean; // from useSavedJobs to prevent hydration issues with save button
}

export function JobCard({ job, isSaved, onToggleSave, isLoaded }: JobCardProps) {
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if card itself is a link
    e.stopPropagation();
    onToggleSave(job.id, job.title);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <Link href={`/jobs/${job.id}`} className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              {job.companyLogoUrl && ( // Updated from job.companyLogo
                <Image
                  src={job.companyLogoUrl} // Updated from job.companyLogo
                  alt={`${job.companyName} logo`}
                  width={48}
                  height={48}
                  className="rounded-md border"
                  data-ai-hint={job.companyLogoAiHint || "company logo"} // Updated from job.dataAiHint
                />
              )}
              <div>
                <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Building2 size={14} className="mr-1.5 shrink-0" /> {job.companyName}
                </p>
              </div>
            </div>
              {isLoaded && (
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSaveClick}
                            aria-label={isSaved ? 'Unsave job' : 'Save job'}
                            className="shrink-0 text-muted-foreground hover:text-primary data-[saved=true]:text-primary"
                            data-saved={isSaved}
                        >
                            <Bookmark size={20} className={cn(isSaved && "fill-primary")} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isSaved ? 'Unsave job' : 'Save job'}</p>
                    </TooltipContent>
                </Tooltip>
              )}
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground flex-grow pb-4">
          <p className="line-clamp-2 mb-3">{job.description}</p>
          <div className="space-y-1.5">
            <div className="flex items-center">
              <MapPin size={14} className="mr-1.5 shrink-0" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center">
              <Briefcase size={14} className="mr-1.5 shrink-0" />
              <span>{job.employmentType}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-4">
          <div className="flex flex-wrap gap-2">
            {job.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
