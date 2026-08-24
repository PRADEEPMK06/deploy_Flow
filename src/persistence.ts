// src/persistence.ts
export function saveData(key: string, value: any): void {
  // TODO: implement actual persistence (e.g., write to file, DB, etc.)
  console.log(`Saving ${key}`, value);
}

export function loadData<T>(key: string): T | undefined {
  // TODO: implement actual load logic
  console.log(`Loading ${key}`);
  return undefined;
}