import type { RoleResponse } from "./Role";

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    status: 'ACTIVE' | 'INACTIVE';
    companyId: string;
    role: RoleResponse;
}

export interface CreateUserDto {
    id?: string;
    name: string;
    email: string;
    status: 'ACTIVE' | 'INACTIVE';
    password: string;
    roleId: string;
}

export interface UpdateUserDto {
    id: string;
    name?: string;
    email?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    password?: string;
    roleId?: string;
}
    
export interface UserListResponse {
    data: UserResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}