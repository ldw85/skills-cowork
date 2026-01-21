'use client'

import React, { useState } from 'react'
import { Tabs, Input, Tree, List, Card, Empty, Tag } from 'antd'
import { SearchOutlined, FileOutlined, CodeOutlined, AppstoreOutlined, FolderOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import type { FileNode, Skill, SkillPack } from '../../types'

const { Search } = Input

export default function Sidebar() {
  const { t } = useTranslation()
  const { currentTheme } = useTheme()
  const [searchValue, setSearchValue] = useState('')

  // Mock file tree data
  const fileTreeData: FileNode[] = [
    {
      title: 'project',
      key: '0',
      icon: <FolderOutlined />,
      children: [
        {
          title: 'src',
          key: '0-0',
          icon: <FolderOutlined />,
          children: [
            {
              title: 'index.tsx',
              key: '0-0-0',
              isLeaf: true,
              icon: <FileOutlined />,
            },
            {
              title: 'App.tsx',
              key: '0-0-1',
              isLeaf: true,
              icon: <CodeOutlined />,
            },
            {
              title: 'styles.css',
              key: '0-0-2',
              isLeaf: true,
              icon: <FileOutlined />,
            },
          ],
        },
        {
          title: 'package.json',
          key: '0-1',
          isLeaf: true,
          icon: <FileOutlined />,
        },
        {
          title: 'README.md',
          key: '0-2',
          isLeaf: true,
          icon: <FileOutlined />,
        },
      ],
    },
  ]

  // Mock skills data
  const skills: Skill[] = [
    { id: '1', name: 'Code Generation', description: 'Generate code snippets', category: 'Development' },
    { id: '2', name: 'Code Review', description: 'Review code for best practices', category: 'Development' },
    { id: '3', name: 'Documentation', description: 'Generate documentation', category: 'Writing' },
    { id: '4', name: 'Testing', description: 'Create unit tests', category: 'Development' },
    { id: '5', name: 'Refactoring', description: 'Refactor code suggestions', category: 'Development' },
  ]

  // Mock skill packs data
  const skillPacks: SkillPack[] = [
    {
      id: '1',
      name: 'Web Development Pack',
      version: '1.0.0',
      description: 'Essential skills for web development',
      skills: ['Code Generation', 'Code Review', 'Refactoring'],
    },
    {
      id: '2',
      name: 'AI Assistant Pack',
      version: '1.2.0',
      description: 'AI-powered assistance for coding',
      skills: ['Code Generation', 'Documentation'],
    },
  ]

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchValue.toLowerCase())
  )

  const renderFilesPanel = () => (
    <div style={{ padding: '12px 0' }}>
      <Tree
        showIcon
        defaultExpandAll
        treeData={fileTreeData}
        style={{ fontSize: '13px' }}
      />
    </div>
  )

  const renderSkillsPanel = () => (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Search
        placeholder={t('search')}
        allowClear
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        style={{ marginBottom: '12px' }}
        prefix={<SearchOutlined />}
      />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredSkills.length === 0 ? (
          <Empty description={t('noSkills')} style={{ marginTop: '40px' }} />
        ) : (
          <List
            dataSource={filteredSkills}
            renderItem={(skill) => (
              <List.Item style={{ padding: '8px 0', display: 'block' }}>
                <Card size="small" hoverable style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '13px' }}>{skill.name}</strong>
                    {skill.category && <Tag color="blue" style={{ fontSize: '11px' }}>{skill.category}</Tag>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                    {skill.description}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  )

  const renderSkillPacksPanel = () => (
    <div style={{ padding: '12px' }}>
      {skillPacks.length === 0 ? (
        <Empty description={t('noSkills')} style={{ marginTop: '40px' }} />
      ) : (
        <List
          dataSource={skillPacks}
          renderItem={(pack) => (
            <List.Item style={{ padding: '8px 0' }}>
              <Card size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px' }}>{pack.name}</strong>
                  <Tag color="green" style={{ fontSize: '11px' }}>{pack.version}</Tag>
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
                  {pack.description}
                </div>
                <div>
                  {pack.skills.map((skill, index) => (
                    <Tag key={index} style={{ fontSize: '11px', marginBottom: '4px' }}>
                      {skill}
                    </Tag>
                  ))}
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  )

  const tabItems = [
    {
      key: 'files',
      label: (
        <span>
          <FileOutlined />
          {t('files')}
        </span>
      ),
      children: renderFilesPanel(),
    },
    {
      key: 'skills',
      label: (
        <span>
          <CodeOutlined />
          {t('skills')}
        </span>
      ),
      children: renderSkillsPanel(),
    },
    {
      key: 'skillPacks',
      label: (
        <span>
          <AppstoreOutlined />
          {t('skillPacks')}
        </span>
      ),
      children: renderSkillPacksPanel(),
    },
  ]

  return (
    <div className="sidebar">
      <Tabs
        defaultActiveKey="files"
        items={tabItems}
        tabBarStyle={{
          padding: '0 12px',
          marginBottom: 0,
          fontSize: '13px',
        }}
        style={{ height: '100%' }}
      />
    </div>
  )
}
