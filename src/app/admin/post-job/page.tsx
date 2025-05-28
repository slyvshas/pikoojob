// src/app/admin/post-job/page.tsx
"use client";

import { useForm, Controller } from "react-hook-form"; // Added Controller import
import { zodResolver } from "@hookform/resolvers/zod";
import { JobPostingSchema, type JobPostingFormData, employmentTypes } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createJobAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function PostJobPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control, // for Controller
  } = useForm<JobPostingFormData>({
    resolver: zodResolver(JobPostingSchema),
    defaultValues: { // Provide sensible defaults
        title: "",
        companyName: "",
        companyLogoUrl: "",
        companyLogoAiHint: "",
        companyDescription: "",
        location: "",
        description: "",
        fullDescription: "",
        requirements: "",
        employmentType: "Full-time",
        salary: "",
        externalApplyLink: "",
        tags: "",
    }
  });

  const onSubmit = async (data: JobPostingFormData) => {
    setIsSubmitting(true);
    const result = await createJobAction(data);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      reset(); // Clear the form
      // Optionally redirect or revalidate
      if (result.jobId) {
        router.push(`/jobs/${result.jobId}`); // Redirect to the new job page
      } else {
        // Fallback or refresh if jobId is not present for some reason
        router.refresh(); 
      }
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to post job.",
        variant: "destructive",
      });
      // Log detailed errors if available
      if (result.errors) {
        console.error("Validation errors:", result.errors);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Post a New Job</CardTitle>
          <CardDescription>Fill in the details for the job opening.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" {...register("companyName")} />
                {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyLogoUrl">Company Logo URL (Optional)</Label>
                <Input id="companyLogoUrl" {...register("companyLogoUrl")} placeholder="https://example.com/logo.png" />
                {errors.companyLogoUrl && <p className="text-sm text-destructive">{errors.companyLogoUrl.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyLogoAiHint">Company Logo AI Hint (Optional)</Label>
                <Input id="companyLogoAiHint" {...register("companyLogoAiHint")} placeholder="e.g., modern tech logo" />
                {errors.companyLogoAiHint && <p className="text-sm text-destructive">{errors.companyLogoAiHint.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyDescription">Company Description (Optional)</Label>
              <Textarea id="companyDescription" {...register("companyDescription")} placeholder="Brief overview of the company..." />
              {errors.companyDescription && <p className="text-sm text-destructive">{errors.companyDescription.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} placeholder="e.g., San Francisco, CA or Remote" />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description (for cards)</Label>
              <Textarea id="description" {...register("description")} placeholder="Brief summary of the job..." />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">Full Job Description</Label>
              <Textarea id="fullDescription" {...register("fullDescription")} rows={5} placeholder="Detailed job responsibilities, expectations, etc. Supports HTML."/>
              {errors.fullDescription && <p className="text-sm text-destructive">{errors.fullDescription.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (comma-separated)</Label>
              <Textarea id="requirements" {...register("requirements")} placeholder="e.g., 5+ years React, Strong SQL skills, ..." />
              {errors.requirements && <p className="text-sm text-destructive">{errors.requirements.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                 <Controller
                    name="employmentType"
                    control={control}
                    render={({ field }) => (
                        <Select
                            onValueChange={field.onChange}
                            value={field.value} // Changed from defaultValue
                        >
                        <SelectTrigger id="employmentType" ref={field.ref}> {/* Added field.ref */}
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {employmentTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    )}
                    />
                {errors.employmentType && <p className="text-sm text-destructive">{errors.employmentType.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary (Optional)</Label>
                <Input id="salary" {...register("salary")} placeholder="e.g., $100,000 - $120,000 per year or $50/hr" />
                {errors.salary && <p className="text-sm text-destructive">{errors.salary.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalApplyLink">External Apply Link</Label>
              <Input id="externalApplyLink" {...register("externalApplyLink")} placeholder="https://example.com/apply/job-id" />
              {errors.externalApplyLink && <p className="text-sm text-destructive">{errors.externalApplyLink.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
              <Input id="tags" {...register("tags")} placeholder="e.g., React, Node.js, Marketing" />
              {errors.tags && <p className="text-sm text-destructive">{errors.tags.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Posting Job..." : "Post Job"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
