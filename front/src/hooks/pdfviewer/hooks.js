import { useRef, useEffect, useCallback, useState } from 'react';

export const useCursorOption = (mode = 'handtool') => {
    const scrollableRef = useRef(null);
    const pdfViewerRef = useRef(null);
    const isMouseDown = useRef(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const scrollLeft = useRef(0);
    const scrollTop = useRef(0);

    const onMouseDown = useCallback((e) => {
        if (!scrollableRef.current && !pdfViewerRef.current) return;
        // Add the 'grabbing' class to indicate dragging
        pdfViewerRef.current.classList.add('grabbing');
        pdfViewerRef.current.classList.remove('grab');

        isMouseDown.current = true;

        // Disable text selection while dragging
        // pdfViewerRef.current.classList.add('pointer-handtool');

        // Record the initial mouse position and scroll positions
        startX.current = e.pageX - scrollableRef.current.offsetLeft;
        startY.current = e.pageY - scrollableRef.current.offsetTop;
        scrollLeft.current = scrollableRef.current.scrollLeft;
        scrollTop.current = scrollableRef.current.scrollTop;
    }, []);

    const onMouseLeaveOrUp = useCallback(() => {
        if (!scrollableRef.current && !pdfViewerRef.current) return;

        isMouseDown.current = false;
        // Switch back to the grab cursor when mouse is released
        pdfViewerRef.current.classList.remove('grabbing');
        pdfViewerRef.current.classList.add('grab');
    
        // Re-enable text selection
        pdfViewerRef.current.classList.remove('pointer-handtool');
    }, []);

    const onMouseMove = useCallback((e) => {
        if (!isMouseDown.current || !scrollableRef.current) return;
        e.preventDefault();

        // Calculate the distance moved
        const x = e.pageX - scrollableRef.current.offsetLeft;
        const y = e.pageY - scrollableRef.current.offsetTop;

        // Calculate the new scroll positions
        const walkX = (x - startX.current) * 2; // The multiplier can control the scroll speed
        const walkY = (y - startY.current) * 2;

        scrollableRef.current.scrollLeft = scrollLeft.current - walkX;
        scrollableRef.current.scrollTop = scrollTop.current - walkY;
    }, []);
    useEffect(() => {
        const scrollableDiv = scrollableRef.current;
        const pdfViewerDiv = pdfViewerRef.current;
        if (!scrollableDiv || !pdfViewerDiv) return;
    
        // Toggle classes based on mode
        if (mode === 'handtool') {
            pdfViewerDiv.classList.add('pointer-handtool');
            pdfViewerDiv.classList.remove('pointer-selection');
            scrollableDiv.addEventListener('mousedown', onMouseDown);
            scrollableDiv.addEventListener('mouseleave', onMouseLeaveOrUp);
            scrollableDiv.addEventListener('mouseup', onMouseLeaveOrUp);
            scrollableDiv.addEventListener('mousemove', onMouseMove);
        } else if (mode === 'selection') {
            pdfViewerDiv.classList.add('pointer-selection');
            pdfViewerDiv.classList.remove('pointer-handtool');
            scrollableDiv.removeEventListener('mousedown', onMouseDown);
            scrollableDiv.removeEventListener('mouseleave', onMouseLeaveOrUp);
            scrollableDiv.removeEventListener('mouseup', onMouseLeaveOrUp);
            scrollableDiv.removeEventListener('mousemove', onMouseMove);
        }
    
        // Cleanup listeners when component unmounts or mode changes
        return () => {
            pdfViewerDiv.classList.remove('grabbing', 'grab', 'pointer-handtool', 'pointer-selection');
            scrollableDiv.removeEventListener('mousedown', onMouseDown);
            scrollableDiv.removeEventListener('mouseleave', onMouseLeaveOrUp);
            scrollableDiv.removeEventListener('mouseup', onMouseLeaveOrUp);
        };
    }, [mode, onMouseDown, onMouseLeaveOrUp, onMouseMove]);
    

    return { scrollableRef, pdfViewerRef };
};


export const useZoom = (containerRef, initialZoom = 1, minZoom = 0.5, maxZoom = 3) => {
    const [zoom, setZoom] = useState(initialZoom);

    useEffect(() => {
        const handleWheel = (event) => {
            if (event.ctrlKey && containerRef.current?.contains(event.target)) {
                event.preventDefault();

                // Calculate the zoom factor based on the mouse wheel delta
                const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
                const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom * zoomFactor));

                // Get the mouse position relative to the container
                const container = containerRef.current;
                const rect = container.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Adjust scroll position to zoom towards the mouse pointer
                const scrollLeft = container.scrollLeft;
                const scrollTop = container.scrollTop;
                const newScrollLeft = mouseX + (scrollLeft - mouseX) * (newZoom / zoom);
                const newScrollTop = mouseY + (scrollTop - mouseY) * (newZoom / zoom);

                // Apply zoom and scroll adjustments
                setZoom(newZoom);
                container.scrollLeft = newScrollLeft;
                container.scrollTop = newScrollTop;
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false});
        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [zoom, containerRef, minZoom, maxZoom]);

    return [zoom, setZoom];
};
