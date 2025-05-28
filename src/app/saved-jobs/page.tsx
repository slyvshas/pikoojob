import SavedJobsList from '@/components/jobs/SavedJobsList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Jobs | Career Compass',
  description: 'View and manage your saved job postings.',
};

export default function SavedJobsPage() {
  return (
    <SavedJobsList />
  );
}
