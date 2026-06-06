import React from 'react';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { cn } from '@/lib/utils/cn';
import { Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SkillsGridProps {
  skills: string[];
}

export function SkillsGrid({ skills }: SkillsGridProps) {
  const { sendMessage } = useAssistantStore();
  const router = useRouter();

  const handleSkillClick = (skill: string) => {
    // Send message to assistant and route there
    sendMessage(`Tell me how my experience with ${skill} aligns with Data Science roles.`);
    router.push('/assistant');
  };

  if (!skills || skills.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-muted">Extracted Skills</h3>
        <p className="text-xs text-muted mt-1 mb-1">
          <span className="font-mono text-primary">{skills.length}</span> skills extracted from your CV
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => (
          <button
            key={idx}
            onClick={() => handleSkillClick(skill)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors",
              // Alternate colors slightly based on index for visual variety, or assume technical vs soft logic
              idx % 3 === 0 
                ? "bg-hud-blue/10 text-hud-blue border border-hud-blue/20 hover:bg-hud-blue hover:text-white"
                : "bg-inset text-secondary border border-panel-border hover:border-hud-blue hover:text-hud-blue"
            )}
            title={`Ask assistant about ${skill}`}
          >
            {skill}
            <Bot size={10} className="opacity-50" />
          </button>
        ))}
      </div>
    </div>
  );
}
