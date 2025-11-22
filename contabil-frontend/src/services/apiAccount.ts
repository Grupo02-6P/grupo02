import api from './api';

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginationResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

export interface Account {
  id: string;
  name: string;
  type: string;
  code: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountDto {
  name: string;
  type: string;
  code: string;
  parent_id?: string;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {}

export interface GetAccountsParams extends PaginationParams {
  name?: string;
  type?: string;
  code?: string;
}

export async function getAccounts(
  params: GetAccountsParams,
): Promise<PaginationResponse<Account>> {
  const response = await api.get('/account', { params });
  return response.data;
}

export async function getAccountById(id: string): Promise<Account> {
  const response = await api.get(`/account/${id}`);
  return response.data;
}

export async function createAccount(dto: CreateAccountDto): Promise<Account> {
  const response = await api.post('/account', dto);
  return response.data;
}

export async function updateAccount(
  id: string,
  dto: UpdateAccountDto,
): Promise<Account> {
  const response = await api.patch(`/account/${id}`, dto);
  return response.data;
}

export async function deleteAccount(id: string): Promise<void> {
  await api.delete(`/account/${id}`);
}
