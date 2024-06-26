import {
  AllowModifierForCustomOperation,
  Authorization,
  a,
} from '@aws-amplify/data-schema';
import { addUserToGroup } from './operations/add-user-to-group/index.js';
import { listGroupsForUser } from './operations/list-groups-for-user/index.js';

/**
 * Generate an admin schema that can be combined with your existing schema.
 * @returns a schema containing admin operations enabled with the specified authorization method.
 */
export const AdminSchema = () => {
  return {
    authorization: (
      callback: (
        allow: AllowModifierForCustomOperation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) => Authorization<any, any, any>
    ) => {
      return a.schema({
        AdminAddUserToGroupResult: a.customType({}), // for example
        AdminAddUserToGroup: addUserToGroup().authorization(callback),
        AdminListGroupsForUser: listGroupsForUser().authorization(callback),
      });
    },
  };
};
