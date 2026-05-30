import { PersonalityTag as PersonalityTagType } from '@/types/chat';
import {
  Moon,
  Sunrise,
  BookOpen,
  MessageSquare,
  Ghost,
  Rocket,
  Eye,
  Zap,
  Clock,
  Smile,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  moon: Moon,
  sunrise: Sunrise,
  'book-open': BookOpen,
  'message-square': MessageSquare,
  ghost: Ghost,
  rocket: Rocket,
  eye: Eye,
  zap: Zap,
  clock: Clock,
  smile: Smile,
};

interface PersonalityTagProps {
  tags: PersonalityTagType[];
}

export default function PersonalityTag({ tags }: PersonalityTagProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const Icon = ICON_MAP[tag.iconName];
        return (
          <div
            key={tag.label}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-sm"
            title={tag.description}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span className="text-xs font-medium">{tag.label}</span>
          </div>
        );
      })}
    </div>
  );
}
