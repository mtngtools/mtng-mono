export type ResultError<TResult=Object, TError=Error> =
  | {
      /** Flag indicating a successful result. */
      error: false;
      /** The successful result data. */
      result: TResult;
    }
  | {
      /** Flag indicating a failure. */
      error: true;
      /** The error object. */
      errorData: TError;
    };

export const returnResult = <TResult>(result: TResult): ResultError<TResult, never> => ({
    error: false,
    result
});

export const returnError = <TError=Error>(errorData: TError): ResultError<never, TError> => ({
    error: true,
    errorData
});
