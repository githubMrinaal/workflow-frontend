export type Role = "REQUESTER" | "APPROVER";
export type RequestType = "LEAVE" | "BUDGET";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface WorkflowRequest {
  id: number;
  title: string;
  description: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: string;
  requesterName: string;
  decisionComment?: string;
  decidedAt?: string;
  decidedByName?: string;
  startDate?: string;
  endDate?: string;
  numberOfDays?: number;
  amount?: number;
  currency?: string;
}

export interface CreateRequestDTO {
  title: string;
  description: string;
  type: RequestType;
  startDate?: string;
  endDate?: string;
  numberOfDays?: number;
  amount?: number;
  currency?: string;
}

export interface DecisionDTO {
  comment?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
}