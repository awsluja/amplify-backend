import { getEntryFileForOperation } from '../../pathfinder.js';
import { a } from '@aws-amplify/data-schema';
import { AdminOperationFunctionFactory } from '../../factory_standalone.js';

/**
 * A mutation that adds users to groups
 * @param customFunctionName - provide a custom name for the function that handles the mutation
 * @returns mutation
 */
export const addUserToGroup = (
  customFunctionName: string = 'add-user-to-group'
) => {
  const adminAddUserToGroupFunction = new AdminOperationFunctionFactory({
    name: customFunctionName,
    entry: getEntryFileForOperation('add-user-to-group', 'handler.js'),
    actions: ['cognito-idp:AdminAddUserToGroup'],
  });
  return a
    .mutation()
    .arguments({
      userId: a.string().required(),
      groupName: a.string().required(),
    })
    .handler(a.handler.function(adminAddUserToGroupFunction))
    .returns(a.json());
};
