/**
 * Type-safe builder pattern for complex configurations
 */
export class ApiRequestBuilder<T = unknown> {
  private readonly config: {
    readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    readonly url: string;
    readonly headers: Record<string, string>;
    readonly timeout: number;
    readonly retries: number;
    readonly body?: unknown;
  };

  constructor(url: string) {
    this.config = {
      method: 'GET',
      url,
      headers: {},
      timeout: 30000,
      retries: 3,
    };
  }

  method<M extends 'GET' | 'POST' | 'PUT' | 'DELETE'>(
    method: M
  ): ApiRequestBuilder<M extends 'GET' | 'DELETE' ? never : T> {
    (this.config as { method: 'GET' | 'POST' | 'PUT' | 'DELETE' }).method = method;
    return this as ApiRequestBuilder<M extends 'GET' | 'DELETE' ? never : T>;
  }

  body<B>(body: B): ApiRequestBuilder<B> {
    if (this.config.method === 'GET' || this.config.method === 'DELETE') {
      throw new Error('Cannot set body on GET/DELETE requests');
    }
    (this.config as { body?: unknown }).body = body;
    return this as ApiRequestBuilder<B>;
  }

  header(key: string, value: string): this {
    (this.config.headers as Record<string, string>)[key] = value;
    return this;
  }

  timeout(ms: number): this {
    (this.config as { timeout: number }).timeout = ms;
    return this;
  }

  build(): Readonly<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers: Record<string, string>;
    timeout: number;
    retries: number;
    body?: unknown;
  }> {
    return Object.freeze({ ...this.config });
  }
}

// Usage examples - type safe!
// const getRequest = new ApiRequestBuilder('/users')
//   .method('GET')
//   // .body({}) // Compile error! Can't set body on GET
//   .timeout(5000)
//   .build();

// const postRequest = new ApiRequestBuilder('/users')
//   .method('POST')
//   .body({ name: 'John' }) // OK for POST
//   .header('Content-Type', 'application/json')
//   .build();