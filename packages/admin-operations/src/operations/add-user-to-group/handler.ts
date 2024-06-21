import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

type AddUserToGroupEvent = { arguments: { userId: string; groupName: string } };

/**
 * Handler
 * @param event event
 * @returns response
 */
export const handler = async (event: AddUserToGroupEvent) => {
  const { userId, groupName } = event.arguments;
  const command = new AdminAddUserToGroupCommand({
    Username: userId,
    GroupName: groupName,
    UserPoolId: process.env.AMPLIFY_AUTH_USERPOOL_ID,
  });
  const response = await client.send(command);
  return response;
};
