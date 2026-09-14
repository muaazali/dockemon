import { Sun, Moon, Monitor } from 'lucide-react';
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
      <SidebarMenuButton
        className="ml-auto size-8 w-8 justify-center p-0"
        render={<DropdownMenuTrigger aria-label={`Theme: ${activeOption.label}`} title={activeOption.label} />}
      >
        <ActiveIcon className="h-4 w-4" />
      </SidebarMenuButton>
      <DropdownMenuContent align="end" side="top" className="flex w-auto min-w-0 gap-1 p-1.5">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              aria-label={option.label}
              title={option.label}
              className={`size-8 justify-center p-0 ${theme === option.value ? 'bg-accent text-accent-foreground' : ''}`}
              onClick={() => setTheme(option.value)}
            >
              <Icon className="size-4" />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
