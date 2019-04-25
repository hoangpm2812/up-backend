import {OperationObject, RequestBodyObject} from 'openapi3-ts';

export const responseSuccess: OperationObject = {
  security: [
    {
      api_key: ['api_key'],
    },
  ],
  components: {
    securitySchemes: {
      api_key: {
        type: 'apiKey',
        name: 'api_key',
        in: 'header',
      },
    },
  },
  responses: {
    '200': {
      description: 'Success',
    },
  },
};

export const requestBodyUpload: RequestBodyObject = {
  description: 'multipart/form-data value.',
  required: true,
  content: {
    'multipart/form-data': {
      'x-parser': 'stream',
      schema: {type: 'object'},
    },
  },
};
