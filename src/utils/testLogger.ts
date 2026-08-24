import * as fs from 'fs';
import * as path from 'path';

export const LOG_PATH = path.resolve(__dirname, '../../.test-run-data.json');

export interface ApiCallLog {
  testName: string;
  method: string;
  url: string;
  params?: Record<string, unknown>;
  requestBody?: unknown;
  statusCode: number;
  responseBody?: unknown;
  durationMs: number;
}

const buffer: ApiCallLog[] = [];

export function logApiCall(entry: ApiCallLog): void {
  buffer.push(entry);
  try {
    fs.writeFileSync(LOG_PATH, JSON.stringify(buffer), 'utf8');
  } catch {}
}

export function clearLog(): void {
  buffer.length = 0;
  try {
    fs.writeFileSync(LOG_PATH, '[]', 'utf8');
  } catch {}
}
