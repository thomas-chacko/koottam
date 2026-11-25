import Lenis from 'lenis';
import { useEffect } from 'react';

export function useLocalLenis(ref: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        if (!ref.current) return;

        // We assume ref points to the wrapper container, 
        // and its first child is the scrollable height content.
        const wrapper = ref.current;

        const lenis = new Lenis({
            wrapper: wrapper,
            content: wrapper.firstElementChild as HTMLElement,
            lerp: 0.1,
            duration: 1.2,
            smoothWheel: true,
            gestureOrientation: 'vertical',
            orientation: 'vertical',
        });

        let rafId: number;

        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, [ref]);
}
