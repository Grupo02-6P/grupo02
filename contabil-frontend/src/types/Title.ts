export interface Title {
  id: string;
  code: string;
  description?: string;
  date: string;
  value: number;
  status: 'ACTIVE' | 'INACTIVE';
  movementId: string;
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
  partnerId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateTitleDto {
  code?: string;
  description?: string;
  date?: string;
  value?: number;
  movementId?: string;
  partnerId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
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
