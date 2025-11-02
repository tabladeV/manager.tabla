import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

const Portal = ({ children }: PortalProps) => {
  const [container, setContainer] = useState<Element | null>(null);

  useEffect(() => {
    const portalRoot = document.getElementById('main-root-layout');
    setContainer(portalRoot);

    return () => {
      setContainer(null);
    };
  }, []);

  return container ? createPortal(children, container) : null;
};

export default Portal;