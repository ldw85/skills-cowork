export interface FileTreeNode {
  key: string;
  title: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileTreeNode[];
}
