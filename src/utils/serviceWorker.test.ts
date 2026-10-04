import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const unregister = vi.fn();
const reload = vi.fn();
let load: () => void;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubGlobal("location", {
    hostname: "localhost",
    origin: "http://localhost",
    href: "http://localhost/",
    reload,
  });
  vi.stubGlobal("navigator", {
    serviceWorker: { ready: Promise.resolve({ unregister }), register: vi.fn() },
  });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
  vi.spyOn(globalThis, "addEventListener").mockImplementation((_event, listener) => {
    load = listener as () => void;
  });
  const { register } = await import("./serviceWorker");
  register();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("invalid service worker recovery", () => {
  it("waits for removal to finish before reloading", async () => {
    let removed: (value: boolean) => void = () => {};
    unregister.mockReturnValue(
      new Promise<boolean>((resolve) => {
        removed = resolve;
      }),
    );
    load();
    await vi.waitFor(() => expect(unregister).toHaveBeenCalledOnce());
    expect(reload).not.toHaveBeenCalled();
    removed(true);
    await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce());
  });

  it("contains removal failures without reloading", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    unregister.mockRejectedValue(new Error("removal failed"));
    load();
    await vi.waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        "Error removing invalid service worker:",
        "removal failed",
      ),
    );
    expect(reload).not.toHaveBeenCalled();
  });

  it("keeps an installed worker during temporary server failures", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 503 }));
    load();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    expect(unregister).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });
});
