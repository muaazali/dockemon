import { memo, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleDot, CirclePause, FolderOpen, Plus, Server } from 'lucide-react';
import { SelectPrivateKeyFile } from '../../wailsjs/go/main/App';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAllHosts, selectHostSummary, selectHostsStatus } from '@/store/selectors';
import { addHost, fetchHosts } from '@/store/hostsSlice';
import { fetchContainers } from '@/store/containersSlice';
import ErrorState from '@/components/ErrorState';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { models } from '../../wailsjs/go/models';

type HostCardProps = {
  host: models.Host;
  onClick: (hostId: string) => void;
};

const HostCard = memo(function HostCard({ host, onClick }: HostCardProps) {
  const summary = useAppSelector((state) => selectHostSummary(state, host.ID));

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => onClick(host.ID)}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          <CardTitle>{host.Name || host.ID}</CardTitle>
        </div>
        <CardDescription>
          {host.ID === 'localhost' ? 'This machine' : `${host.User}@${host.Address}:${host.Port}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <CircleDot className="h-4 w-4 text-green-500" />
            <span>{summary.running} running</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CirclePause className="h-4 w-4 text-muted-foreground" />
            <span>{summary.total - summary.running} stopped</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

function AddHostForm({ onDone }: { onDone: () => void }) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    id: '',
    name: '',
    address: '',
    port: '22',
    user: '',
    privateKeyPath: '',
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await dispatch(
      addHost({
        ID: form.id,
        Name: form.name,
        Address: form.address,
        Port: Number(form.port) || 22,
        User: form.user,
        PrivateKeyPath: form.privateKeyPath,
      })
    );
    if (addHost.fulfilled.match(result)) {
      dispatch(fetchContainers(result.payload.ID));
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-auto overscroll-contain px-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="host-id">Host ID</label>
        <Input id="host-id" required value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="prod-server" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="host-name">Name</label>
        <Input id="host-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Production server" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="host-address">Address</label>
        <Input id="host-address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="192.168.1.10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="host-port">Port</label>
        <Input id="host-port" type="number" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="host-user">SSH user</label>
        <Input id="host-user" required value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} placeholder="root" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="host-key">Private key path</label>
        <div className="flex gap-2">
          <Input
            id="host-key"
            required
            value={form.privateKeyPath}
            onChange={(e) => setForm({ ...form, privateKeyPath: e.target.value })}
            placeholder="~/.ssh/id_rsa"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Browse for private key file"
            onClick={async () => {
              try {
                const path = await SelectPrivateKeyFile();
                if (path) setForm((prev) => ({ ...prev, privateKeyPath: path }));
              } catch (error) {
                console.error('Failed to open file picker', error);
              }
            }}
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <SheetFooter>
        <Button type="submit">Save host</Button>
      </SheetFooter>
    </form>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hosts = useAppSelector(selectAllHosts);
  const status = useAppSelector(selectHostsStatus);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchHosts());
  }, [dispatch]);

  const handleNavigate = (hostId: string) => navigate(`/${hostId}/`);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-6 lg:px-10 lg:pb-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-card/60 px-6 py-5 shadow-lg shadow-black/10 backdrop-blur-2xl">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight">Hosts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Select a host to inspect its containers and images.</p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button>
                <Plus className="h-4 w-4" />
                Add host
              </Button>
            }
          />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add a host</SheetTitle>
              <SheetDescription>Connect to a remote Docker host over SSH using a private key.</SheetDescription>
            </SheetHeader>
            <AddHostForm onDone={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {status === 'failed' ? (
        <div className="mt-6">
          <ErrorState onRetry={() => dispatch(fetchHosts())} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hosts.map((host) => (
            <HostCard key={host.ID} host={host} onClick={handleNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}
