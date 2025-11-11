export interface Entry {
  id: string;
  code: string;
  description?: string;
  date: string;
  value: number;
  status: 'ACTIVE' | 'INACTIVE';
  tittleId: string;
  entryTypeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntryResponse extends Entry {
  tittle?: {
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
  tittleId: string;
  entryTypeId: string;
}

export interface UpdateEntryDto {
  code?: string;
  description?: string;
  date?: string;
  value?: number;
  tittleId?: string;
  entryTypeId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
