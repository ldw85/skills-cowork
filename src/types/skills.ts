export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'official' | 'user-created' | 'from-pack';
  path: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SkillPack {
  id: string;
  name: string;
  version: string;
  description: string;
  installedAt: number;
  path: string;
}
