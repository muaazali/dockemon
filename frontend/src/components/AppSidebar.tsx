import { useNavigate } from 'react-router-dom';
import { Container, Gauge, Settings2, Server, Sparkles } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import DockemonLogo from '@/components/DockemonLogo';

export default function AppSidebar() {
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="none" className="border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <div className="mb-7 flex items-center gap-3 px-2 pt-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <DockemonLogo className="size-7" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">Dockemon</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">Control center</p>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">Workspace</p>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/')}>
                  <Gauge className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/localhost/containers')}>
                  <Container className="h-4 w-4" />
                  <span>Containers</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/localhost/images')}>
                  <Server className="h-4 w-4" />
                  <span>Images</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Sparkles className="h-4 w-4" />
                  <span>Activity</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings2 className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex justify-end rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2">
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
