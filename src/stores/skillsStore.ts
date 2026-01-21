import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Skill, SkillPack } from '../types';
import { skillsService } from '../services/skillsService';
import { logger } from '../utils/logger';

interface SkillsState {
  skills: Skill[];
  skillPacks: SkillPack[];
  filterKeyword: string;
  isLoading: boolean;
  loadSkills: () => Promise<void>;
  loadSkillPacks: () => Promise<void>;
  searchSkills: (keyword: string) => void;
  getFilteredSkills: () => Skill[];
  getSkillsByCategory: (category: string) => Skill[];
  deleteUserSkill: (skillId: string) => Promise<void>;
  uninstallSkillPack: (packId: string) => Promise<void>;
  createSkill: (skill: Omit<Skill, 'id'>) => Promise<string>;
  updateSkill: (skillId: string, skill: Partial<Skill>) => Promise<void>;
  installSkillPack: (packPath: string) => Promise<string>;
  refreshSkills: () => Promise<void>;
}

export const useSkillsStore = create<SkillsState>()(
  devtools(
    (set, get) => ({
      skills: [],
      skillPacks: [],
      filterKeyword: '',
      isLoading: false,

      loadSkills: async () => {
        try {
          logger.info('Loading skills');
          set({ isLoading: true }, false, 'loadSkills/start');

          const skills = await skillsService.loadSkills();

          set(
            {
              skills,
              isLoading: false,
            },
            false,
            'loadSkills/success'
          );

          logger.info('Skills loaded successfully', { count: skills.length });
        } catch (error) {
          logger.error('Failed to load skills', { error });
          set({ isLoading: false }, false, 'loadSkills/error');
          throw error;
        }
      },

      loadSkillPacks: async () => {
        try {
          logger.info('Loading skill packs');
          set({ isLoading: true }, false, 'loadSkillPacks/start');

          const skillPacks = await skillsService.loadSkillPacks();

          set(
            {
              skillPacks,
              isLoading: false,
            },
            false,
            'loadSkillPacks/success'
          );

          logger.info('Skill packs loaded successfully', { count: skillPacks.length });
        } catch (error) {
          logger.error('Failed to load skill packs', { error });
          set({ isLoading: false }, false, 'loadSkillPacks/error');
          throw error;
        }
      },

      searchSkills: (keyword: string) => {
        logger.debug('Searching skills', { keyword });
        set({ filterKeyword: keyword }, false, 'searchSkills');
      },

      getFilteredSkills: () => {
        const { skills, filterKeyword } = get();

        if (!filterKeyword.trim()) {
          return skills;
        }

        const keyword = filterKeyword.toLowerCase();
        return skills.filter(
          (skill) =>
            skill.name.toLowerCase().includes(keyword) ||
            skill.description.toLowerCase().includes(keyword)
        );
      },

      getSkillsByCategory: (category: string) => {
        const { skills } = get();
        return skills.filter((skill) => skill.category === category);
      },

      deleteUserSkill: async (skillId: string) => {
        try {
          logger.info('Deleting user skill', { skillId });
          set({ isLoading: true }, false, 'deleteUserSkill/start');

          await skillsService.deleteSkill(skillId);

          set(
            (state) => ({
              skills: state.skills.filter((s) => s.id !== skillId),
              isLoading: false,
            }),
            false,
            'deleteUserSkill/success'
          );

          logger.info('User skill deleted successfully', { skillId });
        } catch (error) {
          logger.error('Failed to delete user skill', { skillId, error });
          set({ isLoading: false }, false, 'deleteUserSkill/error');
          throw error;
        }
      },

      uninstallSkillPack: async (packId: string) => {
        try {
          logger.info('Uninstalling skill pack', { packId });
          set({ isLoading: true }, false, 'uninstallSkillPack/start');

          await skillsService.uninstallSkillPack(packId);

          set(
            (state) => ({
              skillPacks: state.skillPacks.filter((p) => p.id !== packId),
              skills: state.skills.filter(
                (s) => s.category !== 'from-pack' || !s.metadata?.packId || s.metadata.packId !== packId
              ),
              isLoading: false,
            }),
            false,
            'uninstallSkillPack/success'
          );

          logger.info('Skill pack uninstalled successfully', { packId });
        } catch (error) {
          logger.error('Failed to uninstall skill pack', { packId, error });
          set({ isLoading: false }, false, 'uninstallSkillPack/error');
          throw error;
        }
      },

      createSkill: async (skill: Omit<Skill, 'id'>) => {
        try {
          logger.info('Creating skill', { name: skill.name });
          set({ isLoading: true }, false, 'createSkill/start');

          const skillId = await skillsService.createSkill(skill);

          const newSkill: Skill = {
            ...skill,
            id: skillId,
          };

          set(
            (state) => ({
              skills: [...state.skills, newSkill],
              isLoading: false,
            }),
            false,
            'createSkill/success'
          );

          logger.info('Skill created successfully', { skillId, name: skill.name });
          return skillId;
        } catch (error) {
          logger.error('Failed to create skill', { name: skill.name, error });
          set({ isLoading: false }, false, 'createSkill/error');
          throw error;
        }
      },

      updateSkill: async (skillId: string, skillUpdate: Partial<Skill>) => {
        try {
          logger.info('Updating skill', { skillId });
          set({ isLoading: true }, false, 'updateSkill/start');

          await skillsService.updateSkill(skillId, skillUpdate);

          set(
            (state) => ({
              skills: state.skills.map((s) =>
                s.id === skillId ? { ...s, ...skillUpdate } : s
              ),
              isLoading: false,
            }),
            false,
            'updateSkill/success'
          );

          logger.info('Skill updated successfully', { skillId });
        } catch (error) {
          logger.error('Failed to update skill', { skillId, error });
          set({ isLoading: false }, false, 'updateSkill/error');
          throw error;
        }
      },

      installSkillPack: async (packPath: string) => {
        try {
          logger.info('Installing skill pack', { packPath });
          set({ isLoading: true }, false, 'installSkillPack/start');

          const packId = await skillsService.installSkillPack(packPath);

          await get().loadSkillPacks();
          await get().loadSkills();

          logger.info('Skill pack installed successfully', { packId, packPath });
          return packId;
        } catch (error) {
          logger.error('Failed to install skill pack', { packPath, error });
          set({ isLoading: false }, false, 'installSkillPack/error');
          throw error;
        }
      },

      refreshSkills: async () => {
        logger.info('Refreshing skills');
        await Promise.all([get().loadSkills(), get().loadSkillPacks()]);
      },
    }),
    { name: 'SkillsStore' }
  )
);
