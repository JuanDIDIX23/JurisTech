import { motion } from 'framer-motion';
import { fadeUp } from '@shared/lib/motion';
import { cn } from '@shared/lib/cn';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  tone?: 'dark' | 'light';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'dark',
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}
    >
      <span className="text-sm font-semibold uppercase tracking-wider text-accent-600">
        {eyebrow}
      </span>
      <h2
        className={cn(
          'mt-3 text-3xl font-bold tracking-tight sm:text-4xl',
          tone === 'dark' ? 'text-navy-900' : 'text-white',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-lg leading-relaxed',
            tone === 'dark' ? 'text-graphite-500' : 'text-graphite-300',
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
