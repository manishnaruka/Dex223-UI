import { createContext, ReactNode, useContext } from "react";

import { ThemeColors } from "@/config/theme/colors";

const DEFAULT_COLOR_SCHEME = ThemeColors.GREEN;

const ColorSchemeContext = createContext<ThemeColors | undefined>(undefined);

/**
 * Hook to resolve color scheme from props, context, or fallback default.
 */
export function useColorScheme(provided?: ThemeColors): ThemeColors {
  const context = useContext(ColorSchemeContext);
  return provided ?? context ?? DEFAULT_COLOR_SCHEME;
}

/**
 * Provider for local override of theme color scheme.
 */
export function ColorSchemeProvider({
  value,
  children,
}: {
  value: ThemeColors;
  children: ReactNode;
}) {
  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>;
}
