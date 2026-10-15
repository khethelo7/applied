import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type Theme =
  | 'light'
  | 'dark';

const THEME_KEY =
  'applied-theme';

const ThemeContext =
  createContext<{
    theme: Theme;
    toggle: () => void;
  } | null>(null);

function readInitialTheme():
Theme {
  try {
    return (
      localStorage.getItem(
        THEME_KEY
      ) === 'dark'
        ? 'dark'
        : 'light'
    );
  } catch {
    /*
     * If browser storage isn't available,
     * the theme feature shouldn't break the app.
     */
    return 'light';
  }
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    theme,
    setTheme,
  ] =
    useState<Theme>(
      readInitialTheme
    );

  useEffect(() => {
    document.documentElement
      .classList.toggle(
        'dark',
        theme === 'dark'
      );

    try {
      localStorage.setItem(
        THEME_KEY,
        theme
      );
    } catch {
      /*
       * Theme persistence is optional.
       *
       * If storage fails, just keep the
       * current theme for this session.
       */
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,

        toggle: () =>
          setTheme(
            current =>
              current === 'dark'
                ? 'light'
                : 'dark'
          ),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(
      ThemeContext
    );

  if (!context) {
    throw new Error(
      'ThemeProvider missing'
    );
  }

  return context;
}