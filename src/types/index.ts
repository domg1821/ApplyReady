export type SubscriptionTier = "free" | "pro";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  analyses_used: number;
  created_at: string;
  updated_at: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  desiredRole: string;
  industry: string;
  jobDescription: string;
  jobType: "full-time" | "part-time" | "internship" | "volunteer" | "";
  volunteerWork: VolunteerWork[];
  extracurriculars: string[];
  relevantCoursework: string[];
}

export interface VolunteerWork {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  raw_text: string | null;
  resume_data: ResumeData | null;
  rewritten_data: ResumeData | null;
  template: TemplateId;
  status: "draft" | "analyzed" | "rewritten";
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  resume_id: string;
  user_id: string;
  resume_score: number;
  ats_score: number;
  feedback: FeedbackItem[];
  keywords_missing: string[];
  keywords_present: string[];
  summary_feedback: string;
  created_at: string;
}

export interface FeedbackItem {
  category: "bullet_points" | "formatting" | "keywords" | "summary" | "achievements" | "general";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  suggestion: string;
}

export type TemplateId =
  | "modern" | "executive" | "minimal" | "student" | "tech"
  | "creative" | "corporate" | "bold" | "elegant" | "sidebar-dark"
  | "classic" | "navy" | "compact" | "two-column" | "gradient";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  tier: "free" | "pro";
  preview: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: "month" | "year";
  priceId: string;
  features: string[];
  highlighted: boolean;
}
