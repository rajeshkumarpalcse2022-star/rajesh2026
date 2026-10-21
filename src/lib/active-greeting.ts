import { BIJOYA_HEADING, DEFAULT_GREETING } from "@/lib/greeting-config";
import type {
  ActiveGreeting,
  GreetingConfig,
  Personalization,
} from "@/types/bijoya";

/**
 * Single source of truth for what the greeting card renders.
 *
 * - Not customized → the centralized default greeting.
 * - Customized → the saved message/name/photos, and nothing else.
 */
export function selectActiveGreeting(
  config: GreetingConfig,
  personal: Personalization,
): ActiveGreeting {
  const isCustomized = Boolean(personal.isCustomized);
  const message = isCustomized
    ? personal.message.trim()
    : DEFAULT_GREETING.message;

  return {
    heading: BIJOYA_HEADING,
    message: message.length > 0 ? message : DEFAULT_GREETING.message,
    sender: personal.sender.trim() || config.sender || DEFAULT_GREETING.sender,
    photos: personal.photos ?? [],
    isCustomized,
  };
}
