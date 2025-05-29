// src/components/jobs/JobCard.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Briefcase, Building2, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    employmentType: string;
    experience_level: string;
    salary_range: string;
    description: string;
    requirements: string[];
    benefits: string[];
    external_apply_link: string;
    company_logo: string;
    created_at: string;
    tags: string[];
  };
}

export function JobCard({ job }: JobCardProps) {
  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (job.external_apply_link) {
      window.open(job.external_apply_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <article className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg border bg-muted">
                {job.company_logo ? (
                  <Image
                    src={job.company_logo}
                    alt={job.company_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    <Building2 className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold leading-none tracking-tight">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground">{job.company_name}</p>
              </div>
            </div>
            {job.external_apply_link && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      onClick={handleApply}
                      className="w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-shadow mt-0 px-2 py-1 text-xs sm:mt-2 sm:px-4 sm:py-2 sm:text-base"
                    >
                      <span className="relative flex items-center justify-center">
                        Apply Now
                        <ExternalLink className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Apply on company website</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{job.employmentType}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            {job.salary_range && (
              <p className="text-muted-foreground">{job.salary_range}</p>
            )}
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {job.description}
          </p>

          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
