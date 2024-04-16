import { RedisClientType, SetOptions } from 'redis';

import { CacheKeyArgument, CacheKeyValue, CacheValeuArgument } from './types';

export abstract class ICacheService<T = RedisClientType> {
  abstract client: T;
  abstract isConnected(): Promise<void>;
  abstract connect(): Promise<T>;
  abstract set(key: CacheKeyArgument, value: CacheValeuArgument, config?: SetOptions): Promise<void>;
  abstract del(key: CacheKeyArgument): Promise<void>;
  abstract get(key: CacheKeyArgument): Promise<string>;
  abstract setMulti(redisList: CacheKeyValue[]): Promise<void>;
  abstract pExpire(key: CacheKeyArgument, miliseconds: number): Promise<void>;
  abstract hGet(key: CacheKeyArgument, field: CacheKeyArgument): Promise<unknown | unknown[]>;
  abstract hSet(key: CacheKeyArgument, field: CacheKeyArgument, value: CacheValeuArgument): Promise<number>;
  abstract hGetAll(key: CacheKeyArgument): Promise<unknown | unknown[]>;
}
