export interface SettingItem {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface UpsertSettingInput {
  key: string;
  value: string;
}
