/**
 * Ensures all cases are handled at compile time
 */
export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
};

// Example: API State Machine
export type ApiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; timestamp: number }
  | { status: 'error'; error: Error; retryCount: number };

export const handleApiState = <T, R>(
  state: ApiState<T>,
  handlers: {
    idle: () => R;
    loading: () => R;
    success: (data: T, timestamp: number) => R;
    error: (error: Error, retryCount: number) => R;
  }
): R => {
  switch (state.status) {
    case 'idle':
      return handlers.idle();
    case 'loading':
      return handlers.loading();
    case 'success':
      return handlers.success(state.data, state.timestamp);
    case 'error':
      return handlers.error(state.error, state.retryCount);
    default:
      return assertNever(state); // Compile error if case missed
  }
};