import * as path from 'path';
import { fileURLToPath } from 'node:url';

/**
 * Compute path based on customer project
 * @param entryFile  entryFile
 * @returns resolved path that works in customer project
 */
export const getAbsolutePathTo = (entryFile: string) => {
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  const resourcesRoot = path.normalize(dirname);
  const resolvedPath = path.join(resourcesRoot, entryFile);
  return resolvedPath;
};
