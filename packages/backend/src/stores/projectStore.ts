import { accessSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { StoreError } from "../errors";
import { getSDK } from "../sdk";

function ensureDir(dir: string): void {
  try {
    accessSync(dir);
  } catch {
    mkdirSync(dir, { recursive: true });
  }
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    accessSync(filePath);
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  writeFileSync(filePath, JSON.stringify(data, undefined, 2));
}

export class GlobalStore<T> {
  private filePath: string;
  private data: T;

  constructor(filename: string, defaultValue: T) {
    const basePath = getSDK().meta.path();
    ensureDir(basePath);
    this.filePath = join(basePath, filename);
    this.data = readJson(this.filePath, defaultValue);
  }

  get(): T {
    return this.data;
  }

  set(data: T): void {
    this.data = data;
    this.persist();
  }

  update(updater: (current: T) => T): void {
    this.data = updater(this.data);
    this.persist();
  }

  private persist(): void {
    try {
      writeJson(this.filePath, this.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new StoreError(`Failed to persist store: ${message}`);
    }
  }
}

export class ProjectScopedStore<T> {
  private projectId: string | undefined;
  private filename: string;
  private defaultValue: T;
  private data: T;

  constructor(filename: string, defaultValue: T) {
    this.filename = filename;
    this.defaultValue = defaultValue;
    this.data = defaultValue;
  }

  async initialize(): Promise<void> {
    const project = await getSDK().projects.getCurrent();
    if (project !== undefined) {
      this.switchProject(project.getId());
    }
  }

  switchProject(projectId: string | undefined): void {
    this.projectId = projectId;
    if (projectId === undefined) {
      this.data = this.defaultValue;
      return;
    }
    const filePath = this.getFilePath();
    if (filePath !== undefined) {
      this.data = readJson(filePath, this.defaultValue);
    }
  }

  get(): T {
    return this.data;
  }

  set(data: T): void {
    this.data = data;
    this.persist();
  }

  update(updater: (current: T) => T): void {
    this.data = updater(this.data);
    this.persist();
  }

  private getFilePath(): string | undefined {
    if (this.projectId === undefined) return undefined;
    const basePath = getSDK().meta.path();
    const projectDir = join(basePath, "projects", this.projectId);
    ensureDir(projectDir);
    return join(projectDir, this.filename);
  }

  private persist(): void {
    const filePath = this.getFilePath();
    if (filePath === undefined) return;
    try {
      writeJson(filePath, this.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new StoreError(`Failed to persist project store: ${message}`);
    }
  }
}
