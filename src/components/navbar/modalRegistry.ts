/**
 * Modal Registry
 *
 * Centralized registry of all profile modals.
 * Modals are rendered dynamically by ProfileModals component.
 * Adding a new modal: just add to the registry, no component edits needed.
 */

import { LanguageModal } from '@/components/modals/language';
import { CurrencyModal } from '@/components/modals/currency';
import { CountryModal } from '@/components/modals/country';
import { ThemeModal } from '@/components/modals/theme';
import { NotificationsModal } from '@/domains/communications/components/notifications';

export const modalRegistry = {
    notifications: NotificationsModal,
    language: LanguageModal,
    currency: CurrencyModal,
    country: CountryModal,
    theme: ThemeModal,
} satisfies Record<string, React.ComponentType<{ open: boolean; onClose: () => void }>>;
