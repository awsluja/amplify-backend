import { describe, it } from 'node:test';
import { AmplifyReferenceAuth } from './index.js';
import { App, Stack } from 'aws-cdk-lib';

void describe('AmplifyConstruct', () => {
  void it('creates a queue if specified', () => {
    const app = new App();
    const stack = new Stack(app);
    new AmplifyReferenceAuth(stack, 'test', {
      authRoleArn: 'authRoleArn',
      unauthRoleArn: 'unauthRoleArn',
      identityPoolId: 'identityPoolId',
      userPoolClientId: 'userPoolClientId',
      userPoolId: 'userPoolId',
    });
  });
});
