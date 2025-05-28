// src/hooks/useSavedJobs.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

const SAVED_JOBS_KEY = 'careerCompassSavedJobIds';

export function useSavedJobs() {
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedJobs = localStorage.getItem(SAVED_JOBS_KEY);
      if (storedJobs) {
        setSavedJobIds(new Set(JSON.parse(storedJobs)));
      }
    } catch (error) {
      console.error("Failed to load saved jobs from localStorage:", error);
      // Optionally, clear corrupted data
      // localStorage.removeItem(SAVED_JOBS_KEY);
    }
    setIsLoaded(true);
  }, []);

  const updateLocalStorage = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(Array.from(ids)));
    } catch (error) {
      console.error("Failed to update localStorage:", error);
      toast({
        title: "Error",
        description: "Could not update saved jobs. LocalStorage might be full or disabled.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const saveJob = useCallback((jobId: string, jobTitle?: string) => {
    setSavedJobIds(prevIds => {
      const newIds = new Set(prevIds);
      newIds.add(jobId);
      updateLocalStorage(newIds);
      if (jobTitle) {
        toast({
          title: "Job Saved",
          description: `"${jobTitle}" has been added to your saved jobs.`,
        });
      }
      return newIds;
    });
  }, [updateLocalStorage, toast]);

  const unsaveJob = useCallback((jobId: string, jobTitle?: string) => {
    setSavedJobIds(prevIds => {
      const newIds = new Set(prevIds);
      newIds.delete(jobId);
      updateLocalStorage(newIds);
      if (jobTitle) {
        toast({
          title: "Job Unsaved",
          description: `"${jobTitle}" has been removed from your saved jobs.`,
        });
      }
      return newIds;
    });
  }, [updateLocalStorage, toast]);

  const isJobSaved = useCallback((jobId: string) => {
    return savedJobIds.has(jobId);
  }, [savedJobIds]);

  const toggleSaveJob = useCallback((jobId: string, jobTitle?: string) => {
    if (isJobSaved(jobId)) {
      unsaveJob(jobId, jobTitle);
    } else {
      saveJob(jobId, jobTitle);
    }
  }, [isJobSaved, saveJob, unsaveJob]);

  return { savedJobIds, saveJob, unsaveJob, isJobSaved, toggleSaveJob, isLoaded };
}
