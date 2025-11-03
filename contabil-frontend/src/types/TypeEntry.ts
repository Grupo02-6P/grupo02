import type { AccountResponse } from "./Account";


export interface TypeEntryResponse {
    id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
    accountClearedId: string;
    accountCleared: AccountResponse;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTypeEntryDto {
    name: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
    accountClearedId: string;
}


export interface UpdateTypeEntryDto {
    name?: string;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    accountClearedId?: string;
}

export interface TypeEntryListResponse {
    data: TypeEntryResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}