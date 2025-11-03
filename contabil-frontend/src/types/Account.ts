export interface AccountResponse {
    code: string
    name: string
    description: string
    level: number
    acceptsPosting: boolean
    active: 'ACTIVE' | 'INACTIVE';
    parentAccountId: string
    createdAt: string
    updatedAt: string
}

export interface CreateAccountDto {
    code: string
    name: string
    description: string
    level: number
    acceptsPosting: boolean
    active: 'ACTIVE' | 'INACTIVE';
    parentAccountId: string
}

export interface UpdateAccountDto {
    code?: string
    name?: string
    description?: string
    level?: number
    acceptsPosting?: boolean
    active?: 'ACTIVE' | 'INACTIVE';
    parentAccountId?: string
}

export interface AccountListResponse {
    data: AccountResponse[];
}