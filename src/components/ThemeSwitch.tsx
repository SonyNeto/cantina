import { useEffect, useState, type FC } from 'react';
import { Switch, SwitchThumb } from './commons/Switch';
import { CloudMoon, CloudSun } from 'pixelarticons/react';
import { getSavedTheme } from '../utils/functions';

export const ThemeSwitch: FC = () => {
  const [isDark, setIsDark] = useState<boolean>(getSavedTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className="inline-flex items-center gap-1">
      <CloudSun />
      <Switch onCheckedChange={setIsDark} checked={isDark}>
        <SwitchThumb />
      </Switch>
      <CloudMoon />
    </div>
  );
};
