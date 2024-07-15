import { Construct } from 'constructs';
import { aws_cognito } from 'aws-cdk-lib';
import {
  AuthResources,
  // BackendOutputStorageStrategy,
  ResourceProvider,
} from '@aws-amplify/plugin-types';
import { CfnUserPool, UserPool } from 'aws-cdk-lib/aws-cognito';

export type ReferenceAuthProps = {
  userPoolId: string; // OR ARN
  identityPoolId: string; // OR ARN
  authRoleArn: string;
  authRoleName: string;
  unauthRoleArn: string;
  unauthRoleName: string;
};

/**
 * Hello world construct implementation
 */
export class ReferenceAuthConstruct
  extends Construct
  implements ResourceProvider<AuthResources>
{
  resources: AuthResources;

  /**
   * Create a new AmplifyConstruct
   */
  constructor(scope: Construct, id: string, props: ReferenceAuthProps) {
    super(scope, id);

    this.resources.userPool = aws_cognito.UserPool.fromUserPoolId(
      this,
      'UserPool',
      props.userPoolId
    );
    // TODO: does this even work, can we get this data from import
    const userpoolcfn = (this.resources.userPool as UserPool).node
      .defaultChild as CfnUserPool;
    userpoolcfn.mfaConfiguration;

    // TODO: if above doesn't work, we want to see if we can async fetch that info (describeUserPool)
    // and auto-fill it
    // if so, TODO: figure out if we can make that call, and where we can do it/how

    // if all we need is IdentityPoolID, this is fine
    // can we get the allowUnauthenticatedIdentities flag from it?
    // this.resources.cfnResources.cfnIdentityPool = IdentityPool =/= cfnIdentityPool

    this.resources.userPoolClient =
      aws_cognito.UserPoolClient.fromUserPoolClientId(this, 'UserPoolClient');
  }
}
