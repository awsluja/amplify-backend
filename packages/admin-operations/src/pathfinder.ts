import * as path from 'path';
import { fileURLToPath } from 'node:url';
const PARENT_DIRECTORY = 'operations';
/**
 * Compute the absolute path to the entry file so it can be referenced
 * in a customer's project.
 * @param subdirectory the subdirectory of the operation in the PARENT_DIRECTORY
 * @param entryFile the filename for the handler's entry file
 * @returns an absolute path to the entry file
 */
export const getEntryFileForOperation = (
  subdirectory: string,
  entryFile: string
) => {
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  const resourcesRoot = path.normalize(
    path.join(dirname, PARENT_DIRECTORY, subdirectory)
  );
  const resolvedPath = path.join(resourcesRoot, entryFile);
  return resolvedPath;
};
