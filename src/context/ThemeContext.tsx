import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// ThemeContext reads the state of Light or Dark mode toggle from the ThemeToggle component
// it then uses useEffect to toggle the theme of the current theme
// classList.toggle() is the built in class of every element in the page, and bassically adds or removes "dark" in the classList
// in turn then reading from the css to make the theme either dark or NOT dark

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children:ReactNode }){
    const [theme, setTheme] = useState<Theme>( () => localStorage.getItem('applied-theme') === 'dark' ? 'dark' : 'light');

    useEffect( () => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('applied-theme',theme);
    }, [theme]);

    return <ThemeContext.Provider value={{ theme,toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>{children}</ThemeContext.Provider>;
}

export function useTheme(){
    const context = useContext(ThemeContext);

    if (!context) throw new Error('ThemeProvider missing');

    return context;
}