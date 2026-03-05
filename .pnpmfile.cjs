/**
 * Trim unused optional dependencies from jspdf.
 *
 * This project only uses jsPDF text APIs and does not use the HTML rendering
 * plugin chain that pulls optional dependencies (canvg/core-js/dompurify/html2canvas).
 */
const STRIPPED_JSPDF_OPTIONAL_DEPS = new Set([
  'canvg',
  'core-js',
  'dompurify',
  'html2canvas',
]);

/** @type {import('pnpm').Hooks} */
const hooks = {
  readPackage(pkg) {
    if (pkg.name === 'jspdf' && pkg.optionalDependencies) {
      for (const depName of STRIPPED_JSPDF_OPTIONAL_DEPS) {
        delete pkg.optionalDependencies[depName];
      }

      if (Object.keys(pkg.optionalDependencies).length === 0) {
        delete pkg.optionalDependencies;
      }
    }

    return pkg;
  },
};

module.exports = { hooks };
