export interface Employee {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  currency: string;
  annual_salary: string;
}

export interface Pagination {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

export interface SalaryGroup {
  currency: string;
  country?: string;
  department?: string;
  headcount: number;
  average_salary: number;
  median_salary: number;
  minimum_salary: number;
  maximum_salary: number;
}

export interface Analytics {
  headcount: number;
  compensation_by_currency: SalaryGroup[];
  compensation_by_country: SalaryGroup[];
  compensation_by_department: SalaryGroup[];
}

export interface EmployeeResponse {
  employees: Employee[];
  pagination: Pagination;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      body.error ??
      (body.errors ? Object.values(body.errors).flat().join(", ") : null) ??
      `Request failed (${response.status})`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}
