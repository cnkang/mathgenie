import { describe, expect, it, vi } from 'vite-plus/test';
import { serviceWorkerPlugin } from '../../../scripts/service-worker-plugin';
const build = (html: string): string => {
  const emitFile = vi.fn();
  const bundle = {
    'index.html': { type: 'asset', source: html },
    'assets/index-mainhash.js': { type: 'chunk', code: 'application' },
    'assets/generation.worker-workerhash.js': { type: 'chunk', code: 'worker' },
    'assets/jspdf.es.min-pdfhash.js': { type: 'chunk', code: 'pdf' },
    'assets/i18n-zh-langhash.js': { type: 'chunk', code: 'translation' },
  };
  const generate = serviceWorkerPlugin().generateBundle as (...args: any[]) => void;
  generate.call({ emitFile }, {}, bundle);
  return emitFile.mock.calls[0][0].source;
};
describe('offline build contract', () => {
  it('changes cache versions for HTML-only updates and keeps demand-loaded PDF out of startup caching', () => {
    const first = build('<html>old</html>');
    const updated = build('<html>new</html>');
    expect(first.match(/"[a-f0-9]{16}"/)?.[0]).not.toBe(updated.match(/"[a-f0-9]{16}"/)?.[0]);
    expect(first).toContain('/assets/generation.worker-workerhash.js');
    expect(first).toContain('/assets/i18n-zh-langhash.js');
    expect(first).not.toContain('jspdf.es.min-pdfhash');
    expect(first).not.toContain('declare const');
  });
});
