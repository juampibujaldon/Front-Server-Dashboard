interface RequestOptions {
  signal?: AbortSignal;
}

export class ApiClient {
  private static instance: ApiClient | null = null;

  private constructor(private readonly baseUrl: string) {}

  static getInstance(baseUrl: string) {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(baseUrl);
    }
    return ApiClient.instance;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = this.composeUrl(path);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status} al consultar ${url}`);
    }

    return (await response.json()) as T;
  }

  private composeUrl(path: string) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}
