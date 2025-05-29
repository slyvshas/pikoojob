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
    <Link href={`/jobs/${job.id}`} className="text-decoration-none">
      <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition-all">
        <div className="card-body p-4">
          {/* Header with Company Logo and Title */}
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div className="d-flex align-items-center gap-3 flex-grow-1 me-2">
              <div className="position-relative flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                {job.company_logo ? (
                  <Image
                    src={job.company_logo}
                    alt={job.company_name}
                    fill
                    className="rounded-3 object-fit-cover"
                  />
                ) : (
                  <div className="d-flex h-100 w-100 align-items-center justify-content-center bg-light rounded-3">
                    <Building2 className="text-muted" style={{ width: '24px', height: '24px' }} />
                  </div>
                )}
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <h3 className="h5 mb-1 text-dark fw-semibold text-truncate">{job.title}</h3>
                <p className="text-muted mb-0 small text-truncate">{job.company_name}</p>
              </div>
            </div>
            {job.external_apply_link && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      onClick={handleApply}
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                    >
                      Apply Now
                      <ExternalLink className="ms-1" style={{ width: '14px', height: '14px' }} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Apply on company website</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Job Details */}
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-3 mb-2">
              <div className="d-flex align-items-center text-muted small">
                <MapPin className="me-1" style={{ width: '16px', height: '16px' }} />
                <span>{job.location}</span>
              </div>
              <div className="d-flex align-items-center text-muted small">
                <Briefcase className="me-1" style={{ width: '16px', height: '16px' }} />
                <span>{job.employmentType}</span>
              </div>
              <div className="d-flex align-items-center text-muted small">
                <Clock className="me-1" style={{ width: '16px', height: '16px' }} />
                <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            {job.salary_range && (
              <p className="text-muted mb-0 small">{job.salary_range}</p>
            )}
          </div>

          {/* Description */}
          <p className="text-muted small mb-3" style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {job.description}
          </p>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-primary bg-opacity-10 text-primary border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
