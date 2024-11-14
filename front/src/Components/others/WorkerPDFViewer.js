import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GlobalWorkerOptions, getDocument, renderTextLayer } from 'pdfjs-dist';
import {
    BackHandOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    HighlightAltOutlined,
    NavigateBeforeOutlined,
    NavigateNextOutlined,
    MenuOpenOutlined,
} from '@mui/icons-material';
import './WorkerPDFViewer.css';
import { useCursorOption, useZoom } from '../../hooks/pdfviewer/hooks';

GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export const PDFViewer = ({ fileUrl, verticesGroups=[] }) => {
    const [pdf, setPdf] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [cursorOption, setCursorOption] = useState("selection"); // selection or handtool
    const { pdfViewerRef, scrollableRef } = useCursorOption(cursorOption);
    const [scale, setScale] = useZoom(scrollableRef, 1.5);
    const [showPagination, setShowPagination] = useState(true);

    useEffect(() => {
        if (!fileUrl) return;
        const loadPDF = async () => {
            const loadingTask = getDocument(fileUrl);
            const pdfDocument = await loadingTask.promise;
            setPdf(pdfDocument);
            setNumPages(pdfDocument.numPages);
        };
        // loading page
        setLoading(true);
        // load pdf
        loadPDF()
            .finally(() => setTimeout(() => setLoading(false), 0)); // stop loading


    }, [fileUrl]);


    useEffect(() => {
        if (!pdf) return;
        renderPage(currentPage, scale, rotation);
    }, [pdf, scale, rotation, currentPage, verticesGroups]);
    

    const renderPage = useCallback(async (currentPage, scale, rotation) => {

        const container = pdfViewerRef.current;
        container.innerHTML = ''; // Clear previous content

        const canvas = document.createElement('canvas');
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'textLayer';
        textLayerDiv.style.position = 'absolute';
        textLayerDiv.style.top = 0;
        textLayerDiv.style.left = 0;
        // textLayerDiv.style.pointerEvents = 'stroke';
        textLayerDiv.style.zIndex = 1;
        textLayerDiv.style.setProperty('--scale-factor', scale);

        const pageDiv = document.createElement('div');
        pageDiv.style.position = 'relative';
        pageDiv.appendChild(canvas);
        pageDiv.appendChild(textLayerDiv);

        container.appendChild(pageDiv);

        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale, rotation });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const context = canvas.getContext('2d');
        // Use requestAnimationFrame to ensure smooth rendering
        requestAnimationFrame(async () => {
            await page.render({
                canvasContext: context,
                viewport,
            }).promise;

            // Render the text layer for text selection
            const textContent = await page.getTextContent();
            renderTextLayer({
                textContentSource: textContent,
                container: textLayerDiv,
                viewport,
                textDir: 'ltr',
            });

            // Optionally render other graphics (e.g., vertices) if necessary
            drawVertices(context, viewport, canvas, pdfViewerRef, rotation);
        });
    }, [pdf, pdfViewerRef]);


    const drawVertices = (context, viewport, canvas, pdfViewerRef, rotationAngle = 0) => {
        verticesGroups.forEach((vertice, groupIndex) => {
            if (vertice.page === '0') {
                context.strokeStyle = `#1E90FF`;
                context.fillStyle = '#000'
                context.lineWidth = 1;

                // Save the current context state
                context.save();

                // Normalize the rotation angle to 0, 90, 180, or 270 degrees
                const normalizedAngle = (rotationAngle % 360 + 360) % 360;

                // Adjust based on rotation angle
                let adjustedX, adjustedY;

                context.beginPath();
                vertice.vertices.forEach((vertex, index) => {
                    let { x, y } = vertex;

                    // Adjust coordinates based on rotation
                    switch (normalizedAngle) {
                        case 90:
                            adjustedX = (1 - y) * viewport.width;
                            adjustedY = x * viewport.height;
                            break;
                        case 180:
                            adjustedX = (1 - x) * viewport.width;
                            adjustedY = (1 - y) * viewport.height;
                            break;
                        case 270:
                            adjustedX = y * viewport.width;
                            adjustedY = (1 - x) * viewport.height;
                            break;
                        default: // 0 degrees
                            adjustedX = x * viewport.width;
                            adjustedY = y * viewport.height;
                            break;
                    }

                    if (index === 0) {
                        context.moveTo(adjustedX, adjustedY);
                    } else {
                        context.lineTo(adjustedX, adjustedY);
                    }
                });
                context.closePath();
                context.stroke();

                // Restore the context to its original state
                context.restore();
            }
        });
    };

    const renderAllPages = async (scale, rotation) => {
        const container = pdfViewerRef.current;
        container.innerHTML = ''; // Clear previous content

        for (let num = 1; num <= numPages; num++) {
            const canvas = document.createElement('canvas');
            const textLayerDiv = document.createElement('div');
            textLayerDiv.className = 'textLayer';
            textLayerDiv.style.position = 'absolute';
            textLayerDiv.style.top = 0;
            textLayerDiv.style.left = 0;
            textLayerDiv.style.zIndex = 1;
            textLayerDiv.style.setProperty('--scale-factor', scale);

            const pageDiv = document.createElement('div');
            pageDiv.style.position = 'relative';
            pageDiv.appendChild(canvas);
            pageDiv.appendChild(textLayerDiv);

            container.appendChild(pageDiv);

            const page = await pdf.getPage(num);
            const viewport = page.getViewport({ scale, rotation });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const context = canvas.getContext('2d');

            // Render PDF page on canvas
            await page.render({
                canvasContext: context,
                viewport,
            }).promise;

            // Render text layer for text selection
            const textContent = await page.getTextContent();
            renderTextLayer({
                textContentSource: textContent,
                container: textLayerDiv,
                viewport,
                textDir: 'ltr',
            });
        }
    };



    const zoomIn = () => {
        setScale((prevScale) => prevScale * 1.2);
    };

    const zoomOut = () => {
        setScale((prevScale) => prevScale / 1.2);
    };

    const rotateLeft = () => {
        setRotation((prevRotation) => (prevRotation - 90) % 360);
    };

    const rotateRight = () => {
        setRotation((prevRotation) => (prevRotation + 90) % 360);
    };


    // Handle next page
    const nextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, numPages));
    };

    // Handle previous page
    const prevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    return (
        <div className="flex flex-col bg-slate-200 h-full">
            <div className="top-bar flex justify-between items-center p-2 bg-white shadow-lg z-50 relative">
                <div className="controls">
                    <button className={`${cursorOption === 'handtool' ? 'active' : ''}`} onClick={() => setCursorOption('handtool')}>
                        <BackHandOutlined />
                    </button>
                    <button className={`${cursorOption === 'selection' ? 'active' : ''}`} onClick={() => setCursorOption('selection')}>
                        <HighlightAltOutlined />
                    </button>
                    <button onClick={zoomIn}>
                        <ZoomInOutlined />
                    </button>
                    <button onClick={zoomOut}>
                        <ZoomOutOutlined />
                    </button>
                    <button onClick={rotateLeft}>
                        <RotateLeftOutlined />
                    </button>
                    <button onClick={rotateRight}>
                        <RotateRightOutlined />
                    </button>
                </div>
                <div className='controls'>
                        <button onClick={() => setShowPagination(!showPagination)}>
                            <MenuOpenOutlined style={{ transform: !showPagination ? 'rotate(-180deg)' : 'rotate(0deg)'}}/>
                        </button>
                </div>
            </div>
            <div className='panel'>
                <div className="viewer-container">

                    <div className="viewer" ref={scrollableRef}>
                        <div className="pdf-content" style={{ display: loading ? 'none' : 'flex' }}>
                            <div ref={pdfViewerRef} className="pdf-container" />
                        </div>
                        {
                            loading &&
                            <div className="loading-image">
                                <LoadingSpinner />
                            </div>
                        }
                    </div>
                    
                    <div className="pagination-control-floating">
                        <div className='controls'>
                            <button onClick={zoomIn}>
                                <ZoomInOutlined />
                            </button>
                        </div>
                        <div className='controls'>
                            <button onClick={prevPage} disabled={currentPage <= 1}>
                                <NavigateBeforeOutlined />
                            </button>
                            <span>{currentPage}</span>
                            <button onClick={nextPage} disabled={currentPage >= numPages}>
                                <NavigateNextOutlined />
                            </button>
                        </div>
                        <div className='controls'>
                            <button onClick={zoomOut}>
                                <ZoomOutOutlined />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`pagination ${showPagination ? 'show' : 'hidden'}`} >
                    <div className="pages">
                        {
                            Array.from({ length: numPages }, (_, i) => i + 1).map((num) => (
                                <PageItem
                                    pdf={pdf}
                                    pageNum={num}
                                    key={num}
                                    className={`${num === currentPage ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(num)}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

function PageItem({ pdf, pageNum = 1, className = "", onClick }) {

    const ref = useRef(null);

    useEffect(() => {

        if (pdf) {
            const renderPage = async () => {
                const container = ref.current;
                container.innerHTML = ''; // Clear previous content

                const canvas = document.createElement('canvas');
                container.appendChild(canvas);

                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 0.17 });

                canvas.height = 120;
                canvas.width = 100;

                const context = canvas.getContext('2d');

                // Render PDF page on canvas
                await page.render({
                    canvasContext: context,
                    viewport,
                }).promise;
            }
            renderPage();
        }

    }, [pdf, pageNum]);


    return (
        <div className={`page-item ${className}`} onClick={() => onClick && onClick()}>
            <div ref={ref} className='canvas-container' />
            <span className='pageNumber'>{pageNum}</span>
        </div>
    )


}

const LoadingSpinner = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
            width="150"
            height="150"
            style={{
                shapeRendering: 'auto',
                display: 'block',
                background: 'transparent',
            }}
        >
            <g>
                <g transform="translate(80,50)">
                    <g transform="rotate(0)">
                        <circle fillOpacity="1" fill="#e5e5e5" r="6" cy="0" cx="0">
                            <animateTransform
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                values="1.5 1.5;1 1"
                                begin="-0.875s"
                                type="scale"
                                attributeName="transform"
                            />
                            <animate
                                begin="-0.875s"
                                values="1;0"
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                attributeName="fill-opacity"
                            />
                        </circle>
                    </g>
                </g>
                <g transform="translate(71.213,71.213)">
                    <g transform="rotate(45)">
                        <circle fillOpacity="0.875" fill="#e5e5e5" r="6" cy="0" cx="0">
                            <animateTransform
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                values="1.5 1.5;1 1"
                                begin="-0.75s"
                                type="scale"
                                attributeName="transform"
                            />
                            <animate
                                begin="-0.75s"
                                values="1;0"
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                attributeName="fill-opacity"
                            />
                        </circle>
                    </g>
                </g>
                <g transform="translate(50,80)">
                    <g transform="rotate(90)">
                        <circle fillOpacity="0.75" fill="#e5e5e5" r="6" cy="0" cx="0">
                            <animateTransform
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                values="1.5 1.5;1 1"
                                begin="-0.625s"
                                type="scale"
                                attributeName="transform"
                            />
                            <animate
                                begin="-0.625s"
                                values="1;0"
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                attributeName="fill-opacity"
                            />
                        </circle>
                    </g>
                </g>
                <g transform="translate(28.786,71.213)">
                    <g transform="rotate(135)">
                        <circle fillOpacity="0.625" fill="#e5e5e5" r="6" cy="0" cx="0">
                            <animateTransform
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                values="1.5 1.5;1 1"
                                begin="-0.5s"
                                type="scale"
                                attributeName="transform"
                            />
                            <animate
                                begin="-0.5s"
                                values="1;0"
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                attributeName="fill-opacity"
                            />
                        </circle>
                    </g>
                </g>
                <g transform="translate(20,50)">
                    <g transform="rotate(180)">
                        <circle fillOpacity="0.5" fill="#e5e5e5" r="6" cy="0" cx="0">
                            <animateTransform
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                values="1.5 1.5;1 1"
                                begin="-0.375s"
                                type="scale"
                                attributeName="transform"
                            />
                            <animate
                                begin="-0.375s"
                                values="1;0"
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                attributeName="fill-opacity"
                            />
                        </circle>
                    </g>
                </g>
                <g transform="translate(28.786,28.786)">
                    <g transform="rotate(225)">
                        <circle fillOpacity="0.375" fill="#e5e5e5" r="6" cy="0" cx="0">
                            <animateTransform
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                values="1.5 1.5;1 1"
                                begin="-0.25s"
                                type="scale"
                                attributeName="transform"
                            />
                            <animate
                                begin="-0.25s"
                                values="1;0"
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                attributeName="fill-opacity"
                            />
                        </circle>
                    </g>
                </g>
                <g transform="translate(50,20)">
                    <g transform="rotate(270)">
                        <circle fillOpacity="0.25" fill="#e5e5e5" r="6" cy="0" cx="0">
                            <animateTransform
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                values="1.5 1.5;1 1"
                                begin="-0.125s"
                                type="scale"
                                attributeName="transform"
                            />
                            <animate
                                begin="-0.125s"
                                values="1;0"
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                attributeName="fill-opacity"
                            />
                        </circle>
                    </g>
                </g>
                <g transform="translate(71.213,28.786)">
                    <g transform="rotate(315)">
                        <circle fillOpacity="0.125" fill="#e5e5e5" r="6" cy="0" cx="0">
                            <animateTransform
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                values="1.5 1.5;1 1"
                                begin="0s"
                                type="scale"
                                attributeName="transform"
                            />
                            <animate
                                begin="0s"
                                values="1;0"
                                repeatCount="indefinite"
                                dur="1s"
                                keyTimes="0;1"
                                attributeName="fill-opacity"
                            />
                        </circle>
                    </g>
                </g>
            </g>
        </svg>
    )
};


export default PDFViewer;
