import { isAxiosError } from 'axios';

export function getErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
