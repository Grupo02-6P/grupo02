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

export interface AccountWithBalanceResponse {
    code: string
    name: string
    description: string
    level: number
    acceptsPosting: boolean
    active: 'ACTIVE' | 'INACTIVE';
    parentAccountId: string
    createdAt: string
    updatedAt: string
    journalLines: any[]
    balance: number
    totalDebit: number
    totalCredit: number
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

export interface AccountWithBalanceListResponse {
    data: AccountWithBalanceResponse[];
}