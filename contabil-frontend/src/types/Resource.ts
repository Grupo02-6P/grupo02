export interface ResourceResponse {
  id: string;
  name: string;
  description: string;
}

export interface ResourceListResponse {
  data: ResourceResponse[];
}
