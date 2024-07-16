import {
  AmplifyReferenceAuth,
  ReferenceAuthProps,
} from '@aws-amplify/reference-auth-construct';
import {
  AuthRoleName,
  ConstructContainerEntryGenerator,
  ConstructFactory,
  ConstructFactoryGetInstanceProps,
  GenerateContainerEntryProps,
  ReferenceAuthResources,
  ResourceAccessAcceptor,
  ResourceAccessAcceptorFactory,
  ResourceProvider,
} from '@aws-amplify/plugin-types';
import { authAccessBuilder as _authAccessBuilder } from './access_builder.js';
import { AuthAccessPolicyArbiterFactory } from './auth_access_policy_arbiter.js';
import { AuthAccessGenerator, Expand } from './types.js';
import { UserPoolAccessPolicyFactory } from './userpool_access_policy_factory.js';
import { Tags } from 'aws-cdk-lib';
import { AmplifyUserError, TagName } from '@aws-amplify/platform-core';
import path from 'path';
import { Policy } from 'aws-cdk-lib/aws-iam';

export type BackendReferenceAuth = ResourceProvider<ReferenceAuthResources> &
  ResourceAccessAcceptorFactory<AuthRoleName | string>;

export type AmplifyReferenceAuthProps = Expand<
  Omit<ReferenceAuthProps, 'outputStorageStrategy'> & {
    /**
     * !EXPERIMENTAL!
     *
     * Access control is under active development and is subject to change without notice.
     * Use at your own risk and do not use in production
     */
    access?: AuthAccessGenerator;
  }
>;

/**
 * Singleton factory for AmplifyReferenceAuth that can be used in Amplify project files.
 *
 * Exported for testing purpose only & should NOT be exported out of the package.
 */
export class AmplifyReferenceAuthFactory
  implements ConstructFactory<BackendReferenceAuth>
{
  // publicly accessible for testing purpose only.
  static factoryCount = 0;

  readonly provides = 'ReferenceAuthResources';

  private generator: ConstructContainerEntryGenerator;

  /**
   * Set the properties that will be used to initialize AmplifyReferenceAuth
   */
  constructor(
    private readonly props: AmplifyReferenceAuthProps,
    private readonly importStack = new Error().stack
  ) {
    if (AmplifyReferenceAuthFactory.factoryCount > 0) {
      throw new AmplifyUserError('MultipleSingletonResourcesError', {
        message:
          'Multiple `referenceAuth` calls are not allowed within an Amplify backend',
        resolution: 'Remove all but one `referenceAuth` call',
      });
    }
    AmplifyReferenceAuthFactory.factoryCount++;
  }
  /**
   * Get a singleton instance of AmplifyReferenceAuth
   */
  getInstance = (
    getInstanceProps: ConstructFactoryGetInstanceProps
  ): BackendReferenceAuth => {
    const { constructContainer, importPathVerifier } = getInstanceProps;
    importPathVerifier?.verify(
      this.importStack,
      path.join('amplify', 'auth', 'resource'),
      'Amplify Auth must be defined in amplify/auth/resource.ts'
    );
    if (!this.generator) {
      this.generator = new AmplifyReferenceAuthGenerator(
        this.props,
        getInstanceProps
      );
    }
    return constructContainer.getOrCompute(
      this.generator
    ) as BackendReferenceAuth;
  };
}

class AmplifyReferenceAuthGenerator
  implements ConstructContainerEntryGenerator
{
  readonly resourceGroupName = 'auth';
  private readonly name: string;

  constructor(
    private readonly props: AmplifyReferenceAuthProps,
    private readonly getInstanceProps: ConstructFactoryGetInstanceProps,
    private readonly authAccessBuilder = _authAccessBuilder,
    private readonly authAccessPolicyArbiterFactory = new AuthAccessPolicyArbiterFactory()
  ) {
    this.name = 'amplifyAuth';
  }

  generateContainerEntry = ({
    scope,
    ssmEnvironmentEntriesGenerator,
  }: GenerateContainerEntryProps) => {
    const authProps: ReferenceAuthProps = {
      ...this.props,
      outputStorageStrategy: this.getInstanceProps.outputStorageStrategy,
    };

    let authConstruct: AmplifyReferenceAuth;
    try {
      authConstruct = new AmplifyReferenceAuth(scope, this.name, authProps);
    } catch (error) {
      throw new AmplifyUserError(
        'AmplifyReferenceAuthConstructInitializationError',
        {
          message: 'Failed to instantiate auth construct',
          resolution: 'See the underlying error message for more details.',
        },
        error as Error
      );
    }

    Tags.of(authConstruct).add(TagName.FRIENDLY_NAME, this.name);

    const authConstructMixin: BackendReferenceAuth = {
      ...authConstruct,
      /**
       * Returns a resourceAccessAcceptor for the given role
       * @param roleIdentifier Either the auth or unauth role name or the name of a UserPool group
       */
      getResourceAccessAcceptor: (
        roleIdentifier: AuthRoleName | string
      ): ResourceAccessAcceptor => ({
        identifier: `${roleIdentifier}ResourceAccessAcceptor`,
        acceptResourceAccess: (policy: Policy) => {
          // TODO: figure out how we're going to handle group roles for reference auth
          //   const role = roleNameIsAuthRoleName(roleIdentifier)
          //     ? authConstruct.resources[roleIdentifier]
          //     : authConstruct.resources.groups?.[roleIdentifier]?.role;
          const role = roleNameIsAuthRoleName(roleIdentifier)
            ? authConstruct.resources[roleIdentifier]
            : undefined;
          if (!role) {
            throw new AmplifyUserError('InvalidResourceAccessConfig', {
              message: `No auth IAM role found for "${roleIdentifier}".`,
              resolution: `If you are trying to configure UserPool group access, ensure that the group name is specified correctly.`,
            });
          }
          policy.attachToRole(role);
        },
      }),
    };
    if (!this.props.access) {
      return authConstructMixin;
    }
    // props.access is the access callback defined by the customer
    // here we inject the authAccessBuilder into the callback and run it
    // this produces the access definition that will be used to create the auth access policies
    const accessDefinition = this.props.access(this.authAccessBuilder);

    const ssmEnvironmentEntries =
      ssmEnvironmentEntriesGenerator.generateSsmEnvironmentEntries({
        [`${this.name}_USERPOOL_ID`]:
          authConstructMixin.resources.userPool.userPoolId,
      });

    const authPolicyArbiter = this.authAccessPolicyArbiterFactory.getInstance(
      accessDefinition,
      this.getInstanceProps,
      ssmEnvironmentEntries,
      new UserPoolAccessPolicyFactory(authConstruct.resources.userPool)
    );

    authPolicyArbiter.arbitratePolicies();

    return authConstructMixin;
  };
}

const roleNameIsAuthRoleName = (roleName: string): roleName is AuthRoleName => {
  return (
    roleName === 'authenticatedUserIamRole' ||
    roleName === 'unauthenticatedUserIamRole'
  );
};

/**
 * Provide the settings that will be used for authentication.
 */
export const referenceAuth = (
  props: AmplifyReferenceAuthProps
): ConstructFactory<BackendReferenceAuth> =>
  new AmplifyReferenceAuthFactory(props, new Error().stack);
