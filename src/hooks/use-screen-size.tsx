import { useEffect, useState } from 'react';

interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useScreenSize(): ScreenSize {
  const getSize = (): ScreenSize => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    const height = typeof window !== 'undefined' ? window.innerHeight : 0;

    return {
      width,
      height,
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024,
    };
  };

  const [screenSize, setScreenSize] = useState<ScreenSize>(getSize);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getSize());
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial update

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
}
