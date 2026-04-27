import { createContext, useContext } from "react";

/** Drives the global header's transparency/dark-on-image mode.
 *  Pages mount a `<HeroSentinel />` at the bottom of any full-bleed hero;
 *  RootLayout observes it and flips `transparent` accordingly. */
export type ChromeState = {
  transparent: boolean;
  setTransparent: (v: boolean) => void;
};

export const ChromeContext = createContext<ChromeState>({
  transparent: false,
  setTransparent: () => {},
});

export const useChrome = () => useContext(ChromeContext);
