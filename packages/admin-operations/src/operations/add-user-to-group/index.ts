import { getAbsolutePathTo } from '../../pathfinder.js';
import { AdminFunctionFactory } from '../../factory.js';
import { a } from '@aws-amplify/data-schema';
/**
 * A mutation that adds users to groups
 * @param customFunctionName provide a custom name for the function that handles the mutation
 * @returns mutation
 */
export const addUserToGroup = (
  customFunctionName: string = 'add-user-to-group'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  const adminAddUserToGroupFunction = new AdminFunctionFactory(
    ['cognito-idp:AdminAddUserToGroup'],
    {
      name: customFunctionName,
      entry: getAbsolutePathTo('handler.ts'),
    },
    new Error().stack
  );
  return a
    .mutation()
    .arguments({
      userId: a.string().required(),
      groupName: a.string().required(),
    })
    .handler(a.handler.function(adminAddUserToGroupFunction))
    .returns(a.json());
};
