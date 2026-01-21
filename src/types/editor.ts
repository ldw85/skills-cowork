export interface EditorFile {
  id: string;
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
  language: string;
}
