import { createClient } from './supabase/client';
import { createSupabaseServerClient } from './supabase/server-actions';

export interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range: string;
  description: string;
  requirements: string[];
  benefits: string[];
  external_apply_link: string;
  company_logo: string;
  created_at: string;
  tags: string[];
}

export async function getAllJobs() {
  const supabase = await createSupabaseServerClient();
  const { data: jobs, error } = await supabase
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }

  return jobs as Job[];
}

export async function getJobById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: job, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    throw error;
  }

  return job as Job;
}

export async function getSavedJobs(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: savedJobs, error } = await supabase
    .from('saved_jobs')
    .select('job_id, user_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching saved jobs:', error);
    throw error;
  }

  const jobIds = savedJobs.map(saved => saved.job_id);

  // If there are no saved job IDs, return an empty array immediately
  if (jobIds.length === 0) {
    return [];
  }

  const { data: jobs, error: jobsError } = await supabase
    .from('job_postings')
    .select('id, title, company_name, location, employment_type, experience_level, salary_range, description, requirements, benefits, external_apply_link, company_logo, created_at, tags')
    .in('id', jobIds)
    .order('created_at', { ascending: false });

  if (jobsError) {
    console.error('Error fetching saved job details:', jobsError);
    throw jobsError;
  }

  // Explicitly map the fetched data to ensure it's a plain object array
  return jobs.map(job => ({
    id: job.id,
    title: job.title,
    company_name: job.company_name,
    location: job.location,
    employment_type: job.employment_type,
    experience_level: job.experience_level,
    salary_range: job.salary_range,
    description: job.description,
    requirements: Array.isArray(job.requirements) ? job.requirements.map(req => String(req)) : [],
    benefits: Array.isArray(job.benefits) ? job.benefits.map(ben => String(ben)) : [],
    external_apply_link: job.external_apply_link,
    company_logo: job.company_logo,
    created_at: String(job.created_at),
    tags: Array.isArray(job.tags) ? job.tags.map(tag => String(tag)) : [],
  })) as Job[];
}

export async function saveJob(userId: string, jobId: string) {
  const supabase = await createSupabaseServerClient();
  
  // First check if the job exists
  const { data: job, error: jobError } = await supabase
    .from('job_postings')
    .select('id')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    console.error('Error verifying job:', jobError);
    throw new Error('Job not found');
  }

  // Check if already saved
  const { data: existing, error: checkError } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('user_id', userId)
    .eq('job_id', jobId)
    .single();

  if (existing) {
    return; // Already saved, no need to do anything
  }

  // Save the job
  const { error } = await supabase
    .from('saved_jobs')
    .insert([
      {
        user_id: userId,
        job_id: jobId
      }
    ]);

  if (error) {
    console.error('Error saving job:', error);
    throw error;
  }
}

export async function unsaveJob(userId: string, jobId: string) {
  const supabase = await createSupabaseServerClient();
  
  // Check if the job is actually saved
  const { data: existing, error: checkError } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('user_id', userId)
    .eq('job_id', jobId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking saved job:', checkError);
    throw checkError;
  }

  if (!existing) {
    return; // Not saved, no need to do anything
  }

  // Remove the saved job
  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('user_id', userId)
    .eq('job_id', jobId);

  if (error) {
    console.error('Error unsaving job:', error);
    throw error;
  }
}

export async function isJobSaved(userId: string, jobId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking if job is saved:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isJobSaved:', error);
    return false;
  }
}

export async function addJob(jobData: Omit<Job, 'id' | 'created_at'>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('job_postings')
    .insert([jobData])
    .select()
    .single();

  if (error) {
    console.error('Error adding job:', error);
    throw error;
  }

  return data as Job;
}

export async function getJobsByIds(ids: string[]): Promise<Job[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data: jobs, error } = await supabase
    .from('job_postings')
    .select('id, title, company_name, location, employment_type, experience_level, salary_range, description, requirements, benefits, external_apply_link, company_logo, created_at, tags')
    .in('id', ids)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs by IDs:', error);
    throw error;
  }

  return jobs as Job[];
} 