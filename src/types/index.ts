// src/types/index.ts
import { z } from 'zod';

export type JobPosting = {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string; // URL
  dataAiHint?: string; // Added for AI image hint consistency
  companyDescription?: string;
  location: string;
  description: string; // Short description for cards
  fullDescription?: string; // Detailed description for job page
  requirements: string[];
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary?: string;
  postedDate: string; // ISO date string or human-readable
  externalApplyLink: string;
  tags?: string[];
};

export const employmentTypes: JobPosting['employmentType'][] = ['Full-time', 'Part-time', 'Contract', 'Internship'];

export const JobPostingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyLogoUrl: z.string().url("Must be a valid URL for company logo").optional().or(z.literal('')),
  companyLogoAiHint: z.string().optional(),
  companyDescription: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(10, "Short description must be at least 10 characters"),
  fullDescription: z.string().min(20, "Full description must be at least 20 characters"),
  requirements: z.string().min(3, "Requirements must be at least 3 characters (comma-separated)"), // Input as string, parsed later
  employmentType: z.enum(employmentTypes),
  salary: z.string().optional(),
  externalApplyLink: z.string().url("Must be a valid URL for the application link"),
  tags: z.string().optional(), // Input as string, parsed later
});

export type JobPostingFormData = z.infer<typeof JobPostingSchema>;
