import { ApiProperty, ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

import { ErrorModel } from '../exception';
import * as htttpStatus from '../static/htttp-status.json';
import { HttpStatus, Type, applyDecorators } from '@nestjs/common';

type SwaggerError = {
  status: number;
  route: string;
  message?: string | unknown;
  description?: string;
};

type SwaggerText = {
  status: number;
  text: string | unknown;
  description?: string;
};

type SwaggerJSON = {
  status: number;
  json: unknown;
  description?: string;
};

export const Swagger = {
  defaultResponseError({ status, route, message, description }: SwaggerError): ApiResponseOptions {
    return {
      schema: {
        example: {
          error: {
            code: status,
            traceid: '<traceid>',
            message: [message, htttpStatus[String(status)]].find(Boolean),
            timestamp: '<timestamp>',
            path: route,
          },
        } as ErrorModel,
      },
      description,
      status,
    };
  },

  defaultResponseText({ status, text, description }: SwaggerText): ApiResponseOptions {
    return {
      content: {
        'text/plain': {
          schema: {
            example: text,
          },
        },
      },
      description,
      status,
    };
  },

  defaultResponseJSON({ status, json, description }: SwaggerJSON): ApiResponseOptions {
    return {
      content: {
        'application/json': {
          schema: {
            example: json,
          },
        },
      },
      description,
      status,
    };
  },

  defaultRequestJSON(json: unknown): ApiResponseOptions {
    return {
      schema: {
        example: json,
      },
    };
  },
};
export interface AppResponse {
  result: any;
  code: number;
  message: string;
  metadata: any;
}

export const ApiSchemaRes = (schema: AppResponse): Type<AppResponse> => {
  class SchemaResponse implements AppResponse {
    name: string;
    @ApiProperty({ name: 'result', type: 'any', default: null })
    result: any;
    @ApiProperty({ name: 'metadata', type: 'any', default: {} })
    metadata: any;

    @ApiProperty({ name: 'code', type: 'number', default: schema.code })
    code: number;

    @ApiProperty({ name: 'message', type: 'string', default: schema.message })
    message: string;
  }
  return SchemaResponse;
};

export const ApiFailedRes = (...schemas: AppResponse[]) => {
  return applyDecorators(
    ApiResponse({
      status: schemas[0].code,
      content: {
        'application/json': {
          examples: schemas.reduce((list, schema) => {
            list[schema.message] = { value: schema };
            return list;
          }, {}),
        },
      },
    }),
  );
};
