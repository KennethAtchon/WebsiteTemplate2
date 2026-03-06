/**
 * Client
 **/

import * as runtime from "./runtime/binary.js";
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model User
 *
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>;
/**
 * Model Order
 *
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>;
/**
 * Model ContactMessage
 *
 */
export type ContactMessage =
  $Result.DefaultSelection<Prisma.$ContactMessagePayload>;
/**
 * Model FeatureUsage
 *
 */
export type FeatureUsage =
  $Result.DefaultSelection<Prisma.$FeatureUsagePayload>;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = "log" extends keyof ClientOptions
    ? ClientOptions["log"] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions["log"]>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["other"] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(
    optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>,
  );
  $on<V extends U | "beforeExit">(
    eventType: V,
    callback: (
      event: V extends "query"
        ? Prisma.QueryEvent
        : V extends "beforeExit"
          ? () => $Utils.JsPromise<void>
          : Prisma.LogEvent,
    ) => void,
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (
      prisma: Omit<PrismaClient, runtime.ITXClientDenyList>,
    ) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<
    "extends",
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    $Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Orders
   * const orders = await prisma.order.findMany()
   * ```
   */
  get order(): Prisma.OrderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.contactMessage`: Exposes CRUD operations for the **ContactMessage** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more ContactMessages
   * const contactMessages = await prisma.contactMessage.findMany()
   * ```
   */
  get contactMessage(): Prisma.ContactMessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.featureUsage`: Exposes CRUD operations for the **FeatureUsage** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more FeatureUsages
   * const featureUsages = await prisma.featureUsage.findMany()
   * ```
   */
  get featureUsage(): Prisma.FeatureUsageDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import Bytes = runtime.Bytes;
  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> =
    T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<
    T extends (...args: any) => $Utils.JsPromise<any>,
  > = PromiseType<ReturnType<T>>;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? "Please either choose `select` or `include`."
    : T extends SelectAndOmit
      ? "Please either choose `select` or `omit`."
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<
    __Either<O, K>
  >;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = O extends unknown ? _Either<O, K, strict> : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O
    ? O[K]
    : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown
    ? AtStrict<O, K>
    : never;
  export type At<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<
    T,
    U = Omit<T, "_avg" | "_sum" | "_count" | "_min" | "_max">,
  > = IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<"OR", K>, Extends<"AND", K>>,
      Extends<"NOT", K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<
            UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never
          >
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<
    T,
    K extends Enumerable<keyof T> | keyof T,
  > = Prisma__Pick<T, MaybeTupleToUnion<K>>;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}`
    ? never
    : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    User: "User";
    Order: "Order";
    ContactMessage: "ContactMessage";
    FeatureUsage: "FeatureUsage";
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<
    { extArgs: $Extensions.InternalArgs },
    $Utils.Record<string, any>
  > {
    returns: Prisma.TypeMap<
      this["params"]["extArgs"],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps: "user" | "order" | "contactMessage" | "featureUsage";
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>;
        fields: Prisma.UserFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateUser>;
          };
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>;
            result: $Utils.Optional<UserGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserCountArgs<ExtArgs>;
            result: $Utils.Optional<UserCountAggregateOutputType> | number;
          };
        };
      };
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>;
        fields: Prisma.OrderFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>;
          };
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>;
          };
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[];
          };
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>;
          };
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.OrderCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[];
          };
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>;
          };
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>;
          };
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.OrderUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[];
          };
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>;
          };
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateOrder>;
          };
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>;
            result: $Utils.Optional<OrderGroupByOutputType>[];
          };
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>;
            result: $Utils.Optional<OrderCountAggregateOutputType> | number;
          };
        };
      };
      ContactMessage: {
        payload: Prisma.$ContactMessagePayload<ExtArgs>;
        fields: Prisma.ContactMessageFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ContactMessageFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ContactMessageFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>;
          };
          findFirst: {
            args: Prisma.ContactMessageFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ContactMessageFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>;
          };
          findMany: {
            args: Prisma.ContactMessageFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>[];
          };
          create: {
            args: Prisma.ContactMessageCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>;
          };
          createMany: {
            args: Prisma.ContactMessageCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ContactMessageCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>[];
          };
          delete: {
            args: Prisma.ContactMessageDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>;
          };
          update: {
            args: Prisma.ContactMessageUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>;
          };
          deleteMany: {
            args: Prisma.ContactMessageDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ContactMessageUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.ContactMessageUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>[];
          };
          upsert: {
            args: Prisma.ContactMessageUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>;
          };
          aggregate: {
            args: Prisma.ContactMessageAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateContactMessage>;
          };
          groupBy: {
            args: Prisma.ContactMessageGroupByArgs<ExtArgs>;
            result: $Utils.Optional<ContactMessageGroupByOutputType>[];
          };
          count: {
            args: Prisma.ContactMessageCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<ContactMessageCountAggregateOutputType>
              | number;
          };
        };
      };
      FeatureUsage: {
        payload: Prisma.$FeatureUsagePayload<ExtArgs>;
        fields: Prisma.FeatureUsageFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.FeatureUsageFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.FeatureUsageFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload>;
          };
          findFirst: {
            args: Prisma.FeatureUsageFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.FeatureUsageFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload>;
          };
          findMany: {
            args: Prisma.FeatureUsageFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload>[];
          };
          create: {
            args: Prisma.FeatureUsageCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload>;
          };
          createMany: {
            args: Prisma.FeatureUsageCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.FeatureUsageCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload>[];
          };
          delete: {
            args: Prisma.FeatureUsageDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload>;
          };
          update: {
            args: Prisma.FeatureUsageUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload>;
          };
          deleteMany: {
            args: Prisma.FeatureUsageDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.FeatureUsageUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.FeatureUsageUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload>[];
          };
          upsert: {
            args: Prisma.FeatureUsageUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$FeatureUsagePayload>;
          };
          aggregate: {
            args: Prisma.FeatureUsageAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateFeatureUsage>;
          };
          groupBy: {
            args: Prisma.FeatureUsageGroupByArgs<ExtArgs>;
            result: $Utils.Optional<FeatureUsageGroupByOutputType>[];
          };
          count: {
            args: Prisma.FeatureUsageCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<FeatureUsageCountAggregateOutputType>
              | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    "define",
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = "pretty" | "colorless" | "minimal";
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
  }
  export type GlobalOmitConfig = {
    user?: UserOmit;
    order?: OrderOmit;
    contactMessage?: ContactMessageOmit;
    featureUsage?: FeatureUsageOmit;
  };

  /* Types for Logging */
  export type LogLevel = "info" | "query" | "warn" | "error";
  export type LogDefinition = {
    level: LogLevel;
    emit: "stdout" | "event";
  };

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T["level"] : T
  >;

  export type GetEvents<T extends any[]> =
    T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | "findUnique"
    | "findUniqueOrThrow"
    | "findMany"
    | "findFirst"
    | "findFirstOrThrow"
    | "create"
    | "createMany"
    | "createManyAndReturn"
    | "update"
    | "updateMany"
    | "updateManyAndReturn"
    | "upsert"
    | "delete"
    | "deleteMany"
    | "executeRaw"
    | "queryRaw"
    | "aggregate"
    | "count"
    | "runCommandRaw"
    | "findRaw"
    | "groupBy";

  // tested in getLogLevel.test.ts
  export function getLogLevel(
    log: Array<LogLevel | LogDefinition>,
  ): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<
    Prisma.DefaultPrismaClient,
    runtime.ITXClientDenyList
  >;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    Orders: number;
    FeatureUsages: number;
  };

  export type UserCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    Orders?: boolean | UserCountOutputTypeCountOrdersArgs;
    FeatureUsages?: boolean | UserCountOutputTypeCountFeatureUsagesArgs;
  };

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOrdersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: OrderWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountFeatureUsagesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: FeatureUsageWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  export type UserMinAggregateOutputType = {
    id: string | null;
    firebaseUid: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    timezone: string | null;
    role: string | null;
    isActive: boolean | null;
    isDeleted: boolean | null;
    deletedAt: Date | null;
    lastLogin: Date | null;
    hasUsedFreeTrial: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type UserMaxAggregateOutputType = {
    id: string | null;
    firebaseUid: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    timezone: string | null;
    role: string | null;
    isActive: boolean | null;
    isDeleted: boolean | null;
    deletedAt: Date | null;
    lastLogin: Date | null;
    hasUsedFreeTrial: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type UserCountAggregateOutputType = {
    id: number;
    firebaseUid: number;
    name: number;
    email: number;
    phone: number;
    address: number;
    notes: number;
    timezone: number;
    role: number;
    isActive: number;
    isDeleted: number;
    deletedAt: number;
    lastLogin: number;
    hasUsedFreeTrial: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type UserMinAggregateInputType = {
    id?: true;
    firebaseUid?: true;
    name?: true;
    email?: true;
    phone?: true;
    address?: true;
    notes?: true;
    timezone?: true;
    role?: true;
    isActive?: true;
    isDeleted?: true;
    deletedAt?: true;
    lastLogin?: true;
    hasUsedFreeTrial?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type UserMaxAggregateInputType = {
    id?: true;
    firebaseUid?: true;
    name?: true;
    email?: true;
    phone?: true;
    address?: true;
    notes?: true;
    timezone?: true;
    role?: true;
    isActive?: true;
    isDeleted?: true;
    deletedAt?: true;
    lastLogin?: true;
    hasUsedFreeTrial?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type UserCountAggregateInputType = {
    id?: true;
    firebaseUid?: true;
    name?: true;
    email?: true;
    phone?: true;
    address?: true;
    notes?: true;
    timezone?: true;
    role?: true;
    isActive?: true;
    isDeleted?: true;
    deletedAt?: true;
    lastLogin?: true;
    hasUsedFreeTrial?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type UserAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Users
     **/
    _count?: true | UserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserMaxAggregateInputType;
  };

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>;
  };

  export type UserGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: UserWhereInput;
    orderBy?:
      | UserOrderByWithAggregationInput
      | UserOrderByWithAggregationInput[];
    by: UserScalarFieldEnum[] | UserScalarFieldEnum;
    having?: UserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserCountAggregateInputType | true;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
  };

  export type UserGroupByOutputType = {
    id: string;
    firebaseUid: string | null;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    notes: string | null;
    timezone: string | null;
    role: string;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt: Date | null;
    lastLogin: Date | null;
    hasUsedFreeTrial: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof UserGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], UserGroupByOutputType[P]>
          : GetScalarType<T[P], UserGroupByOutputType[P]>;
      }
    >
  >;

  export type UserSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      firebaseUid?: boolean;
      name?: boolean;
      email?: boolean;
      phone?: boolean;
      address?: boolean;
      notes?: boolean;
      timezone?: boolean;
      role?: boolean;
      isActive?: boolean;
      isDeleted?: boolean;
      deletedAt?: boolean;
      lastLogin?: boolean;
      hasUsedFreeTrial?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      Orders?: boolean | User$OrdersArgs<ExtArgs>;
      FeatureUsages?: boolean | User$FeatureUsagesArgs<ExtArgs>;
      _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      firebaseUid?: boolean;
      name?: boolean;
      email?: boolean;
      phone?: boolean;
      address?: boolean;
      notes?: boolean;
      timezone?: boolean;
      role?: boolean;
      isActive?: boolean;
      isDeleted?: boolean;
      deletedAt?: boolean;
      lastLogin?: boolean;
      hasUsedFreeTrial?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      firebaseUid?: boolean;
      name?: boolean;
      email?: boolean;
      phone?: boolean;
      address?: boolean;
      notes?: boolean;
      timezone?: boolean;
      role?: boolean;
      isActive?: boolean;
      isDeleted?: boolean;
      deletedAt?: boolean;
      lastLogin?: boolean;
      hasUsedFreeTrial?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectScalar = {
    id?: boolean;
    firebaseUid?: boolean;
    name?: boolean;
    email?: boolean;
    phone?: boolean;
    address?: boolean;
    notes?: boolean;
    timezone?: boolean;
    role?: boolean;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedAt?: boolean;
    lastLogin?: boolean;
    hasUsedFreeTrial?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type UserOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | "id"
    | "firebaseUid"
    | "name"
    | "email"
    | "phone"
    | "address"
    | "notes"
    | "timezone"
    | "role"
    | "isActive"
    | "isDeleted"
    | "deletedAt"
    | "lastLogin"
    | "hasUsedFreeTrial"
    | "createdAt"
    | "updatedAt",
    ExtArgs["result"]["user"]
  >;
  export type UserInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    Orders?: boolean | User$OrdersArgs<ExtArgs>;
    FeatureUsages?: boolean | User$FeatureUsagesArgs<ExtArgs>;
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type UserIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type UserIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $UserPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "User";
    objects: {
      Orders: Prisma.$OrderPayload<ExtArgs>[];
      FeatureUsages: Prisma.$FeatureUsagePayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        firebaseUid: string | null;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        notes: string | null;
        timezone: string | null;
        role: string;
        isActive: boolean;
        isDeleted: boolean;
        deletedAt: Date | null;
        lastLogin: Date | null;
        hasUsedFreeTrial: boolean;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["user"]
    >;
    composites: {};
  };

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> =
    $Result.GetResult<Prisma.$UserPayload, S>;

  type UserCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<UserFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
    select?: UserCountAggregateInputType | true;
  };

  export interface UserDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["User"];
      meta: { name: "User" };
    };
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     *
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserFindManyArgs>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     *
     */
    create<T extends UserCreateArgs>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserCreateManyArgs>(
      args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     *
     */
    delete<T extends UserDeleteArgs>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserUpdateArgs>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserDeleteManyArgs>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserUpdateManyArgs>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(
      args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<
        Prisma.$UserPayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
     **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], UserCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserAggregateArgs>(
      args: Subset<T, UserAggregateArgs>,
    ): Prisma.PrismaPromise<GetUserAggregateType<T>>;

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs["orderBy"] }
        : { orderBy?: UserGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetUserGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the User model
     */
    readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    Orders<T extends User$OrdersArgs<ExtArgs> = {}>(
      args?: Subset<T, User$OrdersArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$OrderPayload<ExtArgs>,
          T,
          "findMany",
          GlobalOmitOptions
        >
      | Null
    >;
    FeatureUsages<T extends User$FeatureUsagesArgs<ExtArgs> = {}>(
      args?: Subset<T, User$FeatureUsagesArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$FeatureUsagePayload<ExtArgs>,
          T,
          "findMany",
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", "String">;
    readonly firebaseUid: FieldRef<"User", "String">;
    readonly name: FieldRef<"User", "String">;
    readonly email: FieldRef<"User", "String">;
    readonly phone: FieldRef<"User", "String">;
    readonly address: FieldRef<"User", "String">;
    readonly notes: FieldRef<"User", "String">;
    readonly timezone: FieldRef<"User", "String">;
    readonly role: FieldRef<"User", "String">;
    readonly isActive: FieldRef<"User", "Boolean">;
    readonly isDeleted: FieldRef<"User", "Boolean">;
    readonly deletedAt: FieldRef<"User", "DateTime">;
    readonly lastLogin: FieldRef<"User", "DateTime">;
    readonly hasUsedFreeTrial: FieldRef<"User", "Boolean">;
    readonly createdAt: FieldRef<"User", "DateTime">;
    readonly updatedAt: FieldRef<"User", "DateTime">;
  }

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findMany
   */
  export type UserFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User create
   */
  export type UserCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>;
  };

  /**
   * User createMany
   */
  export type UserCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User update
   */
  export type UserUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to update.
     */
    limit?: number;
  };

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to update.
     */
    limit?: number;
  };

  /**
   * User upsert
   */
  export type UserUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput;
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>;
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
  };

  /**
   * User delete
   */
  export type UserDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to delete.
     */
    limit?: number;
  };

  /**
   * User.Orders
   */
  export type User$OrdersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
    where?: OrderWhereInput;
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[];
    cursor?: OrderWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[];
  };

  /**
   * User.FeatureUsages
   */
  export type User$FeatureUsagesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
    where?: FeatureUsageWhereInput;
    orderBy?:
      | FeatureUsageOrderByWithRelationInput
      | FeatureUsageOrderByWithRelationInput[];
    cursor?: FeatureUsageWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: FeatureUsageScalarFieldEnum | FeatureUsageScalarFieldEnum[];
  };

  /**
   * User without action
   */
  export type UserDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
  };

  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null;
    _avg: OrderAvgAggregateOutputType | null;
    _sum: OrderSumAggregateOutputType | null;
    _min: OrderMinAggregateOutputType | null;
    _max: OrderMaxAggregateOutputType | null;
  };

  export type OrderAvgAggregateOutputType = {
    totalAmount: Decimal | null;
  };

  export type OrderSumAggregateOutputType = {
    totalAmount: Decimal | null;
  };

  export type OrderMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    totalAmount: Decimal | null;
    status: string | null;
    stripeSessionId: string | null;
    skipPayment: boolean | null;
    orderType: string | null;
    isDeleted: boolean | null;
    deletedAt: Date | null;
    deletedBy: string | null;
    createdAt: Date | null;
  };

  export type OrderMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    totalAmount: Decimal | null;
    status: string | null;
    stripeSessionId: string | null;
    skipPayment: boolean | null;
    orderType: string | null;
    isDeleted: boolean | null;
    deletedAt: Date | null;
    deletedBy: string | null;
    createdAt: Date | null;
  };

  export type OrderCountAggregateOutputType = {
    id: number;
    userId: number;
    totalAmount: number;
    status: number;
    stripeSessionId: number;
    skipPayment: number;
    orderType: number;
    isDeleted: number;
    deletedAt: number;
    deletedBy: number;
    createdAt: number;
    _all: number;
  };

  export type OrderAvgAggregateInputType = {
    totalAmount?: true;
  };

  export type OrderSumAggregateInputType = {
    totalAmount?: true;
  };

  export type OrderMinAggregateInputType = {
    id?: true;
    userId?: true;
    totalAmount?: true;
    status?: true;
    stripeSessionId?: true;
    skipPayment?: true;
    orderType?: true;
    isDeleted?: true;
    deletedAt?: true;
    deletedBy?: true;
    createdAt?: true;
  };

  export type OrderMaxAggregateInputType = {
    id?: true;
    userId?: true;
    totalAmount?: true;
    status?: true;
    stripeSessionId?: true;
    skipPayment?: true;
    orderType?: true;
    isDeleted?: true;
    deletedAt?: true;
    deletedBy?: true;
    createdAt?: true;
  };

  export type OrderCountAggregateInputType = {
    id?: true;
    userId?: true;
    totalAmount?: true;
    status?: true;
    stripeSessionId?: true;
    skipPayment?: true;
    orderType?: true;
    isDeleted?: true;
    deletedAt?: true;
    deletedBy?: true;
    createdAt?: true;
    _all?: true;
  };

  export type OrderAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Orders.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Orders
     **/
    _count?: true | OrderCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: OrderAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: OrderSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: OrderMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: OrderMaxAggregateInputType;
  };

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
    [P in keyof T & keyof AggregateOrder]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>;
  };

  export type OrderGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: OrderWhereInput;
    orderBy?:
      | OrderOrderByWithAggregationInput
      | OrderOrderByWithAggregationInput[];
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum;
    having?: OrderScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OrderCountAggregateInputType | true;
    _avg?: OrderAvgAggregateInputType;
    _sum?: OrderSumAggregateInputType;
    _min?: OrderMinAggregateInputType;
    _max?: OrderMaxAggregateInputType;
  };

  export type OrderGroupByOutputType = {
    id: string;
    userId: string;
    totalAmount: Decimal;
    status: string | null;
    stripeSessionId: string | null;
    skipPayment: boolean;
    orderType: string;
    isDeleted: boolean;
    deletedAt: Date | null;
    deletedBy: string | null;
    createdAt: Date;
    _count: OrderCountAggregateOutputType | null;
    _avg: OrderAvgAggregateOutputType | null;
    _sum: OrderSumAggregateOutputType | null;
    _min: OrderMinAggregateOutputType | null;
    _max: OrderMaxAggregateOutputType | null;
  };

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<OrderGroupByOutputType, T["by"]> & {
          [P in keyof T & keyof OrderGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>;
        }
      >
    >;

  export type OrderSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      totalAmount?: boolean;
      status?: boolean;
      stripeSessionId?: boolean;
      skipPayment?: boolean;
      orderType?: boolean;
      isDeleted?: boolean;
      deletedAt?: boolean;
      deletedBy?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["order"]
  >;

  export type OrderSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      totalAmount?: boolean;
      status?: boolean;
      stripeSessionId?: boolean;
      skipPayment?: boolean;
      orderType?: boolean;
      isDeleted?: boolean;
      deletedAt?: boolean;
      deletedBy?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["order"]
  >;

  export type OrderSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      totalAmount?: boolean;
      status?: boolean;
      stripeSessionId?: boolean;
      skipPayment?: boolean;
      orderType?: boolean;
      isDeleted?: boolean;
      deletedAt?: boolean;
      deletedBy?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["order"]
  >;

  export type OrderSelectScalar = {
    id?: boolean;
    userId?: boolean;
    totalAmount?: boolean;
    status?: boolean;
    stripeSessionId?: boolean;
    skipPayment?: boolean;
    orderType?: boolean;
    isDeleted?: boolean;
    deletedAt?: boolean;
    deletedBy?: boolean;
    createdAt?: boolean;
  };

  export type OrderOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | "id"
    | "userId"
    | "totalAmount"
    | "status"
    | "stripeSessionId"
    | "skipPayment"
    | "orderType"
    | "isDeleted"
    | "deletedAt"
    | "deletedBy"
    | "createdAt",
    ExtArgs["result"]["order"]
  >;
  export type OrderInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type OrderIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type OrderIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $OrderPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "Order";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        totalAmount: Prisma.Decimal;
        status: string | null;
        stripeSessionId: string | null;
        skipPayment: boolean;
        orderType: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        createdAt: Date;
      },
      ExtArgs["result"]["order"]
    >;
    composites: {};
  };

  type OrderGetPayload<
    S extends boolean | null | undefined | OrderDefaultArgs,
  > = $Result.GetResult<Prisma.$OrderPayload, S>;

  type OrderCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<OrderFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
    select?: OrderCountAggregateInputType | true;
  };

  export interface OrderDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["Order"];
      meta: { name: "Order" };
    };
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(
      args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>,
    ): Prisma__OrderClient<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(
      args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__OrderClient<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(
      args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>,
    ): Prisma__OrderClient<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(
      args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__OrderClient<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     *
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     *
     */
    findMany<T extends OrderFindManyArgs>(
      args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     *
     */
    create<T extends OrderCreateArgs>(
      args: SelectSubset<T, OrderCreateArgs<ExtArgs>>,
    ): Prisma__OrderClient<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends OrderCreateManyArgs>(
      args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Orders and returns the data saved in the database.
     * @param {OrderCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends OrderCreateManyAndReturnArgs>(
      args?: SelectSubset<T, OrderCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     *
     */
    delete<T extends OrderDeleteArgs>(
      args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>,
    ): Prisma__OrderClient<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends OrderUpdateArgs>(
      args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>,
    ): Prisma__OrderClient<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends OrderDeleteManyArgs>(
      args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends OrderUpdateManyArgs>(
      args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Orders and returns the data updated in the database.
     * @param {OrderUpdateManyAndReturnArgs} args - Arguments to update many Orders.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends OrderUpdateManyAndReturnArgs>(
      args: SelectSubset<T, OrderUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(
      args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>,
    ): Prisma__OrderClient<
      $Result.GetResult<
        Prisma.$OrderPayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
     **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], OrderCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends OrderAggregateArgs>(
      args: Subset<T, OrderAggregateArgs>,
    ): Prisma.PrismaPromise<GetOrderAggregateType<T>>;

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs["orderBy"] }
        : { orderBy?: OrderGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetOrderGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Order model
     */
    readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>,
    ): Prisma__UserClient<
      | $Result.GetResult<
          Prisma.$UserPayload<ExtArgs>,
          T,
          "findUniqueOrThrow",
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Order model
   */
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", "String">;
    readonly userId: FieldRef<"Order", "String">;
    readonly totalAmount: FieldRef<"Order", "Decimal">;
    readonly status: FieldRef<"Order", "String">;
    readonly stripeSessionId: FieldRef<"Order", "String">;
    readonly skipPayment: FieldRef<"Order", "Boolean">;
    readonly orderType: FieldRef<"Order", "String">;
    readonly isDeleted: FieldRef<"Order", "Boolean">;
    readonly deletedAt: FieldRef<"Order", "DateTime">;
    readonly deletedBy: FieldRef<"Order", "String">;
    readonly createdAt: FieldRef<"Order", "DateTime">;
  }

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput;
  };

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput;
  };

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Orders.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[];
  };

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Orders.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[];
  };

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Orders.
     */
    skip?: number;
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[];
  };

  /**
   * Order create
   */
  export type OrderCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>;
  };

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Order createManyAndReturn
   */
  export type OrderCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Order update
   */
  export type OrderUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>;
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput;
  };

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>;
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput;
    /**
     * Limit how many Orders to update.
     */
    limit?: number;
  };

  /**
   * Order updateManyAndReturn
   */
  export type OrderUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>;
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput;
    /**
     * Limit how many Orders to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput;
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>;
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>;
  };

  /**
   * Order delete
   */
  export type OrderDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput;
  };

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput;
    /**
     * Limit how many Orders to delete.
     */
    limit?: number;
  };

  /**
   * Order without action
   */
  export type OrderDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null;
  };

  /**
   * Model ContactMessage
   */

  export type AggregateContactMessage = {
    _count: ContactMessageCountAggregateOutputType | null;
    _min: ContactMessageMinAggregateOutputType | null;
    _max: ContactMessageMaxAggregateOutputType | null;
  };

  export type ContactMessageMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    subject: string | null;
    message: string | null;
    createdAt: Date | null;
  };

  export type ContactMessageMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    subject: string | null;
    message: string | null;
    createdAt: Date | null;
  };

  export type ContactMessageCountAggregateOutputType = {
    id: number;
    name: number;
    email: number;
    phone: number;
    subject: number;
    message: number;
    createdAt: number;
    _all: number;
  };

  export type ContactMessageMinAggregateInputType = {
    id?: true;
    name?: true;
    email?: true;
    phone?: true;
    subject?: true;
    message?: true;
    createdAt?: true;
  };

  export type ContactMessageMaxAggregateInputType = {
    id?: true;
    name?: true;
    email?: true;
    phone?: true;
    subject?: true;
    message?: true;
    createdAt?: true;
  };

  export type ContactMessageCountAggregateInputType = {
    id?: true;
    name?: true;
    email?: true;
    phone?: true;
    subject?: true;
    message?: true;
    createdAt?: true;
    _all?: true;
  };

  export type ContactMessageAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which ContactMessage to aggregate.
     */
    where?: ContactMessageWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ContactMessages to fetch.
     */
    orderBy?:
      | ContactMessageOrderByWithRelationInput
      | ContactMessageOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ContactMessageWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ContactMessages from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ContactMessages.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ContactMessages
     **/
    _count?: true | ContactMessageCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ContactMessageMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ContactMessageMaxAggregateInputType;
  };

  export type GetContactMessageAggregateType<
    T extends ContactMessageAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateContactMessage]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContactMessage[P]>
      : GetScalarType<T[P], AggregateContactMessage[P]>;
  };

  export type ContactMessageGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ContactMessageWhereInput;
    orderBy?:
      | ContactMessageOrderByWithAggregationInput
      | ContactMessageOrderByWithAggregationInput[];
    by: ContactMessageScalarFieldEnum[] | ContactMessageScalarFieldEnum;
    having?: ContactMessageScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ContactMessageCountAggregateInputType | true;
    _min?: ContactMessageMinAggregateInputType;
    _max?: ContactMessageMaxAggregateInputType;
  };

  export type ContactMessageGroupByOutputType = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    createdAt: Date;
    _count: ContactMessageCountAggregateOutputType | null;
    _min: ContactMessageMinAggregateOutputType | null;
    _max: ContactMessageMaxAggregateOutputType | null;
  };

  type GetContactMessageGroupByPayload<T extends ContactMessageGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<ContactMessageGroupByOutputType, T["by"]> & {
          [P in keyof T &
            keyof ContactMessageGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContactMessageGroupByOutputType[P]>
            : GetScalarType<T[P], ContactMessageGroupByOutputType[P]>;
        }
      >
    >;

  export type ContactMessageSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      email?: boolean;
      phone?: boolean;
      subject?: boolean;
      message?: boolean;
      createdAt?: boolean;
    },
    ExtArgs["result"]["contactMessage"]
  >;

  export type ContactMessageSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      email?: boolean;
      phone?: boolean;
      subject?: boolean;
      message?: boolean;
      createdAt?: boolean;
    },
    ExtArgs["result"]["contactMessage"]
  >;

  export type ContactMessageSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      email?: boolean;
      phone?: boolean;
      subject?: boolean;
      message?: boolean;
      createdAt?: boolean;
    },
    ExtArgs["result"]["contactMessage"]
  >;

  export type ContactMessageSelectScalar = {
    id?: boolean;
    name?: boolean;
    email?: boolean;
    phone?: boolean;
    subject?: boolean;
    message?: boolean;
    createdAt?: boolean;
  };

  export type ContactMessageOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    "id" | "name" | "email" | "phone" | "subject" | "message" | "createdAt",
    ExtArgs["result"]["contactMessage"]
  >;

  export type $ContactMessagePayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "ContactMessage";
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        subject: string;
        message: string;
        createdAt: Date;
      },
      ExtArgs["result"]["contactMessage"]
    >;
    composites: {};
  };

  type ContactMessageGetPayload<
    S extends boolean | null | undefined | ContactMessageDefaultArgs,
  > = $Result.GetResult<Prisma.$ContactMessagePayload, S>;

  type ContactMessageCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    ContactMessageFindManyArgs,
    "select" | "include" | "distinct" | "omit"
  > & {
    select?: ContactMessageCountAggregateInputType | true;
  };

  export interface ContactMessageDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["ContactMessage"];
      meta: { name: "ContactMessage" };
    };
    /**
     * Find zero or one ContactMessage that matches the filter.
     * @param {ContactMessageFindUniqueArgs} args - Arguments to find a ContactMessage
     * @example
     * // Get one ContactMessage
     * const contactMessage = await prisma.contactMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContactMessageFindUniqueArgs>(
      args: SelectSubset<T, ContactMessageFindUniqueArgs<ExtArgs>>,
    ): Prisma__ContactMessageClient<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one ContactMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ContactMessageFindUniqueOrThrowArgs} args - Arguments to find a ContactMessage
     * @example
     * // Get one ContactMessage
     * const contactMessage = await prisma.contactMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContactMessageFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ContactMessageFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__ContactMessageClient<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first ContactMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageFindFirstArgs} args - Arguments to find a ContactMessage
     * @example
     * // Get one ContactMessage
     * const contactMessage = await prisma.contactMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContactMessageFindFirstArgs>(
      args?: SelectSubset<T, ContactMessageFindFirstArgs<ExtArgs>>,
    ): Prisma__ContactMessageClient<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first ContactMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageFindFirstOrThrowArgs} args - Arguments to find a ContactMessage
     * @example
     * // Get one ContactMessage
     * const contactMessage = await prisma.contactMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContactMessageFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ContactMessageFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__ContactMessageClient<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more ContactMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ContactMessages
     * const contactMessages = await prisma.contactMessage.findMany()
     *
     * // Get first 10 ContactMessages
     * const contactMessages = await prisma.contactMessage.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const contactMessageWithIdOnly = await prisma.contactMessage.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ContactMessageFindManyArgs>(
      args?: SelectSubset<T, ContactMessageFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a ContactMessage.
     * @param {ContactMessageCreateArgs} args - Arguments to create a ContactMessage.
     * @example
     * // Create one ContactMessage
     * const ContactMessage = await prisma.contactMessage.create({
     *   data: {
     *     // ... data to create a ContactMessage
     *   }
     * })
     *
     */
    create<T extends ContactMessageCreateArgs>(
      args: SelectSubset<T, ContactMessageCreateArgs<ExtArgs>>,
    ): Prisma__ContactMessageClient<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many ContactMessages.
     * @param {ContactMessageCreateManyArgs} args - Arguments to create many ContactMessages.
     * @example
     * // Create many ContactMessages
     * const contactMessage = await prisma.contactMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ContactMessageCreateManyArgs>(
      args?: SelectSubset<T, ContactMessageCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many ContactMessages and returns the data saved in the database.
     * @param {ContactMessageCreateManyAndReturnArgs} args - Arguments to create many ContactMessages.
     * @example
     * // Create many ContactMessages
     * const contactMessage = await prisma.contactMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ContactMessages and only return the `id`
     * const contactMessageWithIdOnly = await prisma.contactMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ContactMessageCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ContactMessageCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a ContactMessage.
     * @param {ContactMessageDeleteArgs} args - Arguments to delete one ContactMessage.
     * @example
     * // Delete one ContactMessage
     * const ContactMessage = await prisma.contactMessage.delete({
     *   where: {
     *     // ... filter to delete one ContactMessage
     *   }
     * })
     *
     */
    delete<T extends ContactMessageDeleteArgs>(
      args: SelectSubset<T, ContactMessageDeleteArgs<ExtArgs>>,
    ): Prisma__ContactMessageClient<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one ContactMessage.
     * @param {ContactMessageUpdateArgs} args - Arguments to update one ContactMessage.
     * @example
     * // Update one ContactMessage
     * const contactMessage = await prisma.contactMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ContactMessageUpdateArgs>(
      args: SelectSubset<T, ContactMessageUpdateArgs<ExtArgs>>,
    ): Prisma__ContactMessageClient<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more ContactMessages.
     * @param {ContactMessageDeleteManyArgs} args - Arguments to filter ContactMessages to delete.
     * @example
     * // Delete a few ContactMessages
     * const { count } = await prisma.contactMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ContactMessageDeleteManyArgs>(
      args?: SelectSubset<T, ContactMessageDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more ContactMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ContactMessages
     * const contactMessage = await prisma.contactMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ContactMessageUpdateManyArgs>(
      args: SelectSubset<T, ContactMessageUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more ContactMessages and returns the data updated in the database.
     * @param {ContactMessageUpdateManyAndReturnArgs} args - Arguments to update many ContactMessages.
     * @example
     * // Update many ContactMessages
     * const contactMessage = await prisma.contactMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ContactMessages and only return the `id`
     * const contactMessageWithIdOnly = await prisma.contactMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ContactMessageUpdateManyAndReturnArgs>(
      args: SelectSubset<T, ContactMessageUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one ContactMessage.
     * @param {ContactMessageUpsertArgs} args - Arguments to update or create a ContactMessage.
     * @example
     * // Update or create a ContactMessage
     * const contactMessage = await prisma.contactMessage.upsert({
     *   create: {
     *     // ... data to create a ContactMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ContactMessage we want to update
     *   }
     * })
     */
    upsert<T extends ContactMessageUpsertArgs>(
      args: SelectSubset<T, ContactMessageUpsertArgs<ExtArgs>>,
    ): Prisma__ContactMessageClient<
      $Result.GetResult<
        Prisma.$ContactMessagePayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of ContactMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageCountArgs} args - Arguments to filter ContactMessages to count.
     * @example
     * // Count the number of ContactMessages
     * const count = await prisma.contactMessage.count({
     *   where: {
     *     // ... the filter for the ContactMessages we want to count
     *   }
     * })
     **/
    count<T extends ContactMessageCountArgs>(
      args?: Subset<T, ContactMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], ContactMessageCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a ContactMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ContactMessageAggregateArgs>(
      args: Subset<T, ContactMessageAggregateArgs>,
    ): Prisma.PrismaPromise<GetContactMessageAggregateType<T>>;

    /**
     * Group by ContactMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ContactMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContactMessageGroupByArgs["orderBy"] }
        : { orderBy?: ContactMessageGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, ContactMessageGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetContactMessageGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ContactMessage model
     */
    readonly fields: ContactMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ContactMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContactMessageClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the ContactMessage model
   */
  interface ContactMessageFieldRefs {
    readonly id: FieldRef<"ContactMessage", "String">;
    readonly name: FieldRef<"ContactMessage", "String">;
    readonly email: FieldRef<"ContactMessage", "String">;
    readonly phone: FieldRef<"ContactMessage", "String">;
    readonly subject: FieldRef<"ContactMessage", "String">;
    readonly message: FieldRef<"ContactMessage", "String">;
    readonly createdAt: FieldRef<"ContactMessage", "DateTime">;
  }

  // Custom InputTypes
  /**
   * ContactMessage findUnique
   */
  export type ContactMessageFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * Filter, which ContactMessage to fetch.
     */
    where: ContactMessageWhereUniqueInput;
  };

  /**
   * ContactMessage findUniqueOrThrow
   */
  export type ContactMessageFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * Filter, which ContactMessage to fetch.
     */
    where: ContactMessageWhereUniqueInput;
  };

  /**
   * ContactMessage findFirst
   */
  export type ContactMessageFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * Filter, which ContactMessage to fetch.
     */
    where?: ContactMessageWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ContactMessages to fetch.
     */
    orderBy?:
      | ContactMessageOrderByWithRelationInput
      | ContactMessageOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ContactMessages.
     */
    cursor?: ContactMessageWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ContactMessages from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ContactMessages.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ContactMessages.
     */
    distinct?: ContactMessageScalarFieldEnum | ContactMessageScalarFieldEnum[];
  };

  /**
   * ContactMessage findFirstOrThrow
   */
  export type ContactMessageFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * Filter, which ContactMessage to fetch.
     */
    where?: ContactMessageWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ContactMessages to fetch.
     */
    orderBy?:
      | ContactMessageOrderByWithRelationInput
      | ContactMessageOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ContactMessages.
     */
    cursor?: ContactMessageWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ContactMessages from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ContactMessages.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ContactMessages.
     */
    distinct?: ContactMessageScalarFieldEnum | ContactMessageScalarFieldEnum[];
  };

  /**
   * ContactMessage findMany
   */
  export type ContactMessageFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * Filter, which ContactMessages to fetch.
     */
    where?: ContactMessageWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ContactMessages to fetch.
     */
    orderBy?:
      | ContactMessageOrderByWithRelationInput
      | ContactMessageOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ContactMessages.
     */
    cursor?: ContactMessageWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ContactMessages from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ContactMessages.
     */
    skip?: number;
    distinct?: ContactMessageScalarFieldEnum | ContactMessageScalarFieldEnum[];
  };

  /**
   * ContactMessage create
   */
  export type ContactMessageCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * The data needed to create a ContactMessage.
     */
    data: XOR<ContactMessageCreateInput, ContactMessageUncheckedCreateInput>;
  };

  /**
   * ContactMessage createMany
   */
  export type ContactMessageCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many ContactMessages.
     */
    data: ContactMessageCreateManyInput | ContactMessageCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * ContactMessage createManyAndReturn
   */
  export type ContactMessageCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * The data used to create many ContactMessages.
     */
    data: ContactMessageCreateManyInput | ContactMessageCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * ContactMessage update
   */
  export type ContactMessageUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * The data needed to update a ContactMessage.
     */
    data: XOR<ContactMessageUpdateInput, ContactMessageUncheckedUpdateInput>;
    /**
     * Choose, which ContactMessage to update.
     */
    where: ContactMessageWhereUniqueInput;
  };

  /**
   * ContactMessage updateMany
   */
  export type ContactMessageUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update ContactMessages.
     */
    data: XOR<
      ContactMessageUpdateManyMutationInput,
      ContactMessageUncheckedUpdateManyInput
    >;
    /**
     * Filter which ContactMessages to update
     */
    where?: ContactMessageWhereInput;
    /**
     * Limit how many ContactMessages to update.
     */
    limit?: number;
  };

  /**
   * ContactMessage updateManyAndReturn
   */
  export type ContactMessageUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * The data used to update ContactMessages.
     */
    data: XOR<
      ContactMessageUpdateManyMutationInput,
      ContactMessageUncheckedUpdateManyInput
    >;
    /**
     * Filter which ContactMessages to update
     */
    where?: ContactMessageWhereInput;
    /**
     * Limit how many ContactMessages to update.
     */
    limit?: number;
  };

  /**
   * ContactMessage upsert
   */
  export type ContactMessageUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * The filter to search for the ContactMessage to update in case it exists.
     */
    where: ContactMessageWhereUniqueInput;
    /**
     * In case the ContactMessage found by the `where` argument doesn't exist, create a new ContactMessage with this data.
     */
    create: XOR<ContactMessageCreateInput, ContactMessageUncheckedCreateInput>;
    /**
     * In case the ContactMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContactMessageUpdateInput, ContactMessageUncheckedUpdateInput>;
  };

  /**
   * ContactMessage delete
   */
  export type ContactMessageDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
    /**
     * Filter which ContactMessage to delete.
     */
    where: ContactMessageWhereUniqueInput;
  };

  /**
   * ContactMessage deleteMany
   */
  export type ContactMessageDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which ContactMessages to delete
     */
    where?: ContactMessageWhereInput;
    /**
     * Limit how many ContactMessages to delete.
     */
    limit?: number;
  };

  /**
   * ContactMessage without action
   */
  export type ContactMessageDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null;
  };

  /**
   * Model FeatureUsage
   */

  export type AggregateFeatureUsage = {
    _count: FeatureUsageCountAggregateOutputType | null;
    _avg: FeatureUsageAvgAggregateOutputType | null;
    _sum: FeatureUsageSumAggregateOutputType | null;
    _min: FeatureUsageMinAggregateOutputType | null;
    _max: FeatureUsageMaxAggregateOutputType | null;
  };

  export type FeatureUsageAvgAggregateOutputType = {
    usageTimeMs: number | null;
  };

  export type FeatureUsageSumAggregateOutputType = {
    usageTimeMs: number | null;
  };

  export type FeatureUsageMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    featureType: string | null;
    usageTimeMs: number | null;
    createdAt: Date | null;
  };

  export type FeatureUsageMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    featureType: string | null;
    usageTimeMs: number | null;
    createdAt: Date | null;
  };

  export type FeatureUsageCountAggregateOutputType = {
    id: number;
    userId: number;
    featureType: number;
    inputData: number;
    resultData: number;
    usageTimeMs: number;
    createdAt: number;
    _all: number;
  };

  export type FeatureUsageAvgAggregateInputType = {
    usageTimeMs?: true;
  };

  export type FeatureUsageSumAggregateInputType = {
    usageTimeMs?: true;
  };

  export type FeatureUsageMinAggregateInputType = {
    id?: true;
    userId?: true;
    featureType?: true;
    usageTimeMs?: true;
    createdAt?: true;
  };

  export type FeatureUsageMaxAggregateInputType = {
    id?: true;
    userId?: true;
    featureType?: true;
    usageTimeMs?: true;
    createdAt?: true;
  };

  export type FeatureUsageCountAggregateInputType = {
    id?: true;
    userId?: true;
    featureType?: true;
    inputData?: true;
    resultData?: true;
    usageTimeMs?: true;
    createdAt?: true;
    _all?: true;
  };

  export type FeatureUsageAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which FeatureUsage to aggregate.
     */
    where?: FeatureUsageWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of FeatureUsages to fetch.
     */
    orderBy?:
      | FeatureUsageOrderByWithRelationInput
      | FeatureUsageOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: FeatureUsageWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` FeatureUsages from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` FeatureUsages.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned FeatureUsages
     **/
    _count?: true | FeatureUsageCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: FeatureUsageAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: FeatureUsageSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: FeatureUsageMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: FeatureUsageMaxAggregateInputType;
  };

  export type GetFeatureUsageAggregateType<
    T extends FeatureUsageAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateFeatureUsage]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFeatureUsage[P]>
      : GetScalarType<T[P], AggregateFeatureUsage[P]>;
  };

  export type FeatureUsageGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: FeatureUsageWhereInput;
    orderBy?:
      | FeatureUsageOrderByWithAggregationInput
      | FeatureUsageOrderByWithAggregationInput[];
    by: FeatureUsageScalarFieldEnum[] | FeatureUsageScalarFieldEnum;
    having?: FeatureUsageScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: FeatureUsageCountAggregateInputType | true;
    _avg?: FeatureUsageAvgAggregateInputType;
    _sum?: FeatureUsageSumAggregateInputType;
    _min?: FeatureUsageMinAggregateInputType;
    _max?: FeatureUsageMaxAggregateInputType;
  };

  export type FeatureUsageGroupByOutputType = {
    id: string;
    userId: string;
    featureType: string;
    inputData: JsonValue;
    resultData: JsonValue;
    usageTimeMs: number;
    createdAt: Date;
    _count: FeatureUsageCountAggregateOutputType | null;
    _avg: FeatureUsageAvgAggregateOutputType | null;
    _sum: FeatureUsageSumAggregateOutputType | null;
    _min: FeatureUsageMinAggregateOutputType | null;
    _max: FeatureUsageMaxAggregateOutputType | null;
  };

  type GetFeatureUsageGroupByPayload<T extends FeatureUsageGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<FeatureUsageGroupByOutputType, T["by"]> & {
          [P in keyof T &
            keyof FeatureUsageGroupByOutputType]: P extends "_count"
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FeatureUsageGroupByOutputType[P]>
            : GetScalarType<T[P], FeatureUsageGroupByOutputType[P]>;
        }
      >
    >;

  export type FeatureUsageSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      featureType?: boolean;
      inputData?: boolean;
      resultData?: boolean;
      usageTimeMs?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["featureUsage"]
  >;

  export type FeatureUsageSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      featureType?: boolean;
      inputData?: boolean;
      resultData?: boolean;
      usageTimeMs?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["featureUsage"]
  >;

  export type FeatureUsageSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      featureType?: boolean;
      inputData?: boolean;
      resultData?: boolean;
      usageTimeMs?: boolean;
      createdAt?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["featureUsage"]
  >;

  export type FeatureUsageSelectScalar = {
    id?: boolean;
    userId?: boolean;
    featureType?: boolean;
    inputData?: boolean;
    resultData?: boolean;
    usageTimeMs?: boolean;
    createdAt?: boolean;
  };

  export type FeatureUsageOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | "id"
    | "userId"
    | "featureType"
    | "inputData"
    | "resultData"
    | "usageTimeMs"
    | "createdAt",
    ExtArgs["result"]["featureUsage"]
  >;
  export type FeatureUsageInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type FeatureUsageIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type FeatureUsageIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $FeatureUsagePayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "FeatureUsage";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        featureType: string;
        inputData: Prisma.JsonValue;
        resultData: Prisma.JsonValue;
        usageTimeMs: number;
        createdAt: Date;
      },
      ExtArgs["result"]["featureUsage"]
    >;
    composites: {};
  };

  type FeatureUsageGetPayload<
    S extends boolean | null | undefined | FeatureUsageDefaultArgs,
  > = $Result.GetResult<Prisma.$FeatureUsagePayload, S>;

  type FeatureUsageCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    FeatureUsageFindManyArgs,
    "select" | "include" | "distinct" | "omit"
  > & {
    select?: FeatureUsageCountAggregateInputType | true;
  };

  export interface FeatureUsageDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["FeatureUsage"];
      meta: { name: "FeatureUsage" };
    };
    /**
     * Find zero or one FeatureUsage that matches the filter.
     * @param {FeatureUsageFindUniqueArgs} args - Arguments to find a FeatureUsage
     * @example
     * // Get one FeatureUsage
     * const featureUsage = await prisma.featureUsage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FeatureUsageFindUniqueArgs>(
      args: SelectSubset<T, FeatureUsageFindUniqueArgs<ExtArgs>>,
    ): Prisma__FeatureUsageClient<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one FeatureUsage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FeatureUsageFindUniqueOrThrowArgs} args - Arguments to find a FeatureUsage
     * @example
     * // Get one FeatureUsage
     * const featureUsage = await prisma.featureUsage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FeatureUsageFindUniqueOrThrowArgs>(
      args: SelectSubset<T, FeatureUsageFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__FeatureUsageClient<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first FeatureUsage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureUsageFindFirstArgs} args - Arguments to find a FeatureUsage
     * @example
     * // Get one FeatureUsage
     * const featureUsage = await prisma.featureUsage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FeatureUsageFindFirstArgs>(
      args?: SelectSubset<T, FeatureUsageFindFirstArgs<ExtArgs>>,
    ): Prisma__FeatureUsageClient<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first FeatureUsage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureUsageFindFirstOrThrowArgs} args - Arguments to find a FeatureUsage
     * @example
     * // Get one FeatureUsage
     * const featureUsage = await prisma.featureUsage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FeatureUsageFindFirstOrThrowArgs>(
      args?: SelectSubset<T, FeatureUsageFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__FeatureUsageClient<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more FeatureUsages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureUsageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FeatureUsages
     * const featureUsages = await prisma.featureUsage.findMany()
     *
     * // Get first 10 FeatureUsages
     * const featureUsages = await prisma.featureUsage.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const featureUsageWithIdOnly = await prisma.featureUsage.findMany({ select: { id: true } })
     *
     */
    findMany<T extends FeatureUsageFindManyArgs>(
      args?: SelectSubset<T, FeatureUsageFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "findMany",
        GlobalOmitOptions
      >
    >;

    /**
     * Create a FeatureUsage.
     * @param {FeatureUsageCreateArgs} args - Arguments to create a FeatureUsage.
     * @example
     * // Create one FeatureUsage
     * const FeatureUsage = await prisma.featureUsage.create({
     *   data: {
     *     // ... data to create a FeatureUsage
     *   }
     * })
     *
     */
    create<T extends FeatureUsageCreateArgs>(
      args: SelectSubset<T, FeatureUsageCreateArgs<ExtArgs>>,
    ): Prisma__FeatureUsageClient<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "create",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many FeatureUsages.
     * @param {FeatureUsageCreateManyArgs} args - Arguments to create many FeatureUsages.
     * @example
     * // Create many FeatureUsages
     * const featureUsage = await prisma.featureUsage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends FeatureUsageCreateManyArgs>(
      args?: SelectSubset<T, FeatureUsageCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many FeatureUsages and returns the data saved in the database.
     * @param {FeatureUsageCreateManyAndReturnArgs} args - Arguments to create many FeatureUsages.
     * @example
     * // Create many FeatureUsages
     * const featureUsage = await prisma.featureUsage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many FeatureUsages and only return the `id`
     * const featureUsageWithIdOnly = await prisma.featureUsage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends FeatureUsageCreateManyAndReturnArgs>(
      args?: SelectSubset<T, FeatureUsageCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a FeatureUsage.
     * @param {FeatureUsageDeleteArgs} args - Arguments to delete one FeatureUsage.
     * @example
     * // Delete one FeatureUsage
     * const FeatureUsage = await prisma.featureUsage.delete({
     *   where: {
     *     // ... filter to delete one FeatureUsage
     *   }
     * })
     *
     */
    delete<T extends FeatureUsageDeleteArgs>(
      args: SelectSubset<T, FeatureUsageDeleteArgs<ExtArgs>>,
    ): Prisma__FeatureUsageClient<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "delete",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one FeatureUsage.
     * @param {FeatureUsageUpdateArgs} args - Arguments to update one FeatureUsage.
     * @example
     * // Update one FeatureUsage
     * const featureUsage = await prisma.featureUsage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends FeatureUsageUpdateArgs>(
      args: SelectSubset<T, FeatureUsageUpdateArgs<ExtArgs>>,
    ): Prisma__FeatureUsageClient<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "update",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more FeatureUsages.
     * @param {FeatureUsageDeleteManyArgs} args - Arguments to filter FeatureUsages to delete.
     * @example
     * // Delete a few FeatureUsages
     * const { count } = await prisma.featureUsage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends FeatureUsageDeleteManyArgs>(
      args?: SelectSubset<T, FeatureUsageDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more FeatureUsages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureUsageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FeatureUsages
     * const featureUsage = await prisma.featureUsage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends FeatureUsageUpdateManyArgs>(
      args: SelectSubset<T, FeatureUsageUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more FeatureUsages and returns the data updated in the database.
     * @param {FeatureUsageUpdateManyAndReturnArgs} args - Arguments to update many FeatureUsages.
     * @example
     * // Update many FeatureUsages
     * const featureUsage = await prisma.featureUsage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more FeatureUsages and only return the `id`
     * const featureUsageWithIdOnly = await prisma.featureUsage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends FeatureUsageUpdateManyAndReturnArgs>(
      args: SelectSubset<T, FeatureUsageUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one FeatureUsage.
     * @param {FeatureUsageUpsertArgs} args - Arguments to update or create a FeatureUsage.
     * @example
     * // Update or create a FeatureUsage
     * const featureUsage = await prisma.featureUsage.upsert({
     *   create: {
     *     // ... data to create a FeatureUsage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FeatureUsage we want to update
     *   }
     * })
     */
    upsert<T extends FeatureUsageUpsertArgs>(
      args: SelectSubset<T, FeatureUsageUpsertArgs<ExtArgs>>,
    ): Prisma__FeatureUsageClient<
      $Result.GetResult<
        Prisma.$FeatureUsagePayload<ExtArgs>,
        T,
        "upsert",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of FeatureUsages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureUsageCountArgs} args - Arguments to filter FeatureUsages to count.
     * @example
     * // Count the number of FeatureUsages
     * const count = await prisma.featureUsage.count({
     *   where: {
     *     // ... the filter for the FeatureUsages we want to count
     *   }
     * })
     **/
    count<T extends FeatureUsageCountArgs>(
      args?: Subset<T, FeatureUsageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], FeatureUsageCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a FeatureUsage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureUsageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends FeatureUsageAggregateArgs>(
      args: Subset<T, FeatureUsageAggregateArgs>,
    ): Prisma.PrismaPromise<GetFeatureUsageAggregateType<T>>;

    /**
     * Group by FeatureUsage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureUsageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends FeatureUsageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<"skip", Keys<T>>,
        Extends<"take", Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FeatureUsageGroupByArgs["orderBy"] }
        : { orderBy?: FeatureUsageGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T["orderBy"]>>
      >,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      "Field ",
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, FeatureUsageGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetFeatureUsageGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the FeatureUsage model
     */
    readonly fields: FeatureUsageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FeatureUsage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FeatureUsageClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>,
    ): Prisma__UserClient<
      | $Result.GetResult<
          Prisma.$UserPayload<ExtArgs>,
          T,
          "findUniqueOrThrow",
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the FeatureUsage model
   */
  interface FeatureUsageFieldRefs {
    readonly id: FieldRef<"FeatureUsage", "String">;
    readonly userId: FieldRef<"FeatureUsage", "String">;
    readonly featureType: FieldRef<"FeatureUsage", "String">;
    readonly inputData: FieldRef<"FeatureUsage", "Json">;
    readonly resultData: FieldRef<"FeatureUsage", "Json">;
    readonly usageTimeMs: FieldRef<"FeatureUsage", "Int">;
    readonly createdAt: FieldRef<"FeatureUsage", "DateTime">;
  }

  // Custom InputTypes
  /**
   * FeatureUsage findUnique
   */
  export type FeatureUsageFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
    /**
     * Filter, which FeatureUsage to fetch.
     */
    where: FeatureUsageWhereUniqueInput;
  };

  /**
   * FeatureUsage findUniqueOrThrow
   */
  export type FeatureUsageFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
    /**
     * Filter, which FeatureUsage to fetch.
     */
    where: FeatureUsageWhereUniqueInput;
  };

  /**
   * FeatureUsage findFirst
   */
  export type FeatureUsageFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
    /**
     * Filter, which FeatureUsage to fetch.
     */
    where?: FeatureUsageWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of FeatureUsages to fetch.
     */
    orderBy?:
      | FeatureUsageOrderByWithRelationInput
      | FeatureUsageOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for FeatureUsages.
     */
    cursor?: FeatureUsageWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` FeatureUsages from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` FeatureUsages.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of FeatureUsages.
     */
    distinct?: FeatureUsageScalarFieldEnum | FeatureUsageScalarFieldEnum[];
  };

  /**
   * FeatureUsage findFirstOrThrow
   */
  export type FeatureUsageFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
    /**
     * Filter, which FeatureUsage to fetch.
     */
    where?: FeatureUsageWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of FeatureUsages to fetch.
     */
    orderBy?:
      | FeatureUsageOrderByWithRelationInput
      | FeatureUsageOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for FeatureUsages.
     */
    cursor?: FeatureUsageWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` FeatureUsages from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` FeatureUsages.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of FeatureUsages.
     */
    distinct?: FeatureUsageScalarFieldEnum | FeatureUsageScalarFieldEnum[];
  };

  /**
   * FeatureUsage findMany
   */
  export type FeatureUsageFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
    /**
     * Filter, which FeatureUsages to fetch.
     */
    where?: FeatureUsageWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of FeatureUsages to fetch.
     */
    orderBy?:
      | FeatureUsageOrderByWithRelationInput
      | FeatureUsageOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing FeatureUsages.
     */
    cursor?: FeatureUsageWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` FeatureUsages from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` FeatureUsages.
     */
    skip?: number;
    distinct?: FeatureUsageScalarFieldEnum | FeatureUsageScalarFieldEnum[];
  };

  /**
   * FeatureUsage create
   */
  export type FeatureUsageCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
    /**
     * The data needed to create a FeatureUsage.
     */
    data: XOR<FeatureUsageCreateInput, FeatureUsageUncheckedCreateInput>;
  };

  /**
   * FeatureUsage createMany
   */
  export type FeatureUsageCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many FeatureUsages.
     */
    data: FeatureUsageCreateManyInput | FeatureUsageCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * FeatureUsage createManyAndReturn
   */
  export type FeatureUsageCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * The data used to create many FeatureUsages.
     */
    data: FeatureUsageCreateManyInput | FeatureUsageCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * FeatureUsage update
   */
  export type FeatureUsageUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
    /**
     * The data needed to update a FeatureUsage.
     */
    data: XOR<FeatureUsageUpdateInput, FeatureUsageUncheckedUpdateInput>;
    /**
     * Choose, which FeatureUsage to update.
     */
    where: FeatureUsageWhereUniqueInput;
  };

  /**
   * FeatureUsage updateMany
   */
  export type FeatureUsageUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update FeatureUsages.
     */
    data: XOR<
      FeatureUsageUpdateManyMutationInput,
      FeatureUsageUncheckedUpdateManyInput
    >;
    /**
     * Filter which FeatureUsages to update
     */
    where?: FeatureUsageWhereInput;
    /**
     * Limit how many FeatureUsages to update.
     */
    limit?: number;
  };

  /**
   * FeatureUsage updateManyAndReturn
   */
  export type FeatureUsageUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * The data used to update FeatureUsages.
     */
    data: XOR<
      FeatureUsageUpdateManyMutationInput,
      FeatureUsageUncheckedUpdateManyInput
    >;
    /**
     * Filter which FeatureUsages to update
     */
    where?: FeatureUsageWhereInput;
    /**
     * Limit how many FeatureUsages to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * FeatureUsage upsert
   */
  export type FeatureUsageUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
    /**
     * The filter to search for the FeatureUsage to update in case it exists.
     */
    where: FeatureUsageWhereUniqueInput;
    /**
     * In case the FeatureUsage found by the `where` argument doesn't exist, create a new FeatureUsage with this data.
     */
    create: XOR<FeatureUsageCreateInput, FeatureUsageUncheckedCreateInput>;
    /**
     * In case the FeatureUsage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FeatureUsageUpdateInput, FeatureUsageUncheckedUpdateInput>;
  };

  /**
   * FeatureUsage delete
   */
  export type FeatureUsageDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
    /**
     * Filter which FeatureUsage to delete.
     */
    where: FeatureUsageWhereUniqueInput;
  };

  /**
   * FeatureUsage deleteMany
   */
  export type FeatureUsageDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which FeatureUsages to delete
     */
    where?: FeatureUsageWhereInput;
    /**
     * Limit how many FeatureUsages to delete.
     */
    limit?: number;
  };

  /**
   * FeatureUsage without action
   */
  export type FeatureUsageDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the FeatureUsage
     */
    select?: FeatureUsageSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FeatureUsage
     */
    omit?: FeatureUsageOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FeatureUsageInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: "ReadUncommitted";
    ReadCommitted: "ReadCommitted";
    RepeatableRead: "RepeatableRead";
    Serializable: "Serializable";
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const UserScalarFieldEnum: {
    id: "id";
    firebaseUid: "firebaseUid";
    name: "name";
    email: "email";
    phone: "phone";
    address: "address";
    notes: "notes";
    timezone: "timezone";
    role: "role";
    isActive: "isActive";
    isDeleted: "isDeleted";
    deletedAt: "deletedAt";
    lastLogin: "lastLogin";
    hasUsedFreeTrial: "hasUsedFreeTrial";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
  };

  export type UserScalarFieldEnum =
    (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];

  export const OrderScalarFieldEnum: {
    id: "id";
    userId: "userId";
    totalAmount: "totalAmount";
    status: "status";
    stripeSessionId: "stripeSessionId";
    skipPayment: "skipPayment";
    orderType: "orderType";
    isDeleted: "isDeleted";
    deletedAt: "deletedAt";
    deletedBy: "deletedBy";
    createdAt: "createdAt";
  };

  export type OrderScalarFieldEnum =
    (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum];

  export const ContactMessageScalarFieldEnum: {
    id: "id";
    name: "name";
    email: "email";
    phone: "phone";
    subject: "subject";
    message: "message";
    createdAt: "createdAt";
  };

  export type ContactMessageScalarFieldEnum =
    (typeof ContactMessageScalarFieldEnum)[keyof typeof ContactMessageScalarFieldEnum];

  export const FeatureUsageScalarFieldEnum: {
    id: "id";
    userId: "userId";
    featureType: "featureType";
    inputData: "inputData";
    resultData: "resultData";
    usageTimeMs: "usageTimeMs";
    createdAt: "createdAt";
  };

  export type FeatureUsageScalarFieldEnum =
    (typeof FeatureUsageScalarFieldEnum)[keyof typeof FeatureUsageScalarFieldEnum];

  export const SortOrder: {
    asc: "asc";
    desc: "desc";
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull;
  };

  export type JsonNullValueInput =
    (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];

  export const QueryMode: {
    default: "default";
    insensitive: "insensitive";
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: "first";
    last: "last";
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  export const JsonNullValueFilter: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
    AnyNull: typeof AnyNull;
  };

  export type JsonNullValueFilter =
    (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "String"
  >;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "String[]"
  >;

  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Boolean"
  >;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "DateTime"
  >;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "DateTime[]"
  >;

  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Decimal"
  >;

  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Decimal[]"
  >;

  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Json"
  >;

  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "QueryMode"
  >;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Int"
  >;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Int[]"
  >;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Float"
  >;

  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "Float[]"
  >;

  /**
   * Deep Input Types
   */

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[];
    OR?: UserWhereInput[];
    NOT?: UserWhereInput | UserWhereInput[];
    id?: StringFilter<"User"> | string;
    firebaseUid?: StringNullableFilter<"User"> | string | null;
    name?: StringFilter<"User"> | string;
    email?: StringFilter<"User"> | string;
    phone?: StringNullableFilter<"User"> | string | null;
    address?: StringNullableFilter<"User"> | string | null;
    notes?: StringNullableFilter<"User"> | string | null;
    timezone?: StringNullableFilter<"User"> | string | null;
    role?: StringFilter<"User"> | string;
    isActive?: BoolFilter<"User"> | boolean;
    isDeleted?: BoolFilter<"User"> | boolean;
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null;
    lastLogin?: DateTimeNullableFilter<"User"> | Date | string | null;
    hasUsedFreeTrial?: BoolFilter<"User"> | boolean;
    createdAt?: DateTimeFilter<"User"> | Date | string;
    updatedAt?: DateTimeFilter<"User"> | Date | string;
    Orders?: OrderListRelationFilter;
    FeatureUsages?: FeatureUsageListRelationFilter;
  };

  export type UserOrderByWithRelationInput = {
    id?: SortOrder;
    firebaseUid?: SortOrderInput | SortOrder;
    name?: SortOrder;
    email?: SortOrder;
    phone?: SortOrderInput | SortOrder;
    address?: SortOrderInput | SortOrder;
    notes?: SortOrderInput | SortOrder;
    timezone?: SortOrderInput | SortOrder;
    role?: SortOrder;
    isActive?: SortOrder;
    isDeleted?: SortOrder;
    deletedAt?: SortOrderInput | SortOrder;
    lastLogin?: SortOrderInput | SortOrder;
    hasUsedFreeTrial?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    Orders?: OrderOrderByRelationAggregateInput;
    FeatureUsages?: FeatureUsageOrderByRelationAggregateInput;
  };

  export type UserWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      firebaseUid?: string;
      email?: string;
      AND?: UserWhereInput | UserWhereInput[];
      OR?: UserWhereInput[];
      NOT?: UserWhereInput | UserWhereInput[];
      name?: StringFilter<"User"> | string;
      phone?: StringNullableFilter<"User"> | string | null;
      address?: StringNullableFilter<"User"> | string | null;
      notes?: StringNullableFilter<"User"> | string | null;
      timezone?: StringNullableFilter<"User"> | string | null;
      role?: StringFilter<"User"> | string;
      isActive?: BoolFilter<"User"> | boolean;
      isDeleted?: BoolFilter<"User"> | boolean;
      deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null;
      lastLogin?: DateTimeNullableFilter<"User"> | Date | string | null;
      hasUsedFreeTrial?: BoolFilter<"User"> | boolean;
      createdAt?: DateTimeFilter<"User"> | Date | string;
      updatedAt?: DateTimeFilter<"User"> | Date | string;
      Orders?: OrderListRelationFilter;
      FeatureUsages?: FeatureUsageListRelationFilter;
    },
    "id" | "firebaseUid" | "email"
  >;

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder;
    firebaseUid?: SortOrderInput | SortOrder;
    name?: SortOrder;
    email?: SortOrder;
    phone?: SortOrderInput | SortOrder;
    address?: SortOrderInput | SortOrder;
    notes?: SortOrderInput | SortOrder;
    timezone?: SortOrderInput | SortOrder;
    role?: SortOrder;
    isActive?: SortOrder;
    isDeleted?: SortOrder;
    deletedAt?: SortOrderInput | SortOrder;
    lastLogin?: SortOrderInput | SortOrder;
    hasUsedFreeTrial?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: UserCountOrderByAggregateInput;
    _max?: UserMaxOrderByAggregateInput;
    _min?: UserMinOrderByAggregateInput;
  };

  export type UserScalarWhereWithAggregatesInput = {
    AND?:
      | UserScalarWhereWithAggregatesInput
      | UserScalarWhereWithAggregatesInput[];
    OR?: UserScalarWhereWithAggregatesInput[];
    NOT?:
      | UserScalarWhereWithAggregatesInput
      | UserScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"User"> | string;
    firebaseUid?: StringNullableWithAggregatesFilter<"User"> | string | null;
    name?: StringWithAggregatesFilter<"User"> | string;
    email?: StringWithAggregatesFilter<"User"> | string;
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null;
    address?: StringNullableWithAggregatesFilter<"User"> | string | null;
    notes?: StringNullableWithAggregatesFilter<"User"> | string | null;
    timezone?: StringNullableWithAggregatesFilter<"User"> | string | null;
    role?: StringWithAggregatesFilter<"User"> | string;
    isActive?: BoolWithAggregatesFilter<"User"> | boolean;
    isDeleted?: BoolWithAggregatesFilter<"User"> | boolean;
    deletedAt?:
      | DateTimeNullableWithAggregatesFilter<"User">
      | Date
      | string
      | null;
    lastLogin?:
      | DateTimeNullableWithAggregatesFilter<"User">
      | Date
      | string
      | null;
    hasUsedFreeTrial?: BoolWithAggregatesFilter<"User"> | boolean;
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string;
  };

  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[];
    OR?: OrderWhereInput[];
    NOT?: OrderWhereInput | OrderWhereInput[];
    id?: StringFilter<"Order"> | string;
    userId?: StringFilter<"Order"> | string;
    totalAmount?:
      | DecimalFilter<"Order">
      | Decimal
      | DecimalJsLike
      | number
      | string;
    status?: StringNullableFilter<"Order"> | string | null;
    stripeSessionId?: StringNullableFilter<"Order"> | string | null;
    skipPayment?: BoolFilter<"Order"> | boolean;
    orderType?: StringFilter<"Order"> | string;
    isDeleted?: BoolFilter<"Order"> | boolean;
    deletedAt?: DateTimeNullableFilter<"Order"> | Date | string | null;
    deletedBy?: StringNullableFilter<"Order"> | string | null;
    createdAt?: DateTimeFilter<"Order"> | Date | string;
    user?: XOR<UserScalarRelationFilter, UserWhereInput>;
  };

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    totalAmount?: SortOrder;
    status?: SortOrderInput | SortOrder;
    stripeSessionId?: SortOrderInput | SortOrder;
    skipPayment?: SortOrder;
    orderType?: SortOrder;
    isDeleted?: SortOrder;
    deletedAt?: SortOrderInput | SortOrder;
    deletedBy?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type OrderWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      stripeSessionId?: string;
      AND?: OrderWhereInput | OrderWhereInput[];
      OR?: OrderWhereInput[];
      NOT?: OrderWhereInput | OrderWhereInput[];
      userId?: StringFilter<"Order"> | string;
      totalAmount?:
        | DecimalFilter<"Order">
        | Decimal
        | DecimalJsLike
        | number
        | string;
      status?: StringNullableFilter<"Order"> | string | null;
      skipPayment?: BoolFilter<"Order"> | boolean;
      orderType?: StringFilter<"Order"> | string;
      isDeleted?: BoolFilter<"Order"> | boolean;
      deletedAt?: DateTimeNullableFilter<"Order"> | Date | string | null;
      deletedBy?: StringNullableFilter<"Order"> | string | null;
      createdAt?: DateTimeFilter<"Order"> | Date | string;
      user?: XOR<UserScalarRelationFilter, UserWhereInput>;
    },
    "id" | "stripeSessionId"
  >;

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    totalAmount?: SortOrder;
    status?: SortOrderInput | SortOrder;
    stripeSessionId?: SortOrderInput | SortOrder;
    skipPayment?: SortOrder;
    orderType?: SortOrder;
    isDeleted?: SortOrder;
    deletedAt?: SortOrderInput | SortOrder;
    deletedBy?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    _count?: OrderCountOrderByAggregateInput;
    _avg?: OrderAvgOrderByAggregateInput;
    _max?: OrderMaxOrderByAggregateInput;
    _min?: OrderMinOrderByAggregateInput;
    _sum?: OrderSumOrderByAggregateInput;
  };

  export type OrderScalarWhereWithAggregatesInput = {
    AND?:
      | OrderScalarWhereWithAggregatesInput
      | OrderScalarWhereWithAggregatesInput[];
    OR?: OrderScalarWhereWithAggregatesInput[];
    NOT?:
      | OrderScalarWhereWithAggregatesInput
      | OrderScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Order"> | string;
    userId?: StringWithAggregatesFilter<"Order"> | string;
    totalAmount?:
      | DecimalWithAggregatesFilter<"Order">
      | Decimal
      | DecimalJsLike
      | number
      | string;
    status?: StringNullableWithAggregatesFilter<"Order"> | string | null;
    stripeSessionId?:
      | StringNullableWithAggregatesFilter<"Order">
      | string
      | null;
    skipPayment?: BoolWithAggregatesFilter<"Order"> | boolean;
    orderType?: StringWithAggregatesFilter<"Order"> | string;
    isDeleted?: BoolWithAggregatesFilter<"Order"> | boolean;
    deletedAt?:
      | DateTimeNullableWithAggregatesFilter<"Order">
      | Date
      | string
      | null;
    deletedBy?: StringNullableWithAggregatesFilter<"Order"> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string;
  };

  export type ContactMessageWhereInput = {
    AND?: ContactMessageWhereInput | ContactMessageWhereInput[];
    OR?: ContactMessageWhereInput[];
    NOT?: ContactMessageWhereInput | ContactMessageWhereInput[];
    id?: StringFilter<"ContactMessage"> | string;
    name?: StringFilter<"ContactMessage"> | string;
    email?: StringFilter<"ContactMessage"> | string;
    phone?: StringNullableFilter<"ContactMessage"> | string | null;
    subject?: StringFilter<"ContactMessage"> | string;
    message?: StringFilter<"ContactMessage"> | string;
    createdAt?: DateTimeFilter<"ContactMessage"> | Date | string;
  };

  export type ContactMessageOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    email?: SortOrder;
    phone?: SortOrderInput | SortOrder;
    subject?: SortOrder;
    message?: SortOrder;
    createdAt?: SortOrder;
  };

  export type ContactMessageWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: ContactMessageWhereInput | ContactMessageWhereInput[];
      OR?: ContactMessageWhereInput[];
      NOT?: ContactMessageWhereInput | ContactMessageWhereInput[];
      name?: StringFilter<"ContactMessage"> | string;
      email?: StringFilter<"ContactMessage"> | string;
      phone?: StringNullableFilter<"ContactMessage"> | string | null;
      subject?: StringFilter<"ContactMessage"> | string;
      message?: StringFilter<"ContactMessage"> | string;
      createdAt?: DateTimeFilter<"ContactMessage"> | Date | string;
    },
    "id"
  >;

  export type ContactMessageOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    email?: SortOrder;
    phone?: SortOrderInput | SortOrder;
    subject?: SortOrder;
    message?: SortOrder;
    createdAt?: SortOrder;
    _count?: ContactMessageCountOrderByAggregateInput;
    _max?: ContactMessageMaxOrderByAggregateInput;
    _min?: ContactMessageMinOrderByAggregateInput;
  };

  export type ContactMessageScalarWhereWithAggregatesInput = {
    AND?:
      | ContactMessageScalarWhereWithAggregatesInput
      | ContactMessageScalarWhereWithAggregatesInput[];
    OR?: ContactMessageScalarWhereWithAggregatesInput[];
    NOT?:
      | ContactMessageScalarWhereWithAggregatesInput
      | ContactMessageScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"ContactMessage"> | string;
    name?: StringWithAggregatesFilter<"ContactMessage"> | string;
    email?: StringWithAggregatesFilter<"ContactMessage"> | string;
    phone?:
      | StringNullableWithAggregatesFilter<"ContactMessage">
      | string
      | null;
    subject?: StringWithAggregatesFilter<"ContactMessage"> | string;
    message?: StringWithAggregatesFilter<"ContactMessage"> | string;
    createdAt?: DateTimeWithAggregatesFilter<"ContactMessage"> | Date | string;
  };

  export type FeatureUsageWhereInput = {
    AND?: FeatureUsageWhereInput | FeatureUsageWhereInput[];
    OR?: FeatureUsageWhereInput[];
    NOT?: FeatureUsageWhereInput | FeatureUsageWhereInput[];
    id?: StringFilter<"FeatureUsage"> | string;
    userId?: StringFilter<"FeatureUsage"> | string;
    featureType?: StringFilter<"FeatureUsage"> | string;
    inputData?: JsonFilter<"FeatureUsage">;
    resultData?: JsonFilter<"FeatureUsage">;
    usageTimeMs?: IntFilter<"FeatureUsage"> | number;
    createdAt?: DateTimeFilter<"FeatureUsage"> | Date | string;
    user?: XOR<UserScalarRelationFilter, UserWhereInput>;
  };

  export type FeatureUsageOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    featureType?: SortOrder;
    inputData?: SortOrder;
    resultData?: SortOrder;
    usageTimeMs?: SortOrder;
    createdAt?: SortOrder;
    user?: UserOrderByWithRelationInput;
  };

  export type FeatureUsageWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: FeatureUsageWhereInput | FeatureUsageWhereInput[];
      OR?: FeatureUsageWhereInput[];
      NOT?: FeatureUsageWhereInput | FeatureUsageWhereInput[];
      userId?: StringFilter<"FeatureUsage"> | string;
      featureType?: StringFilter<"FeatureUsage"> | string;
      inputData?: JsonFilter<"FeatureUsage">;
      resultData?: JsonFilter<"FeatureUsage">;
      usageTimeMs?: IntFilter<"FeatureUsage"> | number;
      createdAt?: DateTimeFilter<"FeatureUsage"> | Date | string;
      user?: XOR<UserScalarRelationFilter, UserWhereInput>;
    },
    "id"
  >;

  export type FeatureUsageOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    featureType?: SortOrder;
    inputData?: SortOrder;
    resultData?: SortOrder;
    usageTimeMs?: SortOrder;
    createdAt?: SortOrder;
    _count?: FeatureUsageCountOrderByAggregateInput;
    _avg?: FeatureUsageAvgOrderByAggregateInput;
    _max?: FeatureUsageMaxOrderByAggregateInput;
    _min?: FeatureUsageMinOrderByAggregateInput;
    _sum?: FeatureUsageSumOrderByAggregateInput;
  };

  export type FeatureUsageScalarWhereWithAggregatesInput = {
    AND?:
      | FeatureUsageScalarWhereWithAggregatesInput
      | FeatureUsageScalarWhereWithAggregatesInput[];
    OR?: FeatureUsageScalarWhereWithAggregatesInput[];
    NOT?:
      | FeatureUsageScalarWhereWithAggregatesInput
      | FeatureUsageScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"FeatureUsage"> | string;
    userId?: StringWithAggregatesFilter<"FeatureUsage"> | string;
    featureType?: StringWithAggregatesFilter<"FeatureUsage"> | string;
    inputData?: JsonWithAggregatesFilter<"FeatureUsage">;
    resultData?: JsonWithAggregatesFilter<"FeatureUsage">;
    usageTimeMs?: IntWithAggregatesFilter<"FeatureUsage"> | number;
    createdAt?: DateTimeWithAggregatesFilter<"FeatureUsage"> | Date | string;
  };

  export type UserCreateInput = {
    id?: string;
    firebaseUid?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    timezone?: string | null;
    role?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    lastLogin?: Date | string | null;
    hasUsedFreeTrial?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    Orders?: OrderCreateNestedManyWithoutUserInput;
    FeatureUsages?: FeatureUsageCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateInput = {
    id?: string;
    firebaseUid?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    timezone?: string | null;
    role?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    lastLogin?: Date | string | null;
    hasUsedFreeTrial?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    Orders?: OrderUncheckedCreateNestedManyWithoutUserInput;
    FeatureUsages?: FeatureUsageUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firebaseUid?: NullableStringFieldUpdateOperationsInput | string | null;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    timezone?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    lastLogin?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    hasUsedFreeTrial?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    Orders?: OrderUpdateManyWithoutUserNestedInput;
    FeatureUsages?: FeatureUsageUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firebaseUid?: NullableStringFieldUpdateOperationsInput | string | null;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    timezone?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    lastLogin?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    hasUsedFreeTrial?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    Orders?: OrderUncheckedUpdateManyWithoutUserNestedInput;
    FeatureUsages?: FeatureUsageUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateManyInput = {
    id?: string;
    firebaseUid?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    timezone?: string | null;
    role?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    lastLogin?: Date | string | null;
    hasUsedFreeTrial?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firebaseUid?: NullableStringFieldUpdateOperationsInput | string | null;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    timezone?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    lastLogin?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    hasUsedFreeTrial?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firebaseUid?: NullableStringFieldUpdateOperationsInput | string | null;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    timezone?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    lastLogin?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    hasUsedFreeTrial?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type OrderCreateInput = {
    id?: string;
    totalAmount: Decimal | DecimalJsLike | number | string;
    status?: string | null;
    stripeSessionId?: string | null;
    skipPayment?: boolean;
    orderType?: string;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    deletedBy?: string | null;
    createdAt?: Date | string;
    user: UserCreateNestedOneWithoutOrdersInput;
  };

  export type OrderUncheckedCreateInput = {
    id?: string;
    userId: string;
    totalAmount: Decimal | DecimalJsLike | number | string;
    status?: string | null;
    stripeSessionId?: string | null;
    skipPayment?: boolean;
    orderType?: string;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    deletedBy?: string | null;
    createdAt?: Date | string;
  };

  export type OrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    totalAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    stripeSessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    skipPayment?: BoolFieldUpdateOperationsInput | boolean;
    orderType?: StringFieldUpdateOperationsInput | string;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutOrdersNestedInput;
  };

  export type OrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    totalAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    stripeSessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    skipPayment?: BoolFieldUpdateOperationsInput | boolean;
    orderType?: StringFieldUpdateOperationsInput | string;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type OrderCreateManyInput = {
    id?: string;
    userId: string;
    totalAmount: Decimal | DecimalJsLike | number | string;
    status?: string | null;
    stripeSessionId?: string | null;
    skipPayment?: boolean;
    orderType?: string;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    deletedBy?: string | null;
    createdAt?: Date | string;
  };

  export type OrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    totalAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    stripeSessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    skipPayment?: BoolFieldUpdateOperationsInput | boolean;
    orderType?: StringFieldUpdateOperationsInput | string;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type OrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    totalAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    stripeSessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    skipPayment?: BoolFieldUpdateOperationsInput | boolean;
    orderType?: StringFieldUpdateOperationsInput | string;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ContactMessageCreateInput = {
    id?: string;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    createdAt?: Date | string;
  };

  export type ContactMessageUncheckedCreateInput = {
    id?: string;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    createdAt?: Date | string;
  };

  export type ContactMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    subject?: StringFieldUpdateOperationsInput | string;
    message?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ContactMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    subject?: StringFieldUpdateOperationsInput | string;
    message?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ContactMessageCreateManyInput = {
    id?: string;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    createdAt?: Date | string;
  };

  export type ContactMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    subject?: StringFieldUpdateOperationsInput | string;
    message?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ContactMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    subject?: StringFieldUpdateOperationsInput | string;
    message?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type FeatureUsageCreateInput = {
    id?: string;
    featureType: string;
    inputData: JsonNullValueInput | InputJsonValue;
    resultData: JsonNullValueInput | InputJsonValue;
    usageTimeMs: number;
    createdAt?: Date | string;
    user: UserCreateNestedOneWithoutFeatureUsagesInput;
  };

  export type FeatureUsageUncheckedCreateInput = {
    id?: string;
    userId: string;
    featureType: string;
    inputData: JsonNullValueInput | InputJsonValue;
    resultData: JsonNullValueInput | InputJsonValue;
    usageTimeMs: number;
    createdAt?: Date | string;
  };

  export type FeatureUsageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    featureType?: StringFieldUpdateOperationsInput | string;
    inputData?: JsonNullValueInput | InputJsonValue;
    resultData?: JsonNullValueInput | InputJsonValue;
    usageTimeMs?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    user?: UserUpdateOneRequiredWithoutFeatureUsagesNestedInput;
  };

  export type FeatureUsageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    featureType?: StringFieldUpdateOperationsInput | string;
    inputData?: JsonNullValueInput | InputJsonValue;
    resultData?: JsonNullValueInput | InputJsonValue;
    usageTimeMs?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type FeatureUsageCreateManyInput = {
    id?: string;
    userId: string;
    featureType: string;
    inputData: JsonNullValueInput | InputJsonValue;
    resultData: JsonNullValueInput | InputJsonValue;
    usageTimeMs: number;
    createdAt?: Date | string;
  };

  export type FeatureUsageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    featureType?: StringFieldUpdateOperationsInput | string;
    inputData?: JsonNullValueInput | InputJsonValue;
    resultData?: JsonNullValueInput | InputJsonValue;
    usageTimeMs?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type FeatureUsageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    featureType?: StringFieldUpdateOperationsInput | string;
    inputData?: JsonNullValueInput | InputJsonValue;
    resultData?: JsonNullValueInput | InputJsonValue;
    usageTimeMs?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type OrderListRelationFilter = {
    every?: OrderWhereInput;
    some?: OrderWhereInput;
    none?: OrderWhereInput;
  };

  export type FeatureUsageListRelationFilter = {
    every?: FeatureUsageWhereInput;
    some?: FeatureUsageWhereInput;
    none?: FeatureUsageWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type OrderOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type FeatureUsageOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder;
    firebaseUid?: SortOrder;
    name?: SortOrder;
    email?: SortOrder;
    phone?: SortOrder;
    address?: SortOrder;
    notes?: SortOrder;
    timezone?: SortOrder;
    role?: SortOrder;
    isActive?: SortOrder;
    isDeleted?: SortOrder;
    deletedAt?: SortOrder;
    lastLogin?: SortOrder;
    hasUsedFreeTrial?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder;
    firebaseUid?: SortOrder;
    name?: SortOrder;
    email?: SortOrder;
    phone?: SortOrder;
    address?: SortOrder;
    notes?: SortOrder;
    timezone?: SortOrder;
    role?: SortOrder;
    isActive?: SortOrder;
    isDeleted?: SortOrder;
    deletedAt?: SortOrder;
    lastLogin?: SortOrder;
    hasUsedFreeTrial?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder;
    firebaseUid?: SortOrder;
    name?: SortOrder;
    email?: SortOrder;
    phone?: SortOrder;
    address?: SortOrder;
    notes?: SortOrder;
    timezone?: SortOrder;
    role?: SortOrder;
    isActive?: SortOrder;
    isDeleted?: SortOrder;
    deletedAt?: SortOrder;
    lastLogin?: SortOrder;
    hasUsedFreeTrial?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?:
      | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
      | Date
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: NestedDateTimeNullableFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type DecimalFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    in?:
      | Decimal[]
      | DecimalJsLike[]
      | number[]
      | string[]
      | ListDecimalFieldRefInput<$PrismaModel>;
    notIn?:
      | Decimal[]
      | DecimalJsLike[]
      | number[]
      | string[]
      | ListDecimalFieldRefInput<$PrismaModel>;
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string;
  };

  export type UserScalarRelationFilter = {
    is?: UserWhereInput;
    isNot?: UserWhereInput;
  };

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    totalAmount?: SortOrder;
    status?: SortOrder;
    stripeSessionId?: SortOrder;
    skipPayment?: SortOrder;
    orderType?: SortOrder;
    isDeleted?: SortOrder;
    deletedAt?: SortOrder;
    deletedBy?: SortOrder;
    createdAt?: SortOrder;
  };

  export type OrderAvgOrderByAggregateInput = {
    totalAmount?: SortOrder;
  };

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    totalAmount?: SortOrder;
    status?: SortOrder;
    stripeSessionId?: SortOrder;
    skipPayment?: SortOrder;
    orderType?: SortOrder;
    isDeleted?: SortOrder;
    deletedAt?: SortOrder;
    deletedBy?: SortOrder;
    createdAt?: SortOrder;
  };

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    totalAmount?: SortOrder;
    status?: SortOrder;
    stripeSessionId?: SortOrder;
    skipPayment?: SortOrder;
    orderType?: SortOrder;
    isDeleted?: SortOrder;
    deletedAt?: SortOrder;
    deletedBy?: SortOrder;
    createdAt?: SortOrder;
  };

  export type OrderSumOrderByAggregateInput = {
    totalAmount?: SortOrder;
  };

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    in?:
      | Decimal[]
      | DecimalJsLike[]
      | number[]
      | string[]
      | ListDecimalFieldRefInput<$PrismaModel>;
    notIn?:
      | Decimal[]
      | DecimalJsLike[]
      | number[]
      | string[]
      | ListDecimalFieldRefInput<$PrismaModel>;
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalWithAggregatesFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedDecimalFilter<$PrismaModel>;
    _sum?: NestedDecimalFilter<$PrismaModel>;
    _min?: NestedDecimalFilter<$PrismaModel>;
    _max?: NestedDecimalFilter<$PrismaModel>;
  };

  export type ContactMessageCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    email?: SortOrder;
    phone?: SortOrder;
    subject?: SortOrder;
    message?: SortOrder;
    createdAt?: SortOrder;
  };

  export type ContactMessageMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    email?: SortOrder;
    phone?: SortOrder;
    subject?: SortOrder;
    message?: SortOrder;
    createdAt?: SortOrder;
  };

  export type ContactMessageMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    email?: SortOrder;
    phone?: SortOrder;
    subject?: SortOrder;
    message?: SortOrder;
    createdAt?: SortOrder;
  };
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, "path">
        >,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, "path">>;

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
    path?: string[];
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
  };

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type FeatureUsageCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    featureType?: SortOrder;
    inputData?: SortOrder;
    resultData?: SortOrder;
    usageTimeMs?: SortOrder;
    createdAt?: SortOrder;
  };

  export type FeatureUsageAvgOrderByAggregateInput = {
    usageTimeMs?: SortOrder;
  };

  export type FeatureUsageMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    featureType?: SortOrder;
    usageTimeMs?: SortOrder;
    createdAt?: SortOrder;
  };

  export type FeatureUsageMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    featureType?: SortOrder;
    usageTimeMs?: SortOrder;
    createdAt?: SortOrder;
  };

  export type FeatureUsageSumOrderByAggregateInput = {
    usageTimeMs?: SortOrder;
  };
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonWithAggregatesFilterBase<$PrismaModel>>,
          Exclude<
            keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>,
            "path"
          >
        >,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<
        Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, "path">
      >;

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
    path?: string[];
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedJsonFilter<$PrismaModel>;
    _max?: NestedJsonFilter<$PrismaModel>;
  };

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type OrderCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput>
      | OrderCreateWithoutUserInput[]
      | OrderUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | OrderCreateOrConnectWithoutUserInput
      | OrderCreateOrConnectWithoutUserInput[];
    createMany?: OrderCreateManyUserInputEnvelope;
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[];
  };

  export type FeatureUsageCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<
          FeatureUsageCreateWithoutUserInput,
          FeatureUsageUncheckedCreateWithoutUserInput
        >
      | FeatureUsageCreateWithoutUserInput[]
      | FeatureUsageUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | FeatureUsageCreateOrConnectWithoutUserInput
      | FeatureUsageCreateOrConnectWithoutUserInput[];
    createMany?: FeatureUsageCreateManyUserInputEnvelope;
    connect?: FeatureUsageWhereUniqueInput | FeatureUsageWhereUniqueInput[];
  };

  export type OrderUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput>
      | OrderCreateWithoutUserInput[]
      | OrderUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | OrderCreateOrConnectWithoutUserInput
      | OrderCreateOrConnectWithoutUserInput[];
    createMany?: OrderCreateManyUserInputEnvelope;
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[];
  };

  export type FeatureUsageUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<
          FeatureUsageCreateWithoutUserInput,
          FeatureUsageUncheckedCreateWithoutUserInput
        >
      | FeatureUsageCreateWithoutUserInput[]
      | FeatureUsageUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | FeatureUsageCreateOrConnectWithoutUserInput
      | FeatureUsageCreateOrConnectWithoutUserInput[];
    createMany?: FeatureUsageCreateManyUserInputEnvelope;
    connect?: FeatureUsageWhereUniqueInput | FeatureUsageWhereUniqueInput[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
  };

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type OrderUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput>
      | OrderCreateWithoutUserInput[]
      | OrderUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | OrderCreateOrConnectWithoutUserInput
      | OrderCreateOrConnectWithoutUserInput[];
    upsert?:
      | OrderUpsertWithWhereUniqueWithoutUserInput
      | OrderUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: OrderCreateManyUserInputEnvelope;
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[];
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[];
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[];
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[];
    update?:
      | OrderUpdateWithWhereUniqueWithoutUserInput
      | OrderUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | OrderUpdateManyWithWhereWithoutUserInput
      | OrderUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[];
  };

  export type FeatureUsageUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<
          FeatureUsageCreateWithoutUserInput,
          FeatureUsageUncheckedCreateWithoutUserInput
        >
      | FeatureUsageCreateWithoutUserInput[]
      | FeatureUsageUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | FeatureUsageCreateOrConnectWithoutUserInput
      | FeatureUsageCreateOrConnectWithoutUserInput[];
    upsert?:
      | FeatureUsageUpsertWithWhereUniqueWithoutUserInput
      | FeatureUsageUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: FeatureUsageCreateManyUserInputEnvelope;
    set?: FeatureUsageWhereUniqueInput | FeatureUsageWhereUniqueInput[];
    disconnect?: FeatureUsageWhereUniqueInput | FeatureUsageWhereUniqueInput[];
    delete?: FeatureUsageWhereUniqueInput | FeatureUsageWhereUniqueInput[];
    connect?: FeatureUsageWhereUniqueInput | FeatureUsageWhereUniqueInput[];
    update?:
      | FeatureUsageUpdateWithWhereUniqueWithoutUserInput
      | FeatureUsageUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | FeatureUsageUpdateManyWithWhereWithoutUserInput
      | FeatureUsageUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: FeatureUsageScalarWhereInput | FeatureUsageScalarWhereInput[];
  };

  export type OrderUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput>
      | OrderCreateWithoutUserInput[]
      | OrderUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | OrderCreateOrConnectWithoutUserInput
      | OrderCreateOrConnectWithoutUserInput[];
    upsert?:
      | OrderUpsertWithWhereUniqueWithoutUserInput
      | OrderUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: OrderCreateManyUserInputEnvelope;
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[];
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[];
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[];
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[];
    update?:
      | OrderUpdateWithWhereUniqueWithoutUserInput
      | OrderUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | OrderUpdateManyWithWhereWithoutUserInput
      | OrderUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[];
  };

  export type FeatureUsageUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<
          FeatureUsageCreateWithoutUserInput,
          FeatureUsageUncheckedCreateWithoutUserInput
        >
      | FeatureUsageCreateWithoutUserInput[]
      | FeatureUsageUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | FeatureUsageCreateOrConnectWithoutUserInput
      | FeatureUsageCreateOrConnectWithoutUserInput[];
    upsert?:
      | FeatureUsageUpsertWithWhereUniqueWithoutUserInput
      | FeatureUsageUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: FeatureUsageCreateManyUserInputEnvelope;
    set?: FeatureUsageWhereUniqueInput | FeatureUsageWhereUniqueInput[];
    disconnect?: FeatureUsageWhereUniqueInput | FeatureUsageWhereUniqueInput[];
    delete?: FeatureUsageWhereUniqueInput | FeatureUsageWhereUniqueInput[];
    connect?: FeatureUsageWhereUniqueInput | FeatureUsageWhereUniqueInput[];
    update?:
      | FeatureUsageUpdateWithWhereUniqueWithoutUserInput
      | FeatureUsageUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | FeatureUsageUpdateManyWithWhereWithoutUserInput
      | FeatureUsageUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: FeatureUsageScalarWhereInput | FeatureUsageScalarWhereInput[];
  };

  export type UserCreateNestedOneWithoutOrdersInput = {
    create?: XOR<
      UserCreateWithoutOrdersInput,
      UserUncheckedCreateWithoutOrdersInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutOrdersInput;
    connect?: UserWhereUniqueInput;
  };

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string;
    increment?: Decimal | DecimalJsLike | number | string;
    decrement?: Decimal | DecimalJsLike | number | string;
    multiply?: Decimal | DecimalJsLike | number | string;
    divide?: Decimal | DecimalJsLike | number | string;
  };

  export type UserUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: XOR<
      UserCreateWithoutOrdersInput,
      UserUncheckedCreateWithoutOrdersInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutOrdersInput;
    upsert?: UserUpsertWithoutOrdersInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<
        UserUpdateToOneWithWhereWithoutOrdersInput,
        UserUpdateWithoutOrdersInput
      >,
      UserUncheckedUpdateWithoutOrdersInput
    >;
  };

  export type UserCreateNestedOneWithoutFeatureUsagesInput = {
    create?: XOR<
      UserCreateWithoutFeatureUsagesInput,
      UserUncheckedCreateWithoutFeatureUsagesInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutFeatureUsagesInput;
    connect?: UserWhereUniqueInput;
  };

  export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type UserUpdateOneRequiredWithoutFeatureUsagesNestedInput = {
    create?: XOR<
      UserCreateWithoutFeatureUsagesInput,
      UserUncheckedCreateWithoutFeatureUsagesInput
    >;
    connectOrCreate?: UserCreateOrConnectWithoutFeatureUsagesInput;
    upsert?: UserUpsertWithoutFeatureUsagesInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<
        UserUpdateToOneWithWhereWithoutFeatureUsagesInput,
        UserUpdateWithoutFeatureUsagesInput
      >,
      UserUncheckedUpdateWithoutFeatureUsagesInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
      in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
      notIn?:
        | Date[]
        | string[]
        | ListDateTimeFieldRefInput<$PrismaModel>
        | null;
      lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      not?:
        | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
        | Date
        | string
        | null;
      _count?: NestedIntNullableFilter<$PrismaModel>;
      _min?: NestedDateTimeNullableFilter<$PrismaModel>;
      _max?: NestedDateTimeNullableFilter<$PrismaModel>;
    };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    in?:
      | Decimal[]
      | DecimalJsLike[]
      | number[]
      | string[]
      | ListDecimalFieldRefInput<$PrismaModel>;
    notIn?:
      | Decimal[]
      | DecimalJsLike[]
      | number[]
      | string[]
      | ListDecimalFieldRefInput<$PrismaModel>;
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string;
  };

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    in?:
      | Decimal[]
      | DecimalJsLike[]
      | number[]
      | string[]
      | ListDecimalFieldRefInput<$PrismaModel>;
    notIn?:
      | Decimal[]
      | DecimalJsLike[]
      | number[]
      | string[]
      | ListDecimalFieldRefInput<$PrismaModel>;
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalWithAggregatesFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedDecimalFilter<$PrismaModel>;
    _sum?: NestedDecimalFilter<$PrismaModel>;
    _min?: NestedDecimalFilter<$PrismaModel>;
    _max?: NestedDecimalFilter<$PrismaModel>;
  };
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<NestedJsonFilterBase<$PrismaModel>>,
          Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, "path">
        >,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, "path">>;

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
    path?: string[];
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?:
      | InputJsonValue
      | JsonFieldRefInput<$PrismaModel>
      | JsonNullValueFilter;
  };

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type OrderCreateWithoutUserInput = {
    id?: string;
    totalAmount: Decimal | DecimalJsLike | number | string;
    status?: string | null;
    stripeSessionId?: string | null;
    skipPayment?: boolean;
    orderType?: string;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    deletedBy?: string | null;
    createdAt?: Date | string;
  };

  export type OrderUncheckedCreateWithoutUserInput = {
    id?: string;
    totalAmount: Decimal | DecimalJsLike | number | string;
    status?: string | null;
    stripeSessionId?: string | null;
    skipPayment?: boolean;
    orderType?: string;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    deletedBy?: string | null;
    createdAt?: Date | string;
  };

  export type OrderCreateOrConnectWithoutUserInput = {
    where: OrderWhereUniqueInput;
    create: XOR<
      OrderCreateWithoutUserInput,
      OrderUncheckedCreateWithoutUserInput
    >;
  };

  export type OrderCreateManyUserInputEnvelope = {
    data: OrderCreateManyUserInput | OrderCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type FeatureUsageCreateWithoutUserInput = {
    id?: string;
    featureType: string;
    inputData: JsonNullValueInput | InputJsonValue;
    resultData: JsonNullValueInput | InputJsonValue;
    usageTimeMs: number;
    createdAt?: Date | string;
  };

  export type FeatureUsageUncheckedCreateWithoutUserInput = {
    id?: string;
    featureType: string;
    inputData: JsonNullValueInput | InputJsonValue;
    resultData: JsonNullValueInput | InputJsonValue;
    usageTimeMs: number;
    createdAt?: Date | string;
  };

  export type FeatureUsageCreateOrConnectWithoutUserInput = {
    where: FeatureUsageWhereUniqueInput;
    create: XOR<
      FeatureUsageCreateWithoutUserInput,
      FeatureUsageUncheckedCreateWithoutUserInput
    >;
  };

  export type FeatureUsageCreateManyUserInputEnvelope = {
    data: FeatureUsageCreateManyUserInput | FeatureUsageCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type OrderUpsertWithWhereUniqueWithoutUserInput = {
    where: OrderWhereUniqueInput;
    update: XOR<
      OrderUpdateWithoutUserInput,
      OrderUncheckedUpdateWithoutUserInput
    >;
    create: XOR<
      OrderCreateWithoutUserInput,
      OrderUncheckedCreateWithoutUserInput
    >;
  };

  export type OrderUpdateWithWhereUniqueWithoutUserInput = {
    where: OrderWhereUniqueInput;
    data: XOR<
      OrderUpdateWithoutUserInput,
      OrderUncheckedUpdateWithoutUserInput
    >;
  };

  export type OrderUpdateManyWithWhereWithoutUserInput = {
    where: OrderScalarWhereInput;
    data: XOR<
      OrderUpdateManyMutationInput,
      OrderUncheckedUpdateManyWithoutUserInput
    >;
  };

  export type OrderScalarWhereInput = {
    AND?: OrderScalarWhereInput | OrderScalarWhereInput[];
    OR?: OrderScalarWhereInput[];
    NOT?: OrderScalarWhereInput | OrderScalarWhereInput[];
    id?: StringFilter<"Order"> | string;
    userId?: StringFilter<"Order"> | string;
    totalAmount?:
      | DecimalFilter<"Order">
      | Decimal
      | DecimalJsLike
      | number
      | string;
    status?: StringNullableFilter<"Order"> | string | null;
    stripeSessionId?: StringNullableFilter<"Order"> | string | null;
    skipPayment?: BoolFilter<"Order"> | boolean;
    orderType?: StringFilter<"Order"> | string;
    isDeleted?: BoolFilter<"Order"> | boolean;
    deletedAt?: DateTimeNullableFilter<"Order"> | Date | string | null;
    deletedBy?: StringNullableFilter<"Order"> | string | null;
    createdAt?: DateTimeFilter<"Order"> | Date | string;
  };

  export type FeatureUsageUpsertWithWhereUniqueWithoutUserInput = {
    where: FeatureUsageWhereUniqueInput;
    update: XOR<
      FeatureUsageUpdateWithoutUserInput,
      FeatureUsageUncheckedUpdateWithoutUserInput
    >;
    create: XOR<
      FeatureUsageCreateWithoutUserInput,
      FeatureUsageUncheckedCreateWithoutUserInput
    >;
  };

  export type FeatureUsageUpdateWithWhereUniqueWithoutUserInput = {
    where: FeatureUsageWhereUniqueInput;
    data: XOR<
      FeatureUsageUpdateWithoutUserInput,
      FeatureUsageUncheckedUpdateWithoutUserInput
    >;
  };

  export type FeatureUsageUpdateManyWithWhereWithoutUserInput = {
    where: FeatureUsageScalarWhereInput;
    data: XOR<
      FeatureUsageUpdateManyMutationInput,
      FeatureUsageUncheckedUpdateManyWithoutUserInput
    >;
  };

  export type FeatureUsageScalarWhereInput = {
    AND?: FeatureUsageScalarWhereInput | FeatureUsageScalarWhereInput[];
    OR?: FeatureUsageScalarWhereInput[];
    NOT?: FeatureUsageScalarWhereInput | FeatureUsageScalarWhereInput[];
    id?: StringFilter<"FeatureUsage"> | string;
    userId?: StringFilter<"FeatureUsage"> | string;
    featureType?: StringFilter<"FeatureUsage"> | string;
    inputData?: JsonFilter<"FeatureUsage">;
    resultData?: JsonFilter<"FeatureUsage">;
    usageTimeMs?: IntFilter<"FeatureUsage"> | number;
    createdAt?: DateTimeFilter<"FeatureUsage"> | Date | string;
  };

  export type UserCreateWithoutOrdersInput = {
    id?: string;
    firebaseUid?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    timezone?: string | null;
    role?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    lastLogin?: Date | string | null;
    hasUsedFreeTrial?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    FeatureUsages?: FeatureUsageCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutOrdersInput = {
    id?: string;
    firebaseUid?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    timezone?: string | null;
    role?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    lastLogin?: Date | string | null;
    hasUsedFreeTrial?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    FeatureUsages?: FeatureUsageUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutOrdersInput = {
    where: UserWhereUniqueInput;
    create: XOR<
      UserCreateWithoutOrdersInput,
      UserUncheckedCreateWithoutOrdersInput
    >;
  };

  export type UserUpsertWithoutOrdersInput = {
    update: XOR<
      UserUpdateWithoutOrdersInput,
      UserUncheckedUpdateWithoutOrdersInput
    >;
    create: XOR<
      UserCreateWithoutOrdersInput,
      UserUncheckedCreateWithoutOrdersInput
    >;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutOrdersInput = {
    where?: UserWhereInput;
    data: XOR<
      UserUpdateWithoutOrdersInput,
      UserUncheckedUpdateWithoutOrdersInput
    >;
  };

  export type UserUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firebaseUid?: NullableStringFieldUpdateOperationsInput | string | null;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    timezone?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    lastLogin?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    hasUsedFreeTrial?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    FeatureUsages?: FeatureUsageUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firebaseUid?: NullableStringFieldUpdateOperationsInput | string | null;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    timezone?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    lastLogin?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    hasUsedFreeTrial?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    FeatureUsages?: FeatureUsageUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateWithoutFeatureUsagesInput = {
    id?: string;
    firebaseUid?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    timezone?: string | null;
    role?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    lastLogin?: Date | string | null;
    hasUsedFreeTrial?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    Orders?: OrderCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateWithoutFeatureUsagesInput = {
    id?: string;
    firebaseUid?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    timezone?: string | null;
    role?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    lastLogin?: Date | string | null;
    hasUsedFreeTrial?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    Orders?: OrderUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserCreateOrConnectWithoutFeatureUsagesInput = {
    where: UserWhereUniqueInput;
    create: XOR<
      UserCreateWithoutFeatureUsagesInput,
      UserUncheckedCreateWithoutFeatureUsagesInput
    >;
  };

  export type UserUpsertWithoutFeatureUsagesInput = {
    update: XOR<
      UserUpdateWithoutFeatureUsagesInput,
      UserUncheckedUpdateWithoutFeatureUsagesInput
    >;
    create: XOR<
      UserCreateWithoutFeatureUsagesInput,
      UserUncheckedCreateWithoutFeatureUsagesInput
    >;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutFeatureUsagesInput = {
    where?: UserWhereInput;
    data: XOR<
      UserUpdateWithoutFeatureUsagesInput,
      UserUncheckedUpdateWithoutFeatureUsagesInput
    >;
  };

  export type UserUpdateWithoutFeatureUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firebaseUid?: NullableStringFieldUpdateOperationsInput | string | null;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    timezone?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    lastLogin?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    hasUsedFreeTrial?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    Orders?: OrderUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateWithoutFeatureUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    firebaseUid?: NullableStringFieldUpdateOperationsInput | string | null;
    name?: StringFieldUpdateOperationsInput | string;
    email?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    timezone?: NullableStringFieldUpdateOperationsInput | string | null;
    role?: StringFieldUpdateOperationsInput | string;
    isActive?: BoolFieldUpdateOperationsInput | boolean;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    lastLogin?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    hasUsedFreeTrial?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    Orders?: OrderUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type OrderCreateManyUserInput = {
    id?: string;
    totalAmount: Decimal | DecimalJsLike | number | string;
    status?: string | null;
    stripeSessionId?: string | null;
    skipPayment?: boolean;
    orderType?: string;
    isDeleted?: boolean;
    deletedAt?: Date | string | null;
    deletedBy?: string | null;
    createdAt?: Date | string;
  };

  export type FeatureUsageCreateManyUserInput = {
    id?: string;
    featureType: string;
    inputData: JsonNullValueInput | InputJsonValue;
    resultData: JsonNullValueInput | InputJsonValue;
    usageTimeMs: number;
    createdAt?: Date | string;
  };

  export type OrderUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    totalAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    stripeSessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    skipPayment?: BoolFieldUpdateOperationsInput | boolean;
    orderType?: StringFieldUpdateOperationsInput | string;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type OrderUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    totalAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    stripeSessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    skipPayment?: BoolFieldUpdateOperationsInput | boolean;
    orderType?: StringFieldUpdateOperationsInput | string;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type OrderUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    totalAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    stripeSessionId?: NullableStringFieldUpdateOperationsInput | string | null;
    skipPayment?: BoolFieldUpdateOperationsInput | boolean;
    orderType?: StringFieldUpdateOperationsInput | string;
    isDeleted?: BoolFieldUpdateOperationsInput | boolean;
    deletedAt?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    deletedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type FeatureUsageUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    featureType?: StringFieldUpdateOperationsInput | string;
    inputData?: JsonNullValueInput | InputJsonValue;
    resultData?: JsonNullValueInput | InputJsonValue;
    usageTimeMs?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type FeatureUsageUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    featureType?: StringFieldUpdateOperationsInput | string;
    inputData?: JsonNullValueInput | InputJsonValue;
    resultData?: JsonNullValueInput | InputJsonValue;
    usageTimeMs?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type FeatureUsageUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string;
    featureType?: StringFieldUpdateOperationsInput | string;
    inputData?: JsonNullValueInput | InputJsonValue;
    resultData?: JsonNullValueInput | InputJsonValue;
    usageTimeMs?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
