import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from './components/ui/sidebar';
import { TooltipProvider } from './components/ui/tooltip';
import AppSidebar from './components/AppSidebar';
import TitleBar from './components/TitleBar';
import HomePage from './pages/HomePage';
import HostPage from './pages/HostPage';
import HostImagesPage from './pages/HostImagesPage';
import ImageDetailPage from './pages/ImageDetailPage';
import ContainersPage from './pages/ContainersPage';
import ContainerDetailPage from './pages/ContainerDetailPage';

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex h-full w-full flex-col overflow-hidden">
            <TitleBar />
            <div className="flex min-h-0 flex-1 gap-0.5 overflow-hidden p-1.5">
              <AppSidebar />
              <main className="min-h-0 flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/:hostId/" element={<HostPage />} />
                  <Route path="/:hostId/images" element={<HostImagesPage />} />
                  <Route path="/:hostId/images/:imageId" element={<ImageDetailPage />} />
                  <Route path="/:hostId/containers" element={<ContainersPage />} />
                  <Route path="/:hostId/containers/:containerId" element={<ContainerDetailPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
