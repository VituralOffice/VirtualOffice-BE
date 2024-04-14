import { Swagger } from 'src/common/documentation/swagger';
export const SwaggerResponse = {
  getHealth: {
    200: Swagger.defaultResponseText({ status: 200, text: `UP!!` }),
    500: Swagger.defaultResponseError({
      status: 500,
      route: '/health',
    }),
  },
};

export const SwagggerRequest = {
  /** If requesters has a body.  */
};
