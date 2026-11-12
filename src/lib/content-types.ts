export type Feature = { title: string; description: string };
export type IconItem = { icon?: string; title: string; description: string };

export type Service = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  overview: string;
  icon: string;
  offerings: string[];
  features: Feature[];
  benefits: string[];
  technologies: string[];
  portfolio_category: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type PortfolioItem = {
  id: string;
  slug: string;
  name: string;
  client_name: string;
  category: string;
  summary: string;
  description: string;
  challenge: string;
  solution: string;
  features: string[];
  technologies: string[];
  cover_image: string | null;
  screenshots: string[];
  project_url: string | null;
  completed_on: string | null;
  status: string;
  is_featured: boolean;
};

export type Testimonial = {
  id: string;
  author_name: string;
  author_role: string;
  company: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
};

export type Faq = { id: string; question: string; answer: string; service_id: string | null };

export type SiteContent = {
  company: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    hours: string;
  };
  socials: Record<string, string>;
  home_hero: {
    eyebrow: string;
    headline: string;
    description: string;
    primary_cta: string;
    secondary_cta: string;
  };
  why_us: IconItem[];
  process: { title: string; description: string }[];
  technologies: string[];
  about: { who_we_are: string; story: string; mission: string; vision: string; approach: string };
  core_values: { title: string; description: string }[];
  founder: { name: string; role: string; bio: string; photo_url: string };
  achievements: { value: string; label: string }[];
  footer: { blurb: string };
  seo: { default_title: string; default_description: string };
  enquiry_options: { budgets: string[] };
};

export const PORTFOLIO_CATEGORIES = [
  "Web Development",
  "AI Solutions",
  "UI/UX Design",
  "Branding",
  "Creative Design",
] as const;
