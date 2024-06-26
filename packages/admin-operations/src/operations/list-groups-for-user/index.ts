import { getEntryFileForOperation } from '../../pathfinder.js';
import { AdminFunctionFactory } from '../../factory.js';
import { a } from '@aws-amplify/data-schema';
/**
 * A query that gets all the groups for a user.
 * @param customFunctionName provide a custom name for the function that handles the mutation
 * @returns query
 */
export const listGroupsForUser = (
  customFunctionName: string = 'list-groups-for-user'
) => {
  const adminAdminListGroupsForUser = new AdminFunctionFactory(
    ['cognito-idp:AdminListGroupsForUser'],
    {
      name: customFunctionName,
      entry: getEntryFileForOperation('list-groups-for-user', 'handler.js'),
    },
    new Error().stack
  );
  return a
    .query()
    .arguments({
      userId: a.string().required(),
    })
    .handler(a.handler.function(adminAdminListGroupsForUser))
    .returns(a.json());
};
