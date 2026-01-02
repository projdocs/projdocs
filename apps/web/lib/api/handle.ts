import Ajv, {DefinedError, JSONSchemaType} from "ajv";
import addFormats from "ajv-formats"
import * as process from "node:process";


export const handle = <T>(schema: JSONSchemaType<T>, handler: (data: T) => Promise<Response>): RouteHandler => async (request) => {

  let data: T;
  const validate = addFormats(new Ajv()).compile(schema);

  // pre-process
  try {
    const body = request.body === null ? null : await request.json();
    if (validate(body)) data = body;
    else {

      if(process.env.NODE_ENV === "development") console.log(`offending request: `, body)

      return Response.json({
        error: "request-body validation failed",
        detail: (validate.errors as DefinedError[]).map((error) => ({
          at: error.instancePath,
          error: error.message
        }))
      }, {
        status: 400,
      });
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error(e);
    return Response.json({
      error: "unable to read body as json"
    }, {
      status: 400
    });
  }

  // process
  try {
    return await handler(data);
  } catch (e) {
    console.error(e);
    return Response.json({
      error: "an error occurred while processing request"
    }, {
      status: 500
    });
  }
};