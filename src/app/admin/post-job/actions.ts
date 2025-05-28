// src/app/admin/post-job/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addJob } from "@/lib/jobs";
import { JobPostingSchema, type JobPostingFormData } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Profile } from '@/types_db';


export async function createJobAction(formData: JobPostingFormData): Promise<{ success: boolean; message: string; jobId?: string; errors?: any }> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  let profileData: Pick<Profile, 'is_admin'> | null = null;
  let profileErrorObj: any = null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single<Pick<Profile, 'is_admin'>>();
    profileData = data;
    profileErrorObj = error;
  } catch (e) {
    profileErrorObj = e;
  }


  if (profileErrorObj) {
    let userMessage = "Error verifying admin status.";
    if (profileErrorObj.code === 'PGRST116') {
      console.log(`[Admin Action] No profile found for user ${user.id}. User treated as non-admin.`);
      userMessage = "Profile not found. Admin verification failed.";
    } else if (profileErrorObj.code === '42P01') {
      console.warn(`[Admin Action] The 'profiles' table not found in Supabase. Admin verification for ${user.id} failed.`);
      userMessage = "System configuration error: Profile system not found.";
    } else {
      console.error("[Admin Action] Error fetching profile or profile not found:", profileErrorObj.message);
    }
    return { success: false, message: userMessage };
  }

  if (!profileData || !profileData.is_admin) {
    console.log(`[Admin Action] Unauthorized attempt to post job by user ${user.id}. Profile admin status: ${profileData?.is_admin}`);
    return { success: false, message: "Unauthorized. Admin access required." };
  }

  const validation = JobPostingSchema.safeParse(formData);
  if (!validation.success) {
    return { success: false, message: "Invalid form data.", errors: validation.error.flatten().fieldErrors };
  }

  try {
    // Pass user.id to addJob
    const newJob = await addJob(validation.data, user.id);
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
