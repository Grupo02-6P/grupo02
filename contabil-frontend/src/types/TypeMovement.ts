import type { AccountResponse } from "./Account";


export interface TypeMovementResponse {
    id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
    creditAccountId: string;
    creditAccount: AccountResponse;
    debitAccountId: string;
    debitAccount: AccountResponse;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTypeMovementDto {
    name: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
    creditAccountId: string;
    debitAccountId: string;
}


export interface UpdateTypeMovementDto {
    name?: string;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    creditAccountId?: string;
    debitAccountId?: string;
}

export interface TypeMovementListResponse {
    data: TypeMovementResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}