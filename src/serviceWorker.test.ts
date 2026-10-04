import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
const listeners = new Map<string, (event: any) => void>();
const cache = { addAll: vi.fn(), put: vi.fn(), match: vi.fn() };
const storage = {
  open: vi.fn(async () => cache),
  keys: vi.fn(async () => ["other-app-cache", "mathgenie-old", "mathgenie-current"]),
  delete: vi.fn(),
  match: vi.fn(),
};
const claim = vi.fn();
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  listeners.clear();
  vi.stubGlobal("__CACHE_VERSION__", "current");
  vi.stubGlobal("__PRECACHE_URLS__", ["/index.html"]);
  vi.stubGlobal("caches", storage);
  vi.stubGlobal("self", {
    location: { origin: "https://app.test" },
    clients: { claim },
    addEventListener: (name: string, handler: (event: any) => void) => listeners.set(name, handler),
  });
  const entry = "./serviceWorker";
  await import(entry);
});
afterEach(() => vi.unstubAllGlobals());
const dispatch = async (name: string, request?: { url: string; method: string; mode: string }) => {
  const tasks: Promise<unknown>[] = [];
  let response: Promise<Response> | undefined;
  listeners.get(name)?.({
    request,
    waitUntil: (task: Promise<unknown>) => tasks.push(task),
    respondWith: (task: Promise<Response>) => {
      response = task;
    },
  });
  const result = await response;
  await Promise.all(tasks);
  return result;
};
const request = { url: "https://app.test/assets/main.js", method: "GET", mode: "cors" };
describe("offline resource lifecycle", () => {
  it("precaches startup and removes only its own obsolete caches", async () => {
    await dispatch("install");
    expect(cache.addAll).toHaveBeenCalledWith(["/index.html"]);
    await dispatch("activate");
    expect(storage.delete).toHaveBeenCalledExactlyOnceWith("mathgenie-old");
    expect(claim).toHaveBeenCalledOnce();
  });
  it("serves fresh documents online and falls back to the shell offline", async () => {
    const fresh = new Response("fresh");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(fresh).mockRejectedValue(new Error("offline")),
    );
    expect(await dispatch("fetch", { ...request, mode: "navigate" })).toBe(fresh);
    const shell = new Response("shell");
    cache.match.mockResolvedValueOnce(shell);
    expect(await dispatch("fetch", { ...request, mode: "navigate" })).toBe(shell);
    cache.match.mockResolvedValueOnce(undefined);
    expect((await dispatch("fetch", { ...request, mode: "navigate" }))?.status).toBe(503);
  });
  it("caches successful same-origin assets, contains failures, ignores other requests", async () => {
    const copy = new Response("copy");
    const fresh = { ok: true, type: "basic", clone: () => copy };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(fresh)
      .mockResolvedValueOnce({ ok: false })
      .mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    cache.match.mockResolvedValue(undefined);
    expect(await dispatch("fetch", request)).toBe(fresh);
    expect(cache.put).toHaveBeenCalledWith(request, copy);
    await dispatch("fetch", request);
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect((await dispatch("fetch", request))?.status).toBe(503);
    cache.match.mockResolvedValueOnce(copy);
    expect(await dispatch("fetch", request)).toBe(copy);
    expect(await dispatch("fetch", { ...request, url: "https://app.test/sw.js" })).toBeUndefined();
    expect(await dispatch("fetch", { ...request, method: "POST" })).toBeUndefined();
    expect(await dispatch("fetch", { ...request, url: "https://other.test/x" })).toBeUndefined();
  });
});
