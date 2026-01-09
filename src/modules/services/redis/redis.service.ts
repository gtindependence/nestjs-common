import { Inject, Injectable } from '@nestjs/common';
import { ApplicationTokens } from '../../application-tokens.const';
import { RedisException } from '../../exceptions/redis.exception';
import { RedisClient } from '../../providers';
import { RedisConfigurationOptions, RedisConfigurationToken } from '../../providers/redis-configuration/redis-configuration.provider';
import { ErrorHandler } from '../error-handler';

@Injectable()
export class RedisService {
    private keyPrefix: string;
    private defaultExpiration: number;

    constructor(
        @Inject(ApplicationTokens.RedisClientToken)
        public readonly client: RedisClient,
        @Inject(RedisConfigurationToken)
        private readonly redisConfiguration: RedisConfigurationOptions,

        private readonly errorHandler: ErrorHandler
    ) {
        // tslint:disable
        this.client.on('error', error => this.errorHandler.captureException(new RedisException(error)));
        this.client.on('ready', () => this.errorHandler.captureBreadcrumb({ message: 'Connected to Redis' }));
        this.client.on('reconnecting', () =>
            this.errorHandler.captureBreadcrumb({ message: 'Attempting to reconnect to Redis...' })
        );
        this.client.on('end', () =>
            this.errorHandler.captureException(new RedisException(new Error('Redis Connection Fatal')))
        );
        // tslint:enable

        this.defaultExpiration = this.redisConfiguration.expiration ?? 86400;
        this.keyPrefix = this.redisConfiguration.keyPrefix ?? '';
    }

    async getValue(key: string, ignorePrefix?: boolean) {
        const fullKey = `${ignorePrefix ? '' : this.keyPrefix}${key}`;
        try {
            const response = await this.client.connection.get(fullKey);
            if (response == null) return null;
            return JSON.parse(response);
        } catch (error) {
            throw new RedisException(error);
        }
    }

    async setValue(key: string, value: any, duration: number = this.defaultExpiration, ignorePrefix?: boolean) {
        const fullKey = `${ignorePrefix ? '' : this.keyPrefix}${key}`;

        try {
            const stringValue = JSON.stringify(value);
            if (duration > 0) {
                await this.client.connection.set(fullKey, stringValue, { EX: duration });
            } else {
                await this.client.connection.set(fullKey, stringValue);
            }
            return 'OK';
        } catch (error) {
            throw new RedisException(error);
        }
    }

    async delete(key: string | string[], ignorePrefix?: boolean) {
        if (Array.isArray(key)) {
            key = key.map(individualKey => ignorePrefix ? '' : this.keyPrefix + individualKey);
        } else {
            key = `${ignorePrefix ? '' : this.keyPrefix}${key}`;
        }
        try {
            await this.client.connection.del(key);
        } catch (error) {
            throw new RedisException(error);
        }
    }

    async getKeys(pattern: string, ignorePrefix?: boolean) {
        return new Promise<string[]>((resolve, reject) => {
            this.client.connection.keys(`${ignorePrefix ? '' : this.keyPrefix}${pattern}`, (err, keys) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(keys)
                }
            })
        })
    }
}
