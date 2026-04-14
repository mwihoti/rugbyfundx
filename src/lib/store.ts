import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export function readStore<T>(filename: string, fallback: T): T {
  const filepath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filepath)) return fallback;
    return JSON.parse(fs.readFileSync(filepath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(filename: string, data: T): void {
  const filepath = path.join(DATA_DIR, filename);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}
