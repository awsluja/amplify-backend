import {
  AmplifyFunction,
  FunctionFactory,
  FunctionGenerator,
  FunctionProps,
} from '@aws-amplify/backend-function';
import {
  AuthResources,
  ConstructFactoryGetInstanceProps,
  ResourceProvider,
} from '@aws-amplify/plugin-types';
import { aws_iam } from 'aws-cdk-lib';

/**
 * Custom Factory that sets up admin permissions on the lambda execution roles
 * used by the lambda.
 */
export class AdminFunctionFactory extends FunctionFactory {
  /**
   * Create a new AdminFunctionFactory
   * @param actions the IAM actions to attach to the policy
   * @param props FunctionProps
   * @param callerStack string
   */
  constructor(
    private readonly actions: string[],
    props: FunctionProps,
    callerStack?: string
  ) {
    super(props, callerStack);
  }
  getInstance = (props: ConstructFactoryGetInstanceProps) => {
    if (!this.generator) {
      this.generator = new FunctionGenerator(
        this.hydrateDefaults(props.resourceNameValidator),
        props.outputStorageStrategy
      );
    }
    const result = props.constructContainer.getOrCompute(
      this.generator
    ) as AmplifyFunction;
    // attach IAM policy to function role
    const auth = props.constructContainer
      .getConstructFactory<ResourceProvider<AuthResources>>('AuthResources')
      ?.getInstance(props);
    if (auth?.resources.userPool) {
      const userPool = auth.resources.userPool;
      result.resources.lambda.role?.attachInlinePolicy(
        new aws_iam.Policy(userPool, 'AdminPolicy', {
          statements: [
            new aws_iam.PolicyStatement({
              actions: this.actions,
              resources: [userPool.userPoolArn],
            }),
          ],
        })
      );
    }
    return result;
  };
}
