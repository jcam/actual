import { useEffect, useState } from 'react';

import { send } from '@actual-app/core/platform/client/connection';
import type { ExternalSyncStatus } from '@actual-app/core/types/api-handlers';
import type { AccountEntity } from '@actual-app/core/types/models';

import { useSyncServerStatus } from './useSyncServerStatus';

const defaultStatus: ExternalSyncStatus = {
  configured: false,
  state: 'not_configured',
  message: null,
  lastSync: null,
  canSync: false,
  needsReauth: false,
};

export function useExternalSyncStatus(accountId?: AccountEntity['id']) {
  const [status, setStatus] = useState<ExternalSyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const syncServerStatus = useSyncServerStatus();

  useEffect(() => {
    async function fetch() {
      setIsLoading(true);

      try {
        const results = await send(
          'external-status',
          accountId ? { accountId } : undefined,
        );

        setStatus({
          ...defaultStatus,
          ...results,
        });
      } catch {
        setStatus({
          ...defaultStatus,
          state: 'error',
          message: 'network-failure',
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (syncServerStatus === 'online') {
      void fetch();
    } else {
      setStatus(null);
    }
  }, [accountId, syncServerStatus]);

  return {
    status,
    isLoading,
  };
}
