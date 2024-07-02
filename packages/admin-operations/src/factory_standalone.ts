import {
  AuthResources,
  ConstructContainerEntryGenerator,
  ConstructFactory,
  ConstructFactoryGetInstanceProps,
  FunctionResources,
  GenerateContainerEntryProps,
  ResourceProvider,
} from '@aws-amplify/plugin-types';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration, aws_iam } from 'aws-cdk-lib';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';

type AdminOperationFunctionProps = {
  name: string;
  entry: string;
  actions: string[];
};

class AdminOperationFunctionGenerator
  implements ConstructContainerEntryGenerator
{
  readonly resourceGroupName = 'function';

  /**
   * Create a new generator
   * @param props hydrated props
   * @param getInstanceProps getInstanceProps
   */
  constructor(
    private readonly props: AdminOperationFunctionProps,
    private readonly getInstanceProps: ConstructFactoryGetInstanceProps
  ) {}

  generateContainerEntry = ({ scope }: GenerateContainerEntryProps) => {
    const authResources = this.getInstanceProps.constructContainer
      .getConstructFactory<ResourceProvider<AuthResources>>('AuthResources')
      ?.getInstance(this.getInstanceProps).resources;
    if (!authResources) {
      throw new Error(
        'Auth resources were not found while setting up the AdminOperation.'
      );
    }
    const result = new AdminOperationFunction(
      scope,
      this.props.name,
      {
        ...this.props,
      },
      authResources.userPool
    );

    return result;
  };
}
class AdminOperationFunction extends Construct {
  readonly resources: FunctionResources;

  constructor(
    scope: Construct,
    id: string,
    props: AdminOperationFunctionProps,
    userPool: IUserPool
  ) {
    super(scope, id);
    const lambdaFunction = new NodejsFunction(scope, `${id}-lambda`, {
      entry: props.entry,
      timeout: Duration.seconds(15),
      memorySize: 128,
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        format: OutputFormat.ESM,
        loader: {
          '.node': 'file',
        },
      },
      environment: {
        AMPLIFY_AUTH_USERPOOL_ID: userPool.userPoolId,
      },
    });
    lambdaFunction.role?.attachInlinePolicy(
      new aws_iam.Policy(this, `${id}-policy`, {
        statements: [
          new aws_iam.PolicyStatement({
            actions: props.actions,
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );
    // don't need tags
    // don't need fn env translator
    // don't need resources
    // don't need to store outputs
    // probably don't need attribution metadata
  }
}
/**
 * Create Lambda functions with additional cognito permissions for use with Admin Operations.
 */
export class AdminOperationFunctionFactory
  implements ConstructFactory<AdminOperationFunction>
{
  private generator: ConstructContainerEntryGenerator;
  /**
   * Create a new AmplifyFunctionFactory
   */
  constructor(private readonly props: AdminOperationFunctionProps) {}
  /**
   * Creates an instance of AmplifyFunction within the provided Amplify context
   */
  getInstance = (
    props: ConstructFactoryGetInstanceProps
  ): AdminOperationFunction => {
    if (!this.generator) {
      this.generator = new AdminOperationFunctionGenerator(this.props, props);
    }
    return props.constructContainer.getOrCompute(
      this.generator
    ) as AdminOperationFunction;
  };
}
