import { logger } from '../utils/logger';
import { Skill, SkillPack } from '../types';

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

export const skillsService = {
  async loadSkills(): Promise<Skill[]> {
    try {
      logger.debug('Loading skills');
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const skills = await invoke<Skill[]>('load_skills');
        logger.info('Skills loaded successfully', { count: skills.length });
        return skills;
      }
      
      // Mock data
      logger.warn('Using mock skills service');
      return [
        {
          id: '1',
          name: 'Mock Skill',
          description: 'A mock skill for development',
          category: 'official' as const,
          path: '/skills/mock',
          content: 'skill content',
        },
      ];
    } catch (error) {
      logger.error('Failed to load skills', { error });
      throw error;
    }
  },

  async loadSkillPacks(): Promise<SkillPack[]> {
    try {
      logger.debug('Loading skill packs');
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const packs = await invoke<SkillPack[]>('load_skill_packs');
        logger.info('Skill packs loaded successfully', { count: packs.length });
        return packs;
      }
      
      // Mock data
      logger.warn('Using mock skills service');
      return [];
    } catch (error) {
      logger.error('Failed to load skill packs', { error });
      throw error;
    }
  },

  async deleteSkill(skillId: string): Promise<void> {
    try {
      logger.debug('Deleting skill', { skillId });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('delete_skill', { skillId });
        logger.info('Skill deleted successfully', { skillId });
        return;
      }
      
      logger.warn('Using mock skills service');
    } catch (error) {
      logger.error('Failed to delete skill', { skillId, error });
      throw error;
    }
  },

  async uninstallSkillPack(packId: string): Promise<void> {
    try {
      logger.debug('Uninstalling skill pack', { packId });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('uninstall_skill_pack', { packId });
        logger.info('Skill pack uninstalled successfully', { packId });
        return;
      }
      
      logger.warn('Using mock skills service');
    } catch (error) {
      logger.error('Failed to uninstall skill pack', { packId, error });
      throw error;
    }
  },

  async createSkill(skill: Omit<Skill, 'id'>): Promise<string> {
    try {
      logger.debug('Creating skill', { name: skill.name });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const skillId = await invoke<string>('create_skill', { skill });
        logger.info('Skill created successfully', { skillId, name: skill.name });
        return skillId;
      }
      
      // Mock
      const skillId = `skill-${Date.now()}`;
      logger.info('Mock skill created', { skillId });
      return skillId;
    } catch (error) {
      logger.error('Failed to create skill', { name: skill.name, error });
      throw error;
    }
  },

  async updateSkill(skillId: string, skill: Partial<Skill>): Promise<void> {
    try {
      logger.debug('Updating skill', { skillId });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('update_skill', { skillId, skill });
        logger.info('Skill updated successfully', { skillId });
        return;
      }
      
      logger.warn('Using mock skills service');
    } catch (error) {
      logger.error('Failed to update skill', { skillId, error });
      throw error;
    }
  },

  async installSkillPack(packPath: string): Promise<string> {
    try {
      logger.debug('Installing skill pack', { packPath });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const packId = await invoke<string>('install_skill_pack', { packPath });
        logger.info('Skill pack installed successfully', { packId, packPath });
        return packId;
      }
      
      // Mock
      const packId = `pack-${Date.now()}`;
      logger.info('Mock skill pack installed', { packId });
      return packId;
    } catch (error) {
      logger.error('Failed to install skill pack', { packPath, error });
      throw error;
    }
  },
};
