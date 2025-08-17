
export enum ChatRole {
  User = 'user',
  Model = 'model',
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
