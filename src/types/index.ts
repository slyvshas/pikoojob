export type JobPosting = {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string; // URL
  companyDescription?: string;
  location: string;
  description: string;
  fullDescription?: string; // For more detailed view
  requirements: string[];
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary?: string;
  postedDate: string; // ISO date string or human-readable
  externalApplyLink: string;
  tags?: string[];
};
