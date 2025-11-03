export interface PartnerResponse {
    id: string;
    name: string;
    address: string;
    cnpj: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

export interface CreatePartnerDto {
    name: string;
    address: string;
    cnpj: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdatePartnerDto {
    name?: string;
    address?: string;
    cnpj?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}
    
export interface PartnerListResponse {
    data: PartnerResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}