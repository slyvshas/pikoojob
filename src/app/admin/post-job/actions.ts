// src/app/admin/post-job/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-actions";
import { addJob } from "@/lib/jobs";
import { JobPostingSchema, type JobPostingFormData } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Profile } from '@/types_db';

export async function createJobAction(formData: JobPostingFormData): Promise<{ success: boolean; message: string; jobId?: string; errors?: any }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Authentication required." };
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error checking admin status:', profileError);
      return { success: false, message: "Error verifying admin status." };
    }

    if (!profile?.is_admin) {
      return { success: false, message: "Unauthorized. Admin access required." };
    }

    const validation = JobPostingSchema.safeParse(formData);
    if (!validation.success) {
      return { success: false, message: "Invalid form data.", errors: validation.error.flatten().fieldErrors };
    }

    // Map the form data to match the database schema
    const jobData = {
      title: validation.data.title,
      company_name: validation.data.companyName,
      company_logo_url: validation.data.companyLogoUrl || null,
      company_logo_ai_hint: validation.data.companyLogoAiHint || null,
      company_description: validation.data.companyDescription || null,
      location: validation.data.location,
      description: validation.data.description,
      full_description: validation.data.fullDescription || null,
      requirements: validation.data.requirements.split(',').map(req => req.trim()).filter(req => req.length > 0),
      employment_type: validation.data.employmentType,
      salary: validation.data.salary || null,
      external_apply_link: validation.data.externalApplyLink,
      tags: validation.data.tags ? validation.data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : null,
      created_by: user.id
    };

    const newJob = await addJob(jobData);
    revalidatePath('/'); // Revalidate home page to show new job listing
    revalidatePath('/jobs'); // If you have a generic /jobs page
    revalidatePath(`/jobs/${newJob.id}`); // Revalidate the new job's detail page
    
    return { success: true, message: "Job posted successfully!", jobId: newJob.id };
  } catch (error) {
    console.error("Failed to add job:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to post job. ${errorMessage}` };
  }
}
