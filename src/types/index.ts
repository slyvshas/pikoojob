// src/types/index.ts
import { z } from 'zod';
import type { DbJobPosting } from '@/types_db'; // Import the DB type

// This type is what components will consume. Supabase client maps snake_case to camelCase.
export type JobPosting = {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string | null;
  companyLogoAiHint?: string | null;
  companyDescription?: string | null;
  location: string;
  description: string; // Short description for cards
  fullDescription?: string | null; // Detailed description for job page
  requirements: string[]; // Mapped from text[]
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary?: string | null;
  postedDate: string; // ISO date string
  externalApplyLink: string;
  tags?: string[] | null; // Mapped from text[]
  createdBy?: string | null; // user id
  createdAt?: string;
  updatedAt?: string;
};

export const employmentTypes: JobPosting['employmentType'][] = ['Full-time', 'Part-time', 'Contract', 'Internship'];

export const JobPostingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyLogoUrl: z.string().url("Must be a valid URL for company logo").optional().or(z.literal('')),
  companyLogoAiHint: z.string().max(50, "AI hint too long").optional(),
  companyDescription: z.string().max(1000, "Company description too long").optional(),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(10, "Short description must be at least 10 characters").max(280, "Short description too long"),
  fullDescription: z.string().min(20, "Full description must be at least 20 characters"),
  requirements: z.string().min(3, "Requirements must be at least 3 characters (comma-separated)"),
  employmentType: z.enum(employmentTypes),
  salary: z.string().optional(),
  externalApplyLink: z.string().url("Must be a valid URL for the application link"),
  tags: z.string().optional(), // Input as string, parsed later
});

export type JobPostingFormData = z.infer<typeof JobPostingSchema>;

// Helper to map DbJobPosting (snake_case from DB) to JobPosting (camelCase for UI)
// Supabase client handles this automatically, but this function can be useful for explicitness or manual mapping if needed.
// For now, we rely on Supabase's auto-mapping. If issues arise, we can use a manual mapper.
export function mapDbJobToJobPosting(dbJob: DbJobPosting): JobPosting {
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
    postedDate: dbJob.posted_date,
    externalApplyLink: dbJob.external_apply_link,
    tags: dbJob.tags || [],
    createdBy: dbJob.created_by,
    createdAt: dbJob.created_at,
    updatedAt: dbJob.updated_at,
  };
}
