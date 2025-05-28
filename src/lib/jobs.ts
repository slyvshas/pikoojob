import type { JobPosting } from '@/types';

const mockJobs: JobPosting[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    companyName: 'Tech Solutions Inc.',
    companyLogo: 'https://placehold.co/64x64.png',
    dataAiHint: 'company logo',
    location: 'San Francisco, CA',
    description: 'Join our innovative team to build next-generation software solutions.',
    fullDescription: '<p>Tech Solutions Inc. is looking for a talented Senior Software Engineer to design, develop, and maintain cutting-edge software applications. You will be working with a team of passionate engineers to deliver high-quality products.</p><h4>Responsibilities:</h4><ul><li>Design and implement scalable software solutions.</li><li>Collaborate with cross-functional teams.</li><li>Write clean, maintainable, and testable code.</li><li>Mentor junior engineers.</li></ul>',
    requirements: ['5+ years of experience in software development', 'Proficiency in JavaScript/TypeScript, React, Node.js', 'Experience with cloud platforms (AWS, Azure, or GCP)', 'Strong problem-solving skills'],
    employmentType: 'Full-time',
    salary: '$120,000 - $160,000 per year',
    postedDate: '2024-05-01',
    externalApplyLink: 'https://example.com/apply/1',
    tags: ['Software Development', 'Engineering', 'React', 'Node.js'],
  },
  {
    id: '2',
    title: 'Product Manager',
    companyName: 'Innovatech Ltd.',
    companyLogo: 'https://placehold.co/64x64.png',
    dataAiHint: 'company logo',
    location: 'New York, NY',
    description: 'Lead the product strategy and roadmap for our flagship product.',
    fullDescription: '<p>Innovatech Ltd. is seeking an experienced Product Manager to drive the vision, strategy, and execution of our market-leading product. You will work closely with engineering, design, and marketing teams.</p><h4>Responsibilities:</h4><ul><li>Define product vision and strategy.</li><li>Conduct market research and competitor analysis.</li><li>Prioritize features and manage the product backlog.</li><li>Collaborate with stakeholders to ensure product success.</li></ul>',
    requirements: ['3+ years of product management experience', 'Strong analytical and strategic thinking skills', 'Excellent communication and leadership abilities', 'Experience with agile methodologies'],
    employmentType: 'Full-time',
    postedDate: '2024-05-05',
    externalApplyLink: 'https://example.com/apply/2',
    tags: ['Product Management', 'Strategy', 'Agile'],
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    companyName: 'Creative Designs Co.',
    companyLogo: 'https://placehold.co/64x64.png',
    dataAiHint: 'company logo',
    location: 'Remote',
    description: 'Create intuitive and visually appealing user interfaces for web and mobile applications.',
    fullDescription: '<p>Creative Designs Co. is looking for a creative UX/UI Designer to join our remote team. You will be responsible for the entire design process, from user research to final mockups and prototypes.</p><h4>Responsibilities:</h4><ul><li>Conduct user research and usability testing.</li><li>Create wireframes, prototypes, and high-fidelity mockups.</li><li>Collaborate with product managers and developers.</li><li>Maintain and evolve design systems.</li></ul>',
    requirements: ['Proven UX/UI design experience with a strong portfolio', 'Proficiency in Figma, Sketch, or Adobe XD', 'Understanding of user-centered design principles', 'Excellent visual design skills'],
    employmentType: 'Contract',
    salary: '$70 - $90 per hour',
    postedDate: '2024-04-28',
    externalApplyLink: 'https://example.com/apply/3',
    tags: ['UX Design', 'UI Design', 'Figma', 'Remote'],
  },
  {
    id: '4',
    title: 'Marketing Specialist',
    companyName: 'Growth Hackers Agency',
    companyLogo: 'https://placehold.co/64x64.png',
    dataAiHint: 'company logo',
    location: 'Austin, TX',
    description: 'Develop and execute marketing campaigns to drive customer acquisition and engagement.',
    fullDescription: '<p>Growth Hackers Agency is hiring a Marketing Specialist to create and manage innovative marketing strategies. You will be responsible for SEO, content marketing, social media, and email campaigns.</p><h4>Responsibilities:</h4><ul><li>Develop and implement marketing strategies.</li><li>Manage SEO/SEM, content, social media, and email marketing.</li><li>Analyze campaign performance and optimize for results.</li><li>Stay up-to-date with marketing trends.</li></ul>',
    requirements: ['2+ years of marketing experience', 'Proven track record of successful marketing campaigns', 'Experience with marketing analytics tools', 'Strong writing and communication skills'],
    employmentType: 'Full-time',
    postedDate: '2024-05-10',
    externalApplyLink: 'https://example.com/apply/4',
    tags: ['Marketing', 'SEO', 'Content Marketing', 'Social Media'],
  },
   {
    id: '5',
    title: 'Data Analyst Intern',
    companyName: 'Future Insights',
    companyLogo: 'https://placehold.co/64x64.png',
    dataAiHint: 'company logo',
    location: 'Boston, MA (Hybrid)',
    description: 'Exciting internship opportunity for aspiring data analysts to work on real-world projects.',
    fullDescription: '<p>Future Insights offers a dynamic internship program for students and recent graduates passionate about data. As a Data Analyst Intern, you will assist senior analysts in collecting, processing, and analyzing large datasets to generate actionable insights.</p><h4>Responsibilities:</h4><ul><li>Assist with data collection and cleaning.</li><li>Perform exploratory data analysis.</li><li>Create visualizations and reports.</li><li>Support ad-hoc data requests from various teams.</li></ul>',
    requirements: ['Currently pursuing or recently completed a degree in Data Science, Statistics, Computer Science, or related field', 'Basic understanding of SQL and Python/R', 'Familiarity with data visualization tools (e.g., Tableau, Power BI)', 'Strong analytical and problem-solving skills'],
    employmentType: 'Internship',
    salary: '$20 - $25 per hour',
    postedDate: '2024-05-12',
    externalApplyLink: 'https://example.com/apply/5',
    tags: ['Data Analysis', 'Internship', 'SQL', 'Python', 'Tableau'],
  }
];

export async function getAllJobs(): Promise<JobPosting[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockJobs;
}

export async function getJobById(id: string): Promise<JobPosting | undefined> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockJobs.find(job => job.id === id);
}
