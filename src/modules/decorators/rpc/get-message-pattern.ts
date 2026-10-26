import { RPC_PATTERN_KEY } from './hive-message.decorator';

export function getMessagePattern(target: object) {
    return Reflect.getMetadata(RPC_PATTERN_KEY, target);
}
