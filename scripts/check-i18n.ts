#!/usr/bin/env tsx
/**
 * i18n Translation Completeness Checker
 *
 * This script validates that all translation files have the same keys
 * and reports any missing translations across supported languages.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { runInNewContext } from 'vm';

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalKeys: number;
    languages: string[];
    missingTranslations: Record<string, string[]>;
  };
}

const TRANSLATIONS_DIR = join(process.cwd(), 'src/i18n/translations');
const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'ja'];

/**
 * Flatten nested translation object into dot-notation keys
 */
function flattenTranslations(obj: TranslationObject, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      flattened[fullKey] = value;
    } else if (typeof value === 'object' && value != null) {
      Object.assign(flattened, flattenTranslations(value, fullKey));
    }
  }

  return flattened;
}

/**
 * Load and parse a translation file
 */
function loadTranslationFile(language: string): Record<string, string> {
  try {
    const filePath = join(TRANSLATIONS_DIR, `${language}.ts`);
    const content = readFileSync(filePath, 'utf-8');

    // Extract the default export object
    const regex = /export default\s+({[\s\S]*})\s*as const;?/;
    const match = regex.exec(content);
    if (!match) {
      throw new Error(`Could not parse translation file for ${language}`);
    }

    const translations = runInNewContext(
      `(${match[1]})`,
      {},
      { timeout: 1000 }
    ) as TranslationObject;
    return flattenTranslations(translations);
  } catch (error) {
    throw new Error(`Failed to load translations for ${language}: ${error}`);
  }
}

/**
 * Check parameter consistency between translations
 */
function checkParameterConsistency(
  key: string,
  translations: Record<string, Record<string, string>>
): string[] {
  const errors: string[] = [];
  const baseTranslation = translations.en?.[key];

  if (!baseTranslation) {
    return errors;
  }

  // Extract parameters from English translation
  const PARAM_REGEX = /{{[\w.-]+}}/g;
  const baseParams = Array.from(baseTranslation.matchAll(PARAM_REGEX), m => m[0].slice(2, -2));

  // Check each language has the same parameters
  for (const [lang, langTranslations] of Object.entries(translations)) {
    if (lang === 'en') {
      continue;
    }

    const translation = langTranslations[key];
    if (!translation) {
      continue;
    }

    const params = Array.from(translation.matchAll(PARAM_REGEX), m => m[0].slice(2, -2));

    // Check for missing parameters
    const missingParams = baseParams.filter(param => !params.includes(param));
    const extraParams = params.filter(param => !baseParams.includes(param));

    if (missingParams.length > 0) {
      errors.push(`${lang}.${key}: Missing parameters: ${missingParams.join(', ')}`);
    }

    if (extraParams.length > 0) {
      errors.push(`${lang}.${key}: Extra parameters: ${extraParams.join(', ')}`);
    }
  }

  return errors;
}

/**
 * Load translation files and return translations with available languages
 */
function loadTranslations(): { translations: Record<string, Record<string, string>>; availableLanguages: string[] } {
  const files = readdirSync(TRANSLATIONS_DIR);
  const translationFiles = files.filter(file => file.endsWith('.ts'));
  
  if (translationFiles.length === 0) {
    throw new Error('No translation files found');
  }

  const translations: Record<string, Record<string, string>> = {};
  const availableLanguages: string[] = [];

  for (const file of translationFiles) {
    const lang = file.replace('.ts', '');
    availableLanguages.push(lang);
    translations[lang] = loadTranslationFile(lang);
  }

  return { translations, availableLanguages };
}

/**
 * Check for missing and extra keys in translations
 */
function checkTranslationKeys(
  englishKeys: string[],
  availableLanguages: string[],
  translations: Record<string, Record<string, string>>
): { missingTranslations: Record<string, string[]>; errors: string[]; warnings: string[] } {
  const missingTranslations: Record<string, string[]> = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const lang of availableLanguages) {
    if (lang === 'en') {
      continue;
    }

    const langKeys = Object.keys(translations[lang] || {});
    const missingKeys = englishKeys.filter(key => !langKeys.includes(key));
    const extraKeys = langKeys.filter(key => !englishKeys.includes(key));

    if (missingKeys.length > 0) {
      missingTranslations[lang] = missingKeys;
      errors.push(
        `${lang}: Missing ${missingKeys.length} translations: ${missingKeys.slice(0, 5).join(', ')}${missingKeys.length > 5 ? '...' : ''}`
      );
    }

    if (extraKeys.length > 0) {
      warnings.push(
        `${lang}: Has ${extraKeys.length} extra keys not in English: ${extraKeys.slice(0, 3).join(', ')}${extraKeys.length > 3 ? '...' : ''}`
      );
    }
  }

  return { missingTranslations, errors, warnings };
}

