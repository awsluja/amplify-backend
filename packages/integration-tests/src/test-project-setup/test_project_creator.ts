import { TestProjectBase } from './test_project_base.js';
import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { getSecretClient } from '@aws-amplify/backend-secret';
import { DataStorageAuthWithTriggerTestProjectCreator } from './data_storage_auth_with_triggers.js';
import { MinimalWithTypescriptIdiomTestProjectCreator } from './minimal_with_typescript_idioms.js';
import { ConversationHandlerTestProjectCreator } from './conversation_handler_project.js';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { DeployedResourcesFinder } from '../find_deployed_resource.js';
import { e2eToolingClientConfig } from '../e2e_tooling_client_config.js';
import { CustomOutputsTestProjectCreator } from './custom_outputs.js';
import { S3Client } from '@aws-sdk/client-s3';
import { IAMClient } from '@aws-sdk/client-iam';
import { AccessTestingProjectTestProjectCreator } from './access_testing_project.js';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { STSClient } from '@aws-sdk/client-sts';
import { AmplifyClient } from '@aws-sdk/client-amplify';
import { SQSClient } from '@aws-sdk/client-sqs';
import { CloudTrailClient } from '@aws-sdk/client-cloudtrail';

export type TestProjectCreator = {
  readonly name: string;
  createProject: (e2eProjectDir: string) => Promise<TestProjectBase>;
};

/**
 * Generates a list of test projects.
 */
export const getTestProjectCreators = (): TestProjectCreator[] => {
  const testProjectCreators: TestProjectCreator[] = [];

  const cfnClient = new CloudFormationClient(e2eToolingClientConfig);
  const cloudTrailClient = new CloudTrailClient(e2eToolingClientConfig);
  const amplifyClient = new AmplifyClient(e2eToolingClientConfig);
  const cognitoIdentityClient = new CognitoIdentityClient(
    e2eToolingClientConfig
  );
  const cognitoIdentityProviderClient = new CognitoIdentityProviderClient(
    e2eToolingClientConfig
  );
  const lambdaClient = new LambdaClient(e2eToolingClientConfig);
  const s3Client = new S3Client(e2eToolingClientConfig);
  const iamClient = new IAMClient(e2eToolingClientConfig);
  const sqsClient = new SQSClient(e2eToolingClientConfig);
  const resourceFinder = new DeployedResourcesFinder(cfnClient);
  const stsClient = new STSClient(e2eToolingClientConfig);
  const secretClient = getSecretClient(e2eToolingClientConfig);
  testProjectCreators.push(
    new DataStorageAuthWithTriggerTestProjectCreator(
      cfnClient,
      amplifyClient,
      secretClient,
      lambdaClient,
      s3Client,
      iamClient,
      sqsClient,
      cloudTrailClient,
      resourceFinder
    ),
    new MinimalWithTypescriptIdiomTestProjectCreator(cfnClient, amplifyClient),
    new CustomOutputsTestProjectCreator(cfnClient, amplifyClient),
    new AccessTestingProjectTestProjectCreator(
      cfnClient,
      amplifyClient,
      cognitoIdentityClient,
      cognitoIdentityProviderClient,
      stsClient
    ),
    new ConversationHandlerTestProjectCreator(
      cfnClient,
      amplifyClient,
      lambdaClient,
      cognitoIdentityProviderClient,
      resourceFinder
    )
  );
  return testProjectCreators;
};
