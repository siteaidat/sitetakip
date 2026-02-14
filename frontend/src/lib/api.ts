const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "An error occurred");
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    const res = await this.request<{
      token: string;
      user: { id: string; email: string; full_name: string; role: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async register(
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) {
    const res = await this.request<{
      token: string;
      user: { id: string; email: string; full_name: string; role: string };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        phone,
      }),
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  // Organizations
  async getOrganizations() {
    return this.request("/organizations");
  }

  async createOrganization(data: {
    name: string;
    address: string;
    total_units: number;
    monthly_due_amount: number;
  }) {
    return this.request("/organizations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getOrganization(id: string) {
    return this.request(`/organizations/${id}`);
  }

  // Units
  async getUnits(orgId: string) {
    return this.request(`/organizations/${orgId}/units`);
  }

  async createUnit(orgId: string, data: { unit_number: string; floor: number }) {
    return this.request(`/organizations/${orgId}/units`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Residents
  async getResidents(orgId: string) {
    return this.request(`/organizations/${orgId}/residents`);
  }

  async createResident(data: {
    full_name: string;
    phone: string;
    email?: string;
    unit_id?: string;
  }) {
    return this.request(`/organizations/${data.unit_id}/residents`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Dues
  async getDues(orgId: string, params?: { status?: string; year?: number; month?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.year) query.set("year", String(params.year));
    if (params?.month) query.set("month", String(params.month));

    const qs = query.toString();
    return this.request(`/organizations/${orgId}/dues${qs ? `?${qs}` : ""}`);
  }

  async createDue(orgId: string, data: { unit_id: string; amount: number; due_date: string }) {
    return this.request(`/organizations/${orgId}/dues`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async bulkCreateDues(orgId: string, data: { amount: number; due_date: string; description?: string }) {
    return this.request(`/organizations/${orgId}/dues/bulk`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async markDuePaid(orgId: string, dueId: string, paymentMethod: string) {
    return this.request(`/organizations/${orgId}/dues/${dueId}/pay`, {
      method: "PATCH",
      body: JSON.stringify({ payment_method: paymentMethod }),
    });
  }

  async getOverdueDues(orgId: string) {
    return this.request(`/organizations/${orgId}/dues/overdue`);
  }

  // Expenses
  async getExpenses(orgId: string, params?: { year?: number; month?: number }) {
    const query = new URLSearchParams();
    if (params?.year) query.set("year", String(params.year));
    if (params?.month) query.set("month", String(params.month));

    const qs = query.toString();
    return this.request(`/organizations/${orgId}/expenses${qs ? `?${qs}` : ""}`);
  }

  async createExpense(orgId: string, data: {
    category: string;
    amount: number;
    date: string;
    description: string;
  }) {
    return this.request(`/organizations/${orgId}/expenses`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Reports
  async getMonthlySummary(orgId: string, year?: number, month?: number) {
    const query = new URLSearchParams();
    if (year) query.set("year", String(year));
    if (month) query.set("month", String(month));

    const qs = query.toString();
    return this.request(`/organizations/${orgId}/reports/monthly${qs ? `?${qs}` : ""}`);
  }

  async getExpenseBreakdown(orgId: string, year?: number, month?: number) {
    const query = new URLSearchParams();
    if (year) query.set("year", String(year));
    if (month) query.set("month", String(month));

    const qs = query.toString();
    return this.request(`/organizations/${orgId}/reports/expenses${qs ? `?${qs}` : ""}`);
  }
}

export const api = new ApiClient();
