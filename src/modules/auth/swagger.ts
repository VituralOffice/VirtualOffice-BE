import { Token } from 'src/modules/token/types';
import { Swagger } from 'src/common/documentation/swagger';

export const SwaggerResponse = {
  login: {
    200: Swagger.defaultResponseJSON({
      status: 200,
      json: { accessToken: '<token>' },
      description: 'user logged',
    }),
    412: Swagger.defaultResponseError({
      status: 412,
      route: 'api/login',
      message: 'username or password is invalid.',
      description: 'username or password is invalid.',
    }),
  },
};

export const SwagggerRequest = {
  /** If requesters has a body.  */
};
