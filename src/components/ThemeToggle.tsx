import { useTheme } from '../context/ThemeContext';

// reads the current status of the theme from ThemContext

export function ThemeToggle(){

    const { theme, toggle } = useTheme();

    return (
        <button type="button" onClick={toggle} aria-label="Toggle colour theme">
            { theme === 'dark' ? 'Light' : 'Dark'} mode
        </button>
    )
}