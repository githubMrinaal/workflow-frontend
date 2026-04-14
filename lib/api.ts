import { getToken } from "./auth";
import type {
  AuthResponse,
  CreateRequestDTO,
  DecisionDTO,
  LoginRequest,
  RegisterRequest,
  WorkflowRequest,
} from "./types";

async function fetchApi<T>(
  url: string,
  method: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data.message ?? message;
    } catch {
      // use statusText as fallback
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

// Auth
export const register = (data: RegisterRequest): Promise<AuthResponse> =>
  fetchApi("/api/auth/register", "POST", data);

export const login = (data: LoginRequest): Promise<AuthResponse> =>
  fetchApi("/api/auth/login", "POST", data);

// Requests
export const createRequest = (data: CreateRequestDTO): Promise<WorkflowRequest> =>
  fetchApi("/api/requests", "POST", data);

export const getMyRequests = (): Promise<WorkflowRequest[]> =>
  fetchApi("/api/requests/mine", "GET");

export const getRequestById = (id: number): Promise<WorkflowRequest> =>
  fetchApi(`/api/requests/${id}`, "GET");

export const getPendingRequests = (): Promise<WorkflowRequest[]> =>
  fetchApi("/api/requests/pending", "GET");

export const approveRequest = (id: number, data: DecisionDTO): Promise<WorkflowRequest> =>
  fetchApi(`/api/requests/${id}/approve`, "POST", data);

export const rejectRequest = (id: number, data: DecisionDTO): Promise<WorkflowRequest> =>
  fetchApi(`/api/requests/${id}/reject`, "POST", data);

export const cancelRequest = (id: number): Promise<WorkflowRequest> =>
  fetchApi(`/api/requests/${id}/cancel`, "POST", {});