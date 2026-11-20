import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
    const handler = () => undefined;

    const createGuard = (requiredPermissions?: unknown[]) => {
        const reflector = { get: vi.fn().mockReturnValue(requiredPermissions) } as unknown as Reflector;
        return { guard: new PermissionsGuard(reflector), reflector };
    };

    const createContext = (user?: unknown) =>
        ({
            getHandler: () => handler,
            switchToHttp: () => ({ getRequest: () => ({ user }) })
        }) as unknown as ExecutionContext;

    it('reads the "permissions" metadata from the handler', () => {
        const { guard, reflector } = createGuard(['read']);

        guard.canActivate(createContext({ permissions: ['read'] }));

        expect(reflector.get).toHaveBeenCalledWith('permissions', handler);
    });

    it('allows access when the handler has no required permissions', () => {
        const { guard } = createGuard(undefined);

        expect(guard.canActivate(createContext())).toBe(true);
    });

    it('allows access when the user has at least one required permission', () => {
        const { guard } = createGuard(['read', 'write']);

        expect(guard.canActivate(createContext({ permissions: ['write', 'other'] }))).toBe(true);
    });

    it('denies access when the user has none of the required permissions', () => {
        const { guard } = createGuard(['read']);

        expect(guard.canActivate(createContext({ permissions: ['write'] }))).toBe(false);
    });

    it('denies access when the user has an empty permissions list', () => {
        const { guard } = createGuard(['read']);

        expect(guard.canActivate(createContext({ permissions: [] }))).toBe(false);
    });

    it('denies access when there is no user on the request', () => {
        const { guard } = createGuard(['read']);

        expect(guard.canActivate(createContext(undefined))).toBeFalsy();
    });

    it('denies access when the user has no permissions property', () => {
        const { guard } = createGuard(['read']);

        expect(guard.canActivate(createContext({}))).toBeFalsy();
    });
});
