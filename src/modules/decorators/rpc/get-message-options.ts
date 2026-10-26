import { HiveMessageOptions, RPC_OPTIONS_KEY } from './hive-message.decorator';

export function getMessageOptions(target: object): HiveMessageOptions {
    return Reflect.getMetadata(RPC_OPTIONS_KEY, target) ?? {};
}
