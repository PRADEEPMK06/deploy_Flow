import * as fs from 'fs';
import * as path from 'path';

const DATA_FILE = path.resolve(__dirname, '../metadata.json');

/**
 * Persist deployment data to a JSON file.
 */
export function saveDeployments(data: any): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Deployments saved to', DATA_FILE);
  } catch (e) {
    console.error('Failed to save deployments:', e);
  }
}

/**
 * Load deployment data from the JSON file.
 * Returns an array (empty if file missing or corrupted).
 */
export function loadDeployments<T>(): T[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as T[];
    }
  } catch (e) {
    console.error('Failed to load deployments:', e);
  }
  return [] as any;
}