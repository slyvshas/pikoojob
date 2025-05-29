'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, MapPin, Briefcase, Building2, Clock, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
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

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`, {
          cache: 'no-store'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }
        const data = await response.json();
        setJob(data);
        checkIfSaved(data.id);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.id]);

  const checkIfSaved = async (jobId: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;

    const { data } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('job_id', jobId)
      .eq('user_id', session.user.id)
      .single();

    setIsSaved(!!data);
  };

  const handleSave = async () => {
    if (!job) return;

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast.error('Please sign in to save jobs');
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        // Remove from saved jobs
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('job_id', job.id)
          .eq('user_id', session.user.id);

        if (error) throw error;
        setIsSaved(false);
        toast.success('Job removed from saved jobs');
      } else {
        // Add to saved jobs
        const { error } = await supabase
          .from('saved_jobs')
          .insert([
            {
              job_id: job.id,
              user_id: session.user.id
            }
          ]);

        if (error) throw error;
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleApply = () => {
    if (job?.external_apply_link) {
      window.open(job.external_apply_link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-muted rounded"></div>
          <div className="h-4 w-1/4 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="gap-2 mb-6"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                {job.company_logo ? (
                  <Image
                    src={job.company_logo}
                    alt={job.company_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    <Building2 className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
                <p className="text-lg text-muted-foreground">{job.company_name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handleSave}
                disabled={saving}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center">
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save Job
                    </>
                  )}
                </span>
              </Button>
              {job.external_apply_link && (
                <Button
                  size="lg"
                  onClick={handleApply}
                  className="relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center">
                    Apply Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-5 w-5" />
                <span>{job.job_type}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            {job.salary_range && (
              <p className="text-lg font-medium">{job.salary_range}</p>
            )}
          </div>

          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {job.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">Job Description</h2>
            <p className="whitespace-pre-wrap">{job.description}</p>

            {job.requirements && job.requirements.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-4">Requirements</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-4">Benefits</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

