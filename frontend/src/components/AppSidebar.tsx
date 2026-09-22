import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Gauge, Server, Sparkles } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import DockemonLogo from '@/components/DockemonLogo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAllHosts } from '@/store/selectors';
import { fetchHosts } from '@/store/hostsSlice';

export default function AppSidebar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hostId } = useParams<{ hostId: string }>();
  const hosts = useAppSelector(selectAllHosts);

  useEffect(() => {
    dispatch(fetchHosts());
  }, [dispatch]);

  return (
    <Sidebar
      collapsible="none"
      className="h-auto rounded-xl border border-sidebar-border shadow-xl shadow-black/20"
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="mb-7 flex items-center gap-3 px-2 pt-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <DockemonLogo className="size-7" />
            </div>
            <p className="text-base font-semibold tracking-tight text-sidebar-foreground">Dockemon</p>
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
                <SidebarMenuButton onClick={() => navigate(`/${hostId ?? 'localhost'}/images`)}>
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">Hosts</p>
              {hosts.map((host) => (
                <SidebarMenuItem key={host.ID}>
                  <SidebarMenuButton isActive={hostId === host.ID} onClick={() => navigate(`/${host.ID}/`)}>
                    <Server className="h-4 w-4" />
                    <span>{host.Name || host.ID}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
