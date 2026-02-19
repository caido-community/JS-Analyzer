import { describe, expect, it, vi } from "vitest";

import { emit, on } from "./eventBus";

describe("eventBus", () => {
  it("emit does not throw when no listeners are registered", () => {
    expect(() =>
      emit("scan-started", { scanId: "test", totalFiles: 0 }),
    ).not.toThrow();
  });

  it("emit calls registered listeners", () => {
    const listener = vi.fn();
    on("asset-detected", listener);

    const data = {
      url: "https://example.com/app.js",
      host: "example.com",
      contentType: "application/javascript",
    };
    emit("asset-detected", data);

    expect(listener).toHaveBeenCalledWith(data);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
