export function debounce<T, S>(
  request: (...parameters: T[]) => Promise<S>,
  duration: number,
): (...parameters: T[]) => Promise<S> {
  let timeout: NodeJS.Timeout;
  let resolve: (value: S | PromiseLike<S>) => void;
  let reject: (reason?: unknown) => void;

  let promise: Promise<S> | undefined;

  async function debounced(...parameters: T[]): Promise<S> {
    clearTimeout(timeout);

    promise ??= new Promise<S>((innerResolve, innerReject) => {
      resolve = innerResolve;
      reject = innerReject;
    });

    const delayed = async (): Promise<void> => {
      try {
        resolve(await request(...parameters));
      } catch (error) {
        reject(error);
      }
      promise = undefined;
    };

    timeout = setTimeout(delayed, duration);

    return promise;
  }

  return debounced;
}
