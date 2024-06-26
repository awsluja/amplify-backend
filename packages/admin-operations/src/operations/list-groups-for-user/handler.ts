import {
  AdminListGroupsForUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

type ListGroupsForUserEvent = { arguments: { userId: string } };

/**
 * Handler
 * @param event event
 * @returns response
 */
export const handler = async (event: ListGroupsForUserEvent) => {
  const { userId } = event.arguments;
  const command = new AdminListGroupsForUserCommand({
    Username: userId,
    UserPoolId: process.env.AMPLIFY_AUTH_USERPOOL_ID,
  });
  const response = await client.send(command);
  return response;
};
