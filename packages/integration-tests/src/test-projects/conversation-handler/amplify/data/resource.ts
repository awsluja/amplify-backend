import { a, defineData, defineFunction } from '@aws-amplify/backend';

const schema = a.schema({
  Temperature: a.customType({
    value: a.integer(),
    unit: a.string(),
  }),

  getTemperature: a
    .query()
    .arguments({ city: a.string() })
    .returns(a.ref('Temperature'))
    .authorization((allow) => [allow.authenticated()])
    .handler(
      a.handler.function(
        defineFunction({
          entry: './thermometer.ts',
        })
      )
    ),

  // These schemas below mock models normally generated by conversational routes.
  MockConversationParticipantRole: a.enum(['user', 'assistant']),

  MockDocumentBlockSource: a.customType({
    bytes: a.string(),
  }),

  MockDocumentBlock: a.customType({
    format: a.string().required(),
    name: a.string().required(),
    source: a.ref('MockDocumentBlockSource').required(),
  }),

  MockImageBlockSource: a.customType({
    bytes: a.string(),
  }),

  MockImageBlock: a.customType({
    format: a.string().required(),
    source: a.ref('MockImageBlockSource').required(),
  }),

  MockToolResultContentBlock: a.customType({
    document: a.ref('MockDocumentBlock'),
    image: a.ref('MockImageBlock'),
    json: a.json(),
    text: a.string(),
  }),

  MockToolResultBlock: a.customType({
    toolUseId: a.string().required(),
    status: a.string(),
    content: a.ref('MockToolResultContentBlock').array().required(),
  }),

  MockToolUseBlock: a.customType({
    toolUseId: a.string().required(),
    name: a.string().required(),
    input: a.json().required(),
  }),

  MockContentBlock: a.customType({
    text: a.string(),
    document: a.ref('MockDocumentBlock'),
    image: a.ref('MockImageBlock'),
    toolResult: a.ref('MockToolResultBlock'),
    toolUse: a.ref('MockToolUseBlock'),
  }),

  MockToolInputSchema: a.customType({
    json: a.json(),
  }),

  MockToolSpecification: a.customType({
    name: a.string().required(),
    description: a.string(),
    inputSchema: a.ref('MockToolInputSchema').required(),
  }),

  MockTool: a.customType({
    toolSpec: a.ref('MockToolSpecification'),
  }),

  MockToolConfiguration: a.customType({
    tools: a.ref('MockTool').array(),
  }),

  ConversationMessageAssistantResponse: a
    .model({
      conversationId: a.id(),
      associatedUserMessageId: a.id(),
      content: a.string(),
    })
    .authorization((allow) => [allow.authenticated(), allow.owner()]),

  ConversationMessageAssistantStreamingResponse: a
    .model({
      // always
      conversationId: a.id().required(),
      associatedUserMessageId: a.id().required(),
      contentBlockIndex: a.integer().required(),
      accumulatedTurnContent: a.ref('MockContentBlock').array(),

      // these describe chunks or end of block
      contentBlockText: a.string(),
      contentBlockToolUse: a.string(),
      contentBlockDeltaIndex: a.integer(),
      contentBlockDoneAtIndex: a.integer(),

      // when message is complete
      stopReason: a.string(),
    })
    .secondaryIndexes((index) => [
      index('conversationId').sortKeys(['associatedUserMessageId']),
    ])
    .authorization((allow) => [allow.authenticated(), allow.owner()]),

  ConversationMessageChat: a
    .model({
      conversationId: a.id(),
      associatedUserMessageId: a.id(),
      role: a.ref('MockConversationParticipantRole'),
      content: a.ref('MockContentBlock').array(),
      aiContext: a.json(),
      toolConfiguration: a.ref('MockToolConfiguration'),
    })
    .secondaryIndexes((index) => [
      index('conversationId').sortKeys(['associatedUserMessageId']),
    ])
    .authorization((allow) => [allow.authenticated(), allow.owner()]),
});

export const data = defineData({
  schema,
});
