import { Trans, useTranslation } from 'react-i18next';

import { Paragraph } from '@actual-app/components/paragraph';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { ExternalSyncStatus } from '@actual-app/core/types/api-handlers';

type ExternalProviderProps = {
  hasLinkedAccounts: boolean;
  isLoading: boolean;
  status: ExternalSyncStatus | null;
};

function getStatusMessage(
  translate: (key: string) => string,
  status: ExternalSyncStatus | null,
) {
  switch (status?.message) {
    case 'network-failure':
      return translate(
        'Unable to access the sync server. Make sure the configured server URL is accessible.',
      );
    case 'unauthorized':
      return translate('You are not logged in.');
    default:
      return status?.message ?? null;
  }
}

function getStatusLabel(
  translate: (key: string) => string,
  status: ExternalSyncStatus | null,
  isLoading: boolean,
  hasLinkedAccounts: boolean,
) {
  if (isLoading) {
    return translate('Checking status…');
  }

  if (!status) {
    return hasLinkedAccounts
      ? translate('Linked externally')
      : translate('Not configured');
  }

  switch (status.state) {
    case 'ok':
      return status.configured
        ? translate('Configured')
        : translate('Not configured');
    case 'syncing':
      return translate('Syncing');
    case 'reauth_required':
      return translate('Needs attention');
    case 'error':
      return translate('Unavailable');
    case 'not_configured':
    default:
      return translate('Not configured');
  }
}

export function ExternalProvider({
  hasLinkedAccounts,
  isLoading,
  status,
}: ExternalProviderProps) {
  const { t } = useTranslation();
  const statusLabel = getStatusLabel(t, status, isLoading, hasLinkedAccounts);
  const statusMessage = getStatusMessage(t, status);

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>
          <Trans>External Sync</Trans>
        </Text>
        <Paragraph style={{ fontSize: 15, color: theme.pageTextSubdued }}>
          <Trans>
            Accounts linked with an external sync source are managed outside
            Actual and can be synced from their account rows.
          </Trans>
        </Paragraph>
      </View>

      <View
        style={{
          border: `1px solid ${theme.tableBorder}`,
          borderRadius: 8,
          padding: 16,
          backgroundColor: theme.tableBackground,
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: 600 }}>
          <Trans>External provider</Trans>
        </Text>
        <Text
          style={{
            color:
              status?.state === 'error'
                ? theme.errorText
                : hasLinkedAccounts || status?.configured
                  ? theme.noticeTextDark
                  : theme.pageTextSubdued,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {statusLabel}
        </Text>
        {statusMessage && (
          <Paragraph style={{ fontSize: 14, color: theme.pageTextSubdued }}>
            {statusMessage}
          </Paragraph>
        )}
      </View>
    </View>
  );
}
