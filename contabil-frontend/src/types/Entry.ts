export interface Entry {
  id: string;
  code: string;
  description?: string;
  date: string;
  value: number;
  status: 'ACTIVE' | 'INACTIVE';
  titleId: string;
  entryTypeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntryResponse extends Entry {
  title?: {
    id: string;
    code: string;
    description?: string;
    value: number;
  };
  entryType?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateEntryDto {
  code: string;
  description?: string;
  date: string;
  value: number;
  titleId: string;
  entryTypeId: string;
}

export interface UpdateEntryDto {
  code?: string;
  description?: string;
  date?: string;
  value?: number;
  titleId?: string;
  entryTypeId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
