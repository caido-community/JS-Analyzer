export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}

export class ScanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanError";
  }
}

export class FilterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FilterError";
  }
}

export class AssetNotFoundError extends Error {
  constructor(requestId: string) {
    super(`Asset not found: ${requestId}`);
    this.name = "AssetNotFoundError";
  }
}
