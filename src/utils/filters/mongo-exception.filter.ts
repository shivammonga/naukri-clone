import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { MongoError } from "mongodb";

// https://stackoverflow.com/a/64682602

@Catch(Error)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let error: { statusCode: number; message: Array<string> };
    let value = [];
    let errMessage = [];

    if (exception instanceof MongoError) {
      if (Object.keys(exception["keyValue"])) {
        value = Object.keys(exception["keyValue"]);
      }

      if (!exception.code) {
        error = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errMessage,
        };
        return error;
      }
      switch (exception.code) {
        case 11000: {
          errMessage[0] = "user with same " + value[0] + " already exist";
          error = {
            statusCode: HttpStatus.BAD_REQUEST,
            message: errMessage,
          };
          break;
        }
        default: {
          errMessage[0] = "Internal Error";
          error = {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: errMessage,
          };
          break;
        }
      }
    } else {
      let exceptionName = exception["name"];
      switch (exceptionName) {
        case "ValidationError":
          {
            (errMessage[0] = exception["message"] ?? "Something is missing"),
              (error = {
                statusCode: HttpStatus.BAD_REQUEST,
                message: errMessage,
              });
          }
          break;
        case "UnprocessableEntityException":
          {
            error = {
              statusCode: HttpStatus.BAD_REQUEST,
              message: exception["response"]?.["message"] ?? "Something went wrong",
            };
          }
          break;
        case "NotFoundException":
          {
            errMessage[0] = exception["response"]?.["message"] ?? "Something went wrong";
            error = {
              statusCode: HttpStatus.BAD_REQUEST,
              message: errMessage,
            };
          }
          break;
        case "BadRequestException":
          {
            errMessage[0] = exception["response"]?.["message"] ?? "Something went wrong";
            error = {
              statusCode: HttpStatus.BAD_REQUEST,
              message: errMessage,
            };
          }
          break;
        case "ForbiddenException":
          {
            errMessage[0] = "Access denied";
            error = {
              statusCode: HttpStatus.BAD_REQUEST,
              message: errMessage,
            };
          }
          break;
        case "TypeError":
          {
            errMessage[0] = "Invalid values passed";
            error = {
              statusCode: HttpStatus.BAD_REQUEST,
              message: errMessage,
            };
          }
          break;
        case "UnauthorizedException":
          {
            errMessage[0] = "Session expired. Please login again to continue";
            error = {
              statusCode: HttpStatus.UNAUTHORIZED,
              message: errMessage,
            };
          }
          break;
        case "Error":
          {
            errMessage[0] = exception["message"] ?? "something went wrong / Error type: Error";
            error = {
              statusCode: HttpStatus.BAD_REQUEST,
              message: errMessage,
            };
          }
          break;
        case "PayloadTooLargeError":
          {
            errMessage[0] = exception["message"] + " / try uploading small image" ?? "something went wrong / Error type: Error";
            error = {
              statusCode: HttpStatus.BAD_REQUEST,
              message: errMessage,
            };
          }
          break;
        case "ConflictException":
          {
            errMessage[0] = exception["message"] ?? "something went wrong / Error type: Error";
            error = {
              statusCode: HttpStatus.CONFLICT,
              message: errMessage,
            };
          }
          break;
        case "MongoServerError":
          {
            let exceptionCode = exception["code"];
            console.log(exceptionCode);
            if (exceptionCode === 11000) {
              errMessage[0] = Object.keys(exception["keyPattern"])[0] + " already exists" ?? "Invalid details";
              error = {
                statusCode: HttpStatus.CONFLICT,
                message: errMessage,
              };
            } else {
              error = {
                statusCode: HttpStatus.BAD_REQUEST,
                message: ["Something went wrong"],
              };
            }
          }
          break;
        default: {
          errMessage[0] = "INTERNAL SERVER ERROR / SOMETHING WENT WRONG";
          error = {
            statusCode: HttpStatus.BAD_REQUEST,
            message: errMessage,
          };
        }
      }
    }

    response.status(error.statusCode).json(error);
  }
}
