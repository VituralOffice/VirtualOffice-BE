import { Swagger } from "src/utils/documentation/swagger";
export const SwagggerResponse = {
  getHealth: {
    200: Swagger.defaultResponseText({ status: 200, text: `UP!!` }),
    500: Swagger.defaultResponseError({
      status: 500,
      route: "/health",
    }),
  },
};

export const SwagggerRequest = {
  /** If requesters has a body.  */
};
