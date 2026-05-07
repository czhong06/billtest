import Link from 'next/link';
import { Button } from '@/components/ui';
import {
  BarChart3, DollarSign, ArrowRight, ExternalLink, TrendingUp, Map, Flame,
} from 'lucide-react';

const features = [
  {
    title: 'Probability Predictions',
    kicker: 'Who Wins?',
    description: 'Our model crunches historical data, campaign cash, and voter demographics to give you a real shot at knowing what passes — before Election Day.',
    icon: BarChart3,
    href: '/predictions',
    accent: 'border-t-4 border-indigo-500',
  },
  {
    title: 'Campaign Finance Analysis',
    kicker: 'Follow the Money',
    description: `
