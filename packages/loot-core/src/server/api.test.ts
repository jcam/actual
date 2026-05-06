import { getBankSyncError } from '#shared/errors';
import type { ServerHandlers } from '#types/server-handlers';

import { installAPI } from './api';
vi.mock('#shared/errors', () => ({
  getBankSyncError: vi.fn(error => `Bank sync error: ${error}`),
}));

describe('API handlers', () => {
  const handlers = installAPI({} as unknown as ServerHandlers);

  describe('api/bank-sync', () => {
    it('should sync a single account when accountId is provided', async () => {
      handlers['accounts-bank-sync'] = vi
        .fn()
        .mockResolvedValue({ errors: [] });

      await handlers['api/bank-sync']({ accountId: 'account1' });
      expect(handlers['accounts-bank-sync']).toHaveBeenCalledWith({
        ids: ['account1'],
      });
    });

    it('should handle errors in non batch sync', async () => {
      handlers['accounts-bank-sync'] = vi.fn().mockResolvedValue({
        errors: ['connection-failed'],
      });

      await expect(
        handlers['api/bank-sync']({ accountId: 'account2' }),
      ).rejects.toThrow('Bank sync error: connection-failed');

      expect(getBankSyncError).toHaveBeenCalledWith('connection-failed');
    });
  });

  describe('external sync APIs', () => {
    it('should proxy external sync status requests', async () => {
      handlers['external-status'] = vi.fn().mockResolvedValue({
        configured: true,
        state: 'ok',
        message: null,
        lastSync: null,
        canSync: true,
        needsReauth: false,
      });

      await expect(
        handlers['api/external-sync-status']({ accountId: 'account1' }),
      ).resolves.toEqual({
        configured: true,
        state: 'ok',
        message: null,
        lastSync: null,
        canSync: true,
        needsReauth: false,
      });

      expect(handlers['external-status']).toHaveBeenCalledWith({
        accountId: 'account1',
      });
    });

    it('should proxy external sync requests', async () => {
      handlers['external-sync'] = vi.fn().mockResolvedValue({
        errors: [],
        newTransactions: ['txn-1'],
        matchedTransactions: [],
        updatedAccounts: ['account1'],
      });

      await expect(
        handlers['api/external-sync']({ accountId: 'account1' }),
      ).resolves.toEqual({
        errors: [],
        newTransactions: ['txn-1'],
        matchedTransactions: [],
        updatedAccounts: ['account1'],
      });

      expect(handlers['external-sync']).toHaveBeenCalledWith({
        accountId: 'account1',
      });
    });
  });
});
