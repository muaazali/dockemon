import logoSvg from '@/assets/images/dockemon-logo-minimal.svg?raw';

type DockemonLogoProps = {
  className?: string;
  title?: string;
};

export default function DockemonLogo({ className, title = 'Dockemon' }: DockemonLogoProps) {
  return (
    <span
      aria-label={title}
      className={className}
      dangerouslySetInnerHTML={{ __html: logoSvg }}
      role="img"
    />
  );
}
