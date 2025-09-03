import fs from 'fs';
import path from 'path';

export type TestData = Record<string, any>;

/**
 * Loads and merges test data from feature-scoped JSON files
 * Resolution order: feature data default → scenario
 */
export function loadTestData(
  env: string, 
  featureName?: string, 
  scenarioKey?: string
): TestData {
  const projectRoot = process.cwd();
  
  // Helper to safely read and parse JSON files
  const readJsonFile = (filePath: string): TestData => {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`Warning: Could not read/parse ${filePath}:`, error);
    }
    return {};
  };

  // Initialize data sources
  let featureDataDefault: TestData = {};
  let scenarioData: TestData = {};
  
  if (featureName) {
    // Load test data from features/{feature}/data/
    featureDataDefault = readJsonFile(path.join(projectRoot, 'features', featureName, 'data', 'default.json'));
    
    if (scenarioKey) {
      // Load scenario data from: scenarios/{scenarioKey}.json
      const scenarioPath = path.join(projectRoot, 'features', featureName, 'data', 'scenarios', `${scenarioKey}.json`);
      
      if (fs.existsSync(scenarioPath)) {
        scenarioData = readJsonFile(scenarioPath);
        console.log(`Loaded scenario data from: ${scenarioPath}`);
      } else {
        console.warn(`Warning: Scenario file not found for ${scenarioKey} in feature ${featureName}`);
      }
    }
  }
  
  // Merge all data sources with later sources overriding earlier ones
  const mergedData = [
    featureDataDefault,
    scenarioData
  ].reduce((acc, current) => deepMerge(acc, current), {});
  
  return mergedData;
}

/**
 * Deep merge objects, with later objects overriding earlier ones
 */
function deepMerge<T>(base: T, override: Partial<T>): T {
  if (Array.isArray(base) || Array.isArray(override)) {
    return (override as T) ?? base;
  }
  
  if (typeof base !== 'object' || base === null || typeof override !== 'object' || override === null) {
    return (override as T) ?? base;
  }
  
  const result: any = { ...base };
  
  for (const key of Object.keys(override || {})) {
    const baseValue: any = (base as any)[key];
    const overrideValue: any = (override as any)[key];
    
    result[key] = baseValue && typeof baseValue === 'object' && overrideValue && typeof overrideValue === 'object'
      ? deepMerge(baseValue, overrideValue)
      : overrideValue ?? baseValue;
  }
  
  return result;
}
