import MdiIcon from "@mdi/react";
import {
  mdilMagnifyPlus,
  mdilMapMarker,
  mdilMenu,
  mdilClose,
  mdilMessage,
  mdilMessageText,
  mdilFlash,
  mdilStar,
  mdilCompass,
  mdilCalendar,
  mdilClock,
  mdilTicket,
  mdilShare,
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
  mdilPiggyBank,
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
  close: mdilClose,
  message: mdilMessage,
  whatsapp: mdilMessageText,
  flash: mdilFlash,
  trending: mdilFlash,
  sparkles: mdilStar,
  star: mdilStar,
  compass: mdilCompass,
  calendar: mdilCalendar,
  clock: mdilClock,
  ticket: mdilTicket,
  share: mdilShare,
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
  piggy: mdilPiggyBank,
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
