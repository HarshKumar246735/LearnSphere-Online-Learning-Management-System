import { Globe, Code2, BarChart3, Brain, ShieldCheck, Database, Smartphone, Briefcase, BookOpen } from 'lucide-react';

const map = { Globe, Code2, BarChart3, Brain, ShieldCheck, Database, Smartphone, Briefcase, BookOpen };

export const categoryIcon = (name) => map[name] || BookOpen;
