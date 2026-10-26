import { EventEmitter } from 'events';
import { Inject, Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { ApplicationTokens } from '../../application-tokens.const';
import { RedisConfigurationOptions, RedisConfigurationToken } from '../redis-configuration';

@Injectable()
export class RedisClient extends EventEmitter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: any;

    private pingRate: number;
    private maxTotalRetryTime: number;

    constructor(
        @Inject(RedisConfigurationToken)
        private readonly redisConfiguration: RedisConfigurationOptions
    ) {
        super();

        this.pingRate = 60000; // in ms
        this.maxTotalRetryTime = 10000; // in ms

        // create the initial client connection
        this.connection = this.setupClient();
        // start pinging redis
        this.pingRedis();
    }

    /**
     * 1. Create the new client
     * 2. Set the retry_strategy to destroy this connection and create a new one if
     *    can't connect for 10 seconds
     * 3. Subscribe and emit the new connection's events
     * 4. Return the client
     */
    setupClient() {
        // initial connection
        const client = createClient({
            socket: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                reconnectStrategy: (options: any) => {
                    if (options.totalRetryTime > this.maxTotalRetryTime) {
                        this.emit('error', new Error('Retry time exhausted, creating new client connection...'));

                        // cleanly end connection, then set up new client connection
                        client.quit();
                        this.connection = this.setupClient();
                        return;
                    }

                    // gradually increase time between connection attempts
                    return Math.min(options.attempt * 100, 3000);
                },
            },

            // default enable_offline_queue to false so that any requests made while client
            // is trying to reconnect are immediately sent an error, instead of waiting for
            // reconnect and holding up the response to the end user
            disableOfflineQueue: true,
            ...this.redisConfiguration
        });

        this.emitClientEvents(client);

        client.connect().catch(err => this.emit('error', err));
        return client;
    }

    /**
     * Has the instance of this class listen to and emit the client events.
     * This way the application using this RedisClient only has to subscribe to this
     * classes events, instead of resubscribing to every new connection created.
     * @param client
     */
    private emitClientEvents(client: ReturnType<typeof createClient>) {
        client.on('error', error => this.emit('error', error));
        client.on('ready', () => this.emit('ready'));
        client.on('reconnecting', () => this.emit('reconnecting'));
        client.on('end', () => this.emit('end'));
    }

    /**
     * Ping redis once every minute to keep the connection from idling
     */
    private pingRedis() {
        setInterval(() => {
            if (this.connection && this.connection.ping) {
                this.connection.ping();
            }
        }, this.pingRate);
    }
}

export const RedisProvider = {
    provide: ApplicationTokens.RedisClientToken,
    useClass: RedisClient
};
