import { useApp } from '../../context/AppContext';

export function ThemeToggle({ id }: { id?: string }) {
  const { toggleTheme } = useApp();
  return (
    <div className="theme-toggle" id={id} onClick={toggleTheme}>
      <div className="theme-knob" />
    </div>
  );
}
