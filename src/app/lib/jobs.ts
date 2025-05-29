import type { JobPosting, JobPostingFormData } from '@/types';
import { createClient } from '@/lib/supabase/server';
import type { DbJobPosting } from '@/types_db';

// Helper to map Supabase's snake_case to our camelCase JobPosting type
// Supabase client v2+ does this automatically for SELECT queries.
function dbToAppJobPosting(dbJob: DbJobPosting): JobPosting {
  return {
    id: dbJob.id,
    title: dbJob.title,
    companyName: dbJob.company_name,
    companyLogoUrl: dbJob.company_logo_url,
    companyLogoAiHint: dbJob.company_logo_ai_hint,
    companyDescription: dbJob.company_description,
    location: dbJob.location,
    description: dbJob.description,
    fullDescription: dbJob.full_description,
    requirements: dbJob.requirements || [],
    employmentType: dbJob.employment_type,
    salary: dbJob.salary,
    postedDate: dbJob.posted_date, // Assuming it's already a string in ISO format
    externalApplyLink: dbJob.external_apply_link,
    tags: dbJob.tags || [],
    createdBy: dbJob.created_by,
    createdAt: dbJob.created_at,
    updatedAt: dbJob.updated_at,
  };
}


export async function getAllJobs(): Promise<JobPosting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .order('posted_date', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
  // Supabase client automatically maps snake_case to camelCase
  return data.map(job => job as unknown as JobPosting);
}

export async function getJobById(id: string): Promise<JobPosting | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // PostgREST error for "No rows found"
        console.log(`Job with id ${id} not found.`);
    } else {
        console.error(`Error fetching job by id ${id}:`, error);
    }
    return undefined;
  }
  // Supabase client automatically maps snake_case to camelCase
  return data as unknown as JobPosting;
}

export async function addJob(jobData: JobPostingFormData, userId: string): Promise<JobPosting> {
  const supabase = createClient();

  const jobToInsert = {
    title: jobData.title,
    company_name: jobData.companyName,
    company_logo_url: jobData.companyLogoUrl || `https://placehold.co/64x64.png?text=${jobData.companyName.substring(0,2)}`,
    company_logo_ai_hint: jobData.companyLogoAiHint || 'company logo',
    company_description: jobData.companyDescription,
    location: jobData.location,
    description: jobData.description,
    full_description: jobData.fullDescription,
    requirements: jobData.requirements.split(',').map(req => req.trim()).filter(req => req.length > 0),
    employment_type: jobData.employmentType,
    salary: jobData.salary,
    // posted_date is defaulted to now() by the database
    external_apply_link: jobData.externalApplyLink,
    tags: jobData.tags?.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) || [],
    created_by: userId,
  };

  const { data, error } = await supabase
    .from('job_postings')
    .insert(jobToInsert)
    .select()
    .single();

  if (error) {
    console.error('Error adding job:', error);
    throw new Error(`Failed to add job: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to add job, no data returned.');
  }
  // Supabase client automatically maps snake_case to camelCase on select
  return data as unknown as JobPosting;
}
