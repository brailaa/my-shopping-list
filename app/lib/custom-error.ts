/** Custom Error class.
 * Adds optional context and code to standard Error class.
 */
export class CustomError extends Error {
  public readonly context?: Jsonable;

  constructor(
    message: string,
    public code: string | undefined,
    options: { cause?: Error; context?: Jsonable } = {}
  ) {
    const { cause, context } = options;
    const baseOptions = cause ? { cause } : undefined;
    super(message, baseOptions);
    this.name = "CustomError";
    //context moves up, unless a new context is provided
    this.context =
      context ?? (cause instanceof CustomError ? cause.context : undefined);
    if (cause && "code" in cause && code === undefined) {
      this.code = cause.code as string;
    }
  }
}

type Jsonable =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly Jsonable[]
  | { readonly [key: string]: Jsonable }
  | { toJSON(): Jsonable };
