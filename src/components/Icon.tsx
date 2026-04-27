import MdiIcon from "@mdi/react";
import {
  mdilMagnifyPlus,
  mdilMapMarker,
  mdilMenu,
  mdilCancel,
  mdilMessage,
  mdilMessageText,
  mdilFlash,
  mdilStar,
  mdilCalendar,
  mdilClock,
  mdilTag,
  mdilShield,
  mdilCheck,
  mdilArrowLeft,
  mdilArrowRight,
  mdilPlus,
  mdilMinus,
  mdilCreditCard,
  mdilBank,
  mdilSitemap,
  mdilMusic,
  mdilChevronDown,
  mdilClipboardCheck,
  mdilArrangeSendBackward,
  mdilMicrophone,
  mdilTrophy,
  mdilCart,
  mdilBriefcase,
  mdilFlag,
  mdilGift,
  mdilCurrencyUsd,
} from "@mdi/light-js";
import { cn } from "@/lib/utils";

/**
 * MDI Light icon set (https://pictogrammers.com/library/mdil/).
 * Single wrapper so usage stays terse and consistently sized/coloured.
 *
 * Some lucide icons we previously used don't exist in mdi-light. We map them
 * to the closest pictogram available.
 */
const map = {
  search: mdilMagnifyPlus,
  "map-pin": mdilMapMarker,
  menu: mdilMenu,
  close: mdilCancel,
  message: mdilMessage,
  whatsapp: mdilMessageText,
  flash: mdilFlash,
  trending: mdilFlash,
  sparkles: mdilStar,
  star: mdilStar,
  compass: mdilStar,
  calendar: mdilCalendar,
  clock: mdilClock,
  ticket: mdilTag,
  share: mdilArrangeSendBackward,
  shield: mdilShield,
  "shield-check": mdilShield,
  check: mdilCheck,
  "arrow-left": mdilArrowLeft,
  "arrow-right": mdilArrowRight,
  plus: mdilPlus,
  minus: mdilMinus,
  card: mdilCreditCard,
  bank: mdilBank,
  network: mdilSitemap,
  music: mdilMusic,
  chevron: mdilChevronDown,
  clipboard: mdilClipboardCheck,
  piggy: mdilClipboardCheck,
} as const;

export type IconName = keyof typeof map;

type Props = {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
};

export const Icon = ({ name, className, size, ...rest }: Props) => {
  const path = map[name];
  return (
    <MdiIcon
      path={path as unknown as string}
      size={size ? size / 24 : 1}
      className={cn("inline-block shrink-0", className)}
      {...rest}
    />
  );
};
