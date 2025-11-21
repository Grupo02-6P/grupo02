export interface Title {
  id: string;
  code: string;
  description?: string;
  date: string;
  value: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PAID';
  movementId: string;
  typeEntryId: string;
  partnerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TitleResponse extends Title {
  movement?: {
    id: string;
    name: string;
    description?: string;
  };
  typeEntry?: {
    id: string;
    name: string;
    description?: string;
  };
  partner?: {
    id: string;
    name: string;
    cnpj: string;
  };
}

export interface CreateTitleDto {
  code: string;
  description?: string;
  date?: string;
  value: number;
  movementId: string;
  typeEntryId: string;
  partnerId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PAID';
}

export interface UpdateTitleDto {
  code?: string;
  description?: string;
  date?: string;
  value?: number;
  movementId?: string;
  typeEntryId?: string;
  partnerId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PAID';
}

export interface TitleListResponse {
    data: TitleResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
