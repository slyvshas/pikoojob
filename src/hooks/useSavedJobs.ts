// src/hooks/useSavedJobs.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@/lib/supabase/client';

export function useSavedJobs() {
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  // Load saved jobs from Supabase
  useEffect(() => {
    async function loadSavedJobs() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoaded(true);
          return;
        }

        const { data, error } = await supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('user_id', user.id);

        if (error) {
          console.error("Failed to load saved jobs:", error);
          toast({
            title: "Error",
            description: "Could not load your saved jobs.",
            variant: "destructive",
          });
        } else {
          setSavedJobIds(new Set(data.map(item => item.job_id)));
        }
      } catch (error) {
        console.error("Failed to load saved jobs:", error);
      }
      setIsLoaded(true);
    }

    loadSavedJobs();
  }, [toast]);

  const handleSaveJob = useCallback(async (jobId: string, jobTitle?: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save jobs.",
          variant: "destructive",
        });
        return;
      }

      // First check if already saved
      const { data: existing } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .single();

      if (existing) {
        return; // Already saved
      }

      // Save the job
      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: user.id,
          job_id: jobId
        });

      if (error) {
        throw error;
      }

      setSavedJobIds(prevIds => {
        const newIds = new Set(prevIds);
        newIds.add(jobId);
        return newIds;
      });

      if (jobTitle) {
        toast({
          title: "Job Saved",
          description: `"${jobTitle}" has been added to your saved jobs.`,
        });
      }
    } catch (error) {
      console.error("Failed to save job:", error);
      toast({
        title: "Error",
        description: "Could not save the job. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleUnsaveJob = useCallback(async (jobId: string, jobTitle?: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to manage saved jobs.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId);

      if (error) {
        throw error;
      }

      setSavedJobIds(prevIds => {
        const newIds = new Set(prevIds);
        newIds.delete(jobId);
        return newIds;
      });

      if (jobTitle) {
        toast({
          title: "Job Unsaved",
          description: `"${jobTitle}" has been removed from your saved jobs.`,
        });
      }
    } catch (error) {
      console.error("Failed to unsave job:", error);
      toast({
        title: "Error",
        description: "Could not unsave the job. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const isJobSaved = useCallback((jobId: string) => {
    return savedJobIds.has(jobId);
  }, [savedJobIds]);

  const toggleSaveJob = useCallback((jobId: string, jobTitle?: string) => {
    if (isJobSaved(jobId)) {
      handleUnsaveJob(jobId, jobTitle);
    } else {
      handleSaveJob(jobId, jobTitle);
    }
  }, [isJobSaved, handleSaveJob, handleUnsaveJob]);

  return { savedJobIds, saveJob: handleSaveJob, unsaveJob: handleUnsaveJob, isJobSaved, toggleSaveJob, isLoaded };
}