/**
 * Check for empty translations
 */
function checkEmptyTranslations(translations: Record<string, Record<string, string>>): string[] {
  const warnings: string[] = [];
  
  for (const [lang, langTranslations] of Object.entries(translations)) {
    for (const [key, value] of Object.entries(langTranslations)) {
      if (!value || value.trim() === '') {
        warnings.push(`${lang}.${key}: Empty translation`);
      }
    }
  }
  
  return warnings;
}

/**
 * Validate all translation files
 */
function validateTranslations(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalKeys: 0,
      languages: [],
      missingTranslations: {},
    },
  };

  try {
    const { translations, availableLanguages } = loadTranslations();
    result.stats.languages = availableLanguages;

    // Check for missing supported languages
    const missingLanguages = SUPPORTED_LANGUAGES.filter(lang => !availableLanguages.includes(lang));
    if (missingLanguages.length > 0) {
      result.warnings.push(`Missing translation files for: ${missingLanguages.join(', ')}`);
    }

    // Get all unique keys from English (reference language)
    const englishKeys = Object.keys(translations.en || {});
    result.stats.totalKeys = englishKeys.length;

    if (englishKeys.length === 0) {
      result.errors.push('No translation keys found in English file');
      result.isValid = false;
      return result;
    }

    // Check translation keys
    const keyCheck = checkTranslationKeys(englishKeys, availableLanguages, translations);
    result.stats.missingTranslations = keyCheck.missingTranslations;
    result.errors.push(...keyCheck.errors);
    result.warnings.push(...keyCheck.warnings);

    // Check parameter consistency
    for (const key of englishKeys) {
      const paramErrors = checkParameterConsistency(key, translations);
      result.errors.push(...paramErrors);
    }

    // Check for empty translations
    result.warnings.push(...checkEmptyTranslations(translations));

    result.isValid = result.errors.length === 0;
  } catch (error) {
    result.errors.push(`Validation failed: ${error}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Generate summary section
 */
function generateSummary(result: ValidationResult): string[] {
  return [
    '# 🌐 i18n Translation Report\n',
    '## 📊 Summary\n',
    `- **Total Keys**: ${result.stats.totalKeys}`,
    `- **Languages**: ${result.stats.languages.length} (${result.stats.languages.join(', ')})`,
    `- **Status**: ${result.isValid ? '✅ Valid' : '❌ Issues Found'}`,
    `- **Errors**: ${result.errors.length}`,
    `- **Warnings**: ${result.warnings.length}\n`,
  ];
}

/**
 * Generate missing translations section
 */
function generateMissingTranslations(missingTranslations: Record<string, string[]>): string[] {
  if (Object.keys(missingTranslations).length === 0) {
    return [];
  }
  
  const lines = ['## ❌ Missing Translations\n'];
  
  for (const [lang, keys] of Object.entries(missingTranslations)) {
    lines.push(`### ${lang.toUpperCase()}`);
    lines.push(`Missing ${keys.length} translations:\n`);
    
    for (const key of keys.slice(0, 10)) {
      lines.push(`- \`${key}\``);
    }
    
    if (keys.length > 10) {
      lines.push(`- ... and ${keys.length - 10} more\n`);
    } else {
      lines.push('');
    }
  }
  
  return lines;
}

/**
 * Generate detailed report
 */
function generateReport(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push(...generateSummary(result));
  lines.push(...generateMissingTranslations(result.stats.missingTranslations));

  // Errors
  if (result.errors.length > 0) {
    lines.push('## 🚨 Errors\n');
    result.errors.forEach(error => lines.push(`- ${error}`));
    lines.push('');
  }

  // Warnings
  if (result.warnings.length > 0) {
    lines.push('## ⚠️ Warnings\n');
    result.warnings.forEach(warning => lines.push(`- ${warning}`));
    lines.push('');
  }

  if (result.isValid) {
    lines.push('## 🎉 All Good!\n');
    lines.push('All translation files are complete and consistent.');
  }

  return lines.join('\n');
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🌐 Checking i18n translation completeness...\n');

  const result = validateTranslations();
  const report = generateReport(result);

  console.log(report);

  // Write report to file for CI
  if (process.env.CI) {
    const { writeFileSync } = await import('fs');
    writeFileSync('i18n-report.md', report);

    // Also create a JSON report for programmatic use
    writeFileSync('i18n-report.json', JSON.stringify(result, null, 2));
  }

  // Exit with appropriate code
  if (!result.isValid) {
    console.error('\n❌ i18n validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ i18n validation passed!');
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateReport, validateTranslations, loadTranslations, checkTranslationKeys, checkEmptyTranslations };
