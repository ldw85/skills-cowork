export interface APIConfig {
  provider: 'chatglm' | 'deepseek' | 'custom';
  apiKey: string;
  apiEndpoint?: string;
}
