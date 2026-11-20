import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PassportWhitelistedErrors } from '../enums';
import { UnauthorizedException } from '../exceptions';
import { PassportAuthGuard } from './passport-auth.guard';

describe('PassportAuthGuard', () => {
    const GuardClass = PassportAuthGuard('test-strategy');
    let guard: InstanceType<typeof GuardClass>;
    let handleErrors: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        guard = new GuardClass();
        handleErrors = vi.spyOn(guard, 'handleErrors').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('handleRequest', () => {
        it('returns the user when authentication succeeds', () => {
            const user = { id: 1 };

            expect(guard.handleRequest(null, user, undefined)).toBe(user);
            expect(handleErrors).not.toHaveBeenCalled();
        });

        it('throws UnauthorizedException when there is no user', () => {
            expect(() => guard.handleRequest(null, false, undefined)).toThrow(UnauthorizedException);
        });

        it('reports a non-whitelisted error and throws UnauthorizedException', () => {
            const error = new Error('database exploded');

            expect(() => guard.handleRequest(error, null, undefined)).toThrow(UnauthorizedException);
            expect(handleErrors).toHaveBeenCalledWith(error);
        });

        it('does not report a whitelisted error', () => {
            const error = new Error(PassportWhitelistedErrors.JwtExpired);

            expect(() => guard.handleRequest(error, null, undefined)).toThrow(UnauthorizedException);
            expect(handleErrors).not.toHaveBeenCalled();
        });

        it('does not report an UnauthorizedException', () => {
            expect(() => guard.handleRequest(new UnauthorizedException(), null, undefined)).toThrow(
                UnauthorizedException
            );
            expect(handleErrors).not.toHaveBeenCalled();
        });

        it('falls back to the passport error when no error is provided', () => {
            const passportError = new Error('strategy failure');

            expect(() => guard.handleRequest(null, null, passportError)).toThrow(UnauthorizedException);
            expect(handleErrors).toHaveBeenCalledWith(passportError);
        });

        it('does not report a whitelisted passport error', () => {
            const passportError = new Error(PassportWhitelistedErrors.NoAuthToken);

            expect(() => guard.handleRequest(null, null, passportError)).toThrow(UnauthorizedException);
            expect(handleErrors).not.toHaveBeenCalled();
        });

        it('reports a generic error when no error or passport error is available', () => {
            expect(() => guard.handleRequest(null, null, undefined)).toThrow(UnauthorizedException);
            expect(handleErrors).toHaveBeenCalledTimes(1);
            expect(handleErrors.mock.calls[0][0]).toMatchObject({ message: 'Passport Error' });
        });
    });

    describe('isWhitelisted', () => {
        it.each(Object.values(PassportWhitelistedErrors))('whitelists "%s" by default', (message) => {
            expect(guard.isWhitelisted(new Error(`prefix: ${message}`))).toBe(true);
        });

        it('returns false for an unknown message', () => {
            expect(guard.isWhitelisted(new Error('something else'))).toBe(false);
        });

        it('returns false when the error has no string message', () => {
            expect(guard.isWhitelisted({} as Error)).toBe(false);
            expect(guard.isWhitelisted()).toBe(false);
        });
    });

    describe('whitelist management', () => {
        it('addToWhitelist makes new messages whitelisted', () => {
            guard.addToWhitelist(['custom failure']);

            expect(guard.isWhitelisted(new Error('custom failure occurred'))).toBe(true);
        });

        it('removeFromWhitelist stops whitelisting a default message', () => {
            guard.removeFromWhitelist([PassportWhitelistedErrors.JwtExpired]);

            expect(guard.isWhitelisted(new Error(PassportWhitelistedErrors.JwtExpired))).toBe(false);
        });

        it('keeps whitelists independent between instances', () => {
            guard.addToWhitelist(['only here']);

            expect(new GuardClass().isWhitelisted(new Error('only here'))).toBe(false);
        });
    });

    describe('handleErrors', () => {
        it('warns and logs the error by default', () => {
            const plain = new GuardClass();
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
            const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const error = new Error('boom');

            plain.handleErrors(error);

            expect(warn).toHaveBeenCalled();
            expect(err).toHaveBeenCalledWith(error);
        });
    });
});
