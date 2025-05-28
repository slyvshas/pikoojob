// src/app/admin/post-job/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addJob } from "@/lib/jobs";
import { JobPostingSchema, type JobPostingFormData } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createJobAction(formData: JobPostingFormData): Promise<{ success: boolean; message: string; jobId?: string; errors?: any }> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile or profile not found:", profileError);
    return { success: false, message: "Error verifying admin status." };
  }

  if (!profile.is_admin) {
    return { success: false, message: "Unauthorized. Admin access required." };
  }

  const validation = JobPostingSchema.safeParse(formData);
  if (!validation.success) {
    return { success: false, message: "Invalid form data.", errors: validation.error.flatten().fieldErrors };
  }

  try {
    const newJob = await addJob(validation.data);
    revalidatePath('/'); // Revalidate home page to show new job listing
    revalidatePath('/jobs'); // If you have a generic /jobs page
    revalidatePath(`/jobs/${newJob.id}`); // Revalidate the new job's detail page
    // Optionally, redirect to the new job page or admin dashboard
    // redirect(`/jobs/${newJob.id}`); 
    return { success: true, message: "Job posted successfully!", jobId: newJob.id };
  } catch (error) {
    console.error("Failed to add job:", error);
    return { success: false, message: "Failed to post job. Please try again." };
  }
}
