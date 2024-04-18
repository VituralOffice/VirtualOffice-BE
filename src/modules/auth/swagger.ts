import { Token } from 'src/modules/token/types';
import { Swagger } from 'src/common/documentation/swagger';

export const SwaggerResponse = {
  login: {
    200: Swagger.defaultResponseJSON({
      status: 200,
      json: { result: '<user>', code: 200, message: `Success` },
      description: 'user logged',
    }),
  },
  verify: {
    200: Swagger.defaultResponseJSON({
      status: 200,
      json: { result: '<user>', code: 200, message: `Success` },
      description: 'user logged',
    }),
    400: [
      { result: null, code: 400, message: `user not found`, metadata: {} },
      { result: null, code: 400, message: `otp expired`, metadata: {} },
      {
        result: null,
        code: 400,
        message: `enter incorrect otp upto 5 times, try again after 30 minites`,
        metadata: {},
      },
    ],
  },
};

export const SwagggerRequest = {
  /** If requesters has a body.  */
};
