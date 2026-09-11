import { Sun, Moon, Monitor, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { useTheme } from '@/components/ThemeProvider';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const activeOption = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[2];
  const ActiveIcon = activeOption.icon;

  return (
    <DropdownMenu>
      <SidebarMenuButton render={<DropdownMenuTrigger />}>
        <ActiveIcon className="h-4 w-4" />
        <span>{activeOption.label}</span>
      </SidebarMenuButton>
      <DropdownMenuContent align="start" side="top">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
              <Icon className="h-4 w-4" />
              <span>{option.label}</span>
              {theme === option.value && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
