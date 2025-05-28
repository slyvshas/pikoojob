// src/components/jobs/JobListings.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { JobPosting } from '@/types';
import { JobCard } from './JobCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, XCircle, Filter, ListRestart } from 'lucide-react';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

interface JobListingsProps {
  initialJobs: JobPosting[];
}

const ALL_TYPES_VALUE = "all-types";
const ALL_LOCATIONS_VALUE = "all-locations";

export default function JobListings({ initialJobs }: JobListingsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const { isJobSaved, toggleSaveJob, isLoaded: savedJobsLoaded } = useSavedJobs();

  const [clientLoaded, setClientLoaded] = useState(false);
  useEffect(() => {
    setClientLoaded(true);
  }, []);


  const uniqueEmploymentTypes = useMemo(() => {
    const types = new Set(initialJobs.map(job => job.employmentType));
    return Array.from(types);
  }, [initialJobs]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(initialJobs.map(job => job.location));
    return Array.from(locations);
  }, [initialJobs]);

  const filteredJobs = useMemo(() => {
    return initialJobs.filter(job => {
      const matchesSearchTerm = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                job.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesEmploymentType = employmentTypeFilter ? job.employmentType === employmentTypeFilter : true;
      const matchesLocation = locationFilter ? job.location === locationFilter : true;
      return matchesSearchTerm && matchesEmploymentType && matchesLocation;
    });
  }, [initialJobs, searchTerm, employmentTypeFilter, locationFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setEmploymentTypeFilter('');
    setLocationFilter('');
  };
  
  const showResetButton = searchTerm || employmentTypeFilter || locationFilter;

  if (!clientLoaded) {
     return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="p-4 sm:p-6 bg-card rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div className="relative sm:col-span-2 md:col-span-1 lg:col-span-2">
            <label htmlFor="search-jobs" className="block text-sm font-medium text-foreground mb-1">
              Search Jobs
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              id="search-jobs"
              type="text"
              placeholder="Job title, company, or keyword"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 w-full"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 mt-3 h-7 w-7"
                onClick={() => setSearchTerm('')}
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <div>
            <label htmlFor="filter-employment-type" className="block text-sm font-medium text-foreground mb-1">
              Employment Type
            </label>
            <Select 
              value={employmentTypeFilter || ALL_TYPES_VALUE} 
              onValueChange={(value) => setEmploymentTypeFilter(value === ALL_TYPES_VALUE ? '' : value)}
            >
              <SelectTrigger id="filter-employment-type" className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TYPES_VALUE}>All Types</SelectItem>
                {uniqueEmploymentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="filter-location" className="block text-sm font-medium text-foreground mb-1">
              Location
            </label>
            <Select 
              value={locationFilter || ALL_LOCATIONS_VALUE} 
              onValueChange={(value) => setLocationFilter(value === ALL_LOCATIONS_VALUE ? '' : value)}
            >
              <SelectTrigger id="filter-location" className="w-full">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LOCATIONS_VALUE}>All Locations</SelectItem>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showResetButton && (
            <div className="lg:col-start-4">
               <Button onClick={resetFilters} variant="outline" className="w-full">
                <ListRestart size={16} className="mr-2" /> Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobsLoaded && isJobSaved(job.id)}
              onToggleSave={toggleSaveJob}
              isLoaded={savedJobsLoaded}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Filter size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Jobs Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
          {showResetButton && (
             <Button onClick={resetFilters} variant="outline" className="mt-4">
                <ListRestart size={16} className="mr-2" /> Reset Filters
              </Button>
          )}
        </div>
      )}
    </div>
  );
}
