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
    CheckBox,
    CheckBoxOutlineBlank,
    WarningOutlined,
} from '@mui/icons-material';
import './WorkerPDFViewer.css';
import { useCursorOption, useZoom } from './hooks';
import { getPdfBlob, isPointInPolygon } from '../../../utils/utils';
import { t } from 'i18next';

GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export const PDFViewer = ({ fileUrl, verticesGroups=[], showPaginationControlOnPage=false, verticesArray=[] }) => {
    const [pdf, setPdf] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeTool, setActiveTool] = useState("selection"); // selection or handtool
    const { pdfViewerRef, scrollableRef } = useCursorOption(activeTool);
    const [scale, setScale] = useZoom(scrollableRef, 1.5);
    const [showPagination, setShowPagination] = useState(true);
    const [showPaginationControl, setShowPaginationControl] = useState(showPaginationControlOnPage);
    const defaultErrorValue = {
        open: false,
        message: ''
    }
    const [showError, setShowError] = useState(defaultErrorValue);
    const [vertices, setVertices] = useState(verticesArray);

    const handleKeyDown = (e) => {
        if (e.ctrlKey) {
            if (e.key === "h" || e.key === "H") {
                setActiveTool("handtool");
                e.preventDefault();
            }
            if (e.key === "s" || e.key === "S") {
                setActiveTool("selection");
                e.preventDefault();
            }
        }
    };

    // update vertices
    useEffect(() => {
        setVertices(verticesArray)
    }, [verticesArray]);


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown, { passive: false });
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    
    const loadPDF = useCallback(async () => {
        if (!fileUrl) return;
        try {
            const blob = await getPdfBlob(fileUrl);
            // Convert Blob to ArrayBuffer
            const arrayBuffer = await blob.arrayBuffer();
            const loadingTask = getDocument({ data: arrayBuffer });
            const pdfDocument = await loadingTask.promise;
            setPdf(pdfDocument);
            setNumPages(pdfDocument.numPages);
        } catch(err) {
            console.log(err)
            setShowError({
                open: true,
                message: 'Cannot load pdf file!'
            });
        }
    }, [fileUrl]);

    useEffect(() => {
        
        // loading page
        setLoading(true);
        // load pdf
        loadPDF()
            .finally(() => setTimeout(() => setLoading(false), 0)); // stop loading

    }, [loadPDF]);

    const refreshPDF = () => {
        // clear error
        setShowError(defaultErrorValue);
        // loading page
        setLoading(true);
        // load pdf
        loadPDF()
            .finally(() => setTimeout(() => setLoading(false), 0)); 
    }

    // Method to when mouse is moving on the canvas for vertices
    function handleOverlayMouseMove(event) {
        
        // Draw rect on canvas
        if (vertices.length > 0) {
            const container = pdfViewerRef.current;
            const overlayCanvas = container?.querySelector('canvas:nth-of-type(2)'); // Get the overlay canvas
            if (overlayCanvas) {
                const rect = overlayCanvas.getBoundingClientRect();

                let normalizedRotation = (rotation % 360 + 360) % 360;

                // Get mouse position relative to the container
                const rawMouseX = event.clientX - rect.left;
                const rawMouseY = event.clientY - rect.top;
        
                let mouseX = rawMouseX;
                let mouseY = rawMouseY;

                // Normalize to container dimensions
                let normalizedX = mouseX / rect.width;
                let normalizedY = mouseY / rect.height;

                switch (normalizedRotation) {
                    case 90:
                        normalizedX = mouseY / rect.height;
                        normalizedY = (rect.width - mouseX) / rect.width;
                        break;
                    case 180:
                        normalizedX = (rect.width - mouseX) / rect.width;
                        normalizedY = (rect.height - mouseY) / rect.height;
                        break;
                    case 270:
                        normalizedX = (rect.height - mouseY) / rect.height;
                        normalizedY = mouseX / rect.width;
                        break;
                    default: // 0 degrees
                        normalizedX = mouseX / rect.width;
                        normalizedY = mouseY / rect.height;
                        break;
                }

                const point = { x: normalizedX, y: normalizedY }
                
                const verticesToShow = vertices.filter(v => isPointInPolygon(point, v.vertices || []));
                // Only draw if we found vertices
                if (verticesToShow.length > 0) {
                    const context = overlayCanvas.getContext('2d');
                    drawVertices(
                        context, {
                            width: overlayCanvas.width,
                            height: overlayCanvas.height,
                            scale: overlayCanvas.scale ?? 1
                        },
                        verticesToShow,
                        rotation,
                        false,
                        verticesToShow[0]?.key,
                        currentPage
                    );
                }
            }
        }
    }

    const renderPage = async (currentPage, scale, rotation, vertices = []) => {
        const container = pdfViewerRef.current;
    
        // Clear the container
        if (container) container.innerHTML = '';
    
        // Create main canvas for PDF rendering
        const canvas = document.createElement('canvas');
        const overlayCanvas = document.createElement('canvas'); // Overlay canvas for drawing vertices
        const textLayerDiv = document.createElement('div');
    
        textLayerDiv.className = 'textLayer';
        textLayerDiv.style.position = 'absolute';
        textLayerDiv.style.top = 0;
        textLayerDiv.style.left = 0;
        textLayerDiv.style.zIndex = 2;
        textLayerDiv.style.setProperty('--scale-factor', scale);
    
        const pageDiv = document.createElement('div');
        pageDiv.style.position = 'relative';
        pageDiv.appendChild(canvas);
        pageDiv.appendChild(overlayCanvas); // Add overlay canvas
        pageDiv.appendChild(textLayerDiv);
        container.appendChild(pageDiv);
    
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale, rotation });
    
        // Set dimensions for both canvases
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        overlayCanvas.width = viewport.width;
        overlayCanvas.height = viewport.height;
        overlayCanvas.style.position = 'absolute';
        overlayCanvas.style.top = 0;
        overlayCanvas.style.left = 0;
        overlayCanvas.style.zIndex = 1; // Make sure it is above the main canvas
        // event listener for mouse moving
        textLayerDiv.addEventListener('mousemove', function(e) {
            handleOverlayMouseMove(e, overlayCanvas.getBoundingClientRect());
        });
    
        // Render the PDF page
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;
    
        // Render the text layer
        const textContent = await page.getTextContent();
        renderTextLayer({ textContentSource: textContent, container: textLayerDiv, viewport });
    
        // Draw initial vertices on the overlay canvas
        // drawVertices(overlayCanvas.getContext('2d'), viewport, vertices, rotation);
    };

    // UseEffect to render PDF page initially
    useEffect(() => {
        if (!pdf) return;
        renderPage(currentPage, scale, rotation, verticesGroups);
    }, [pdf, scale, rotation, currentPage]);


    // Function to update only the vertices without re-rendering the page
    const updateVertices = (vertices, scrollToView=true, page=1) => {
        const container = pdfViewerRef.current;
        const overlayCanvas = container?.querySelector('canvas:nth-of-type(2)'); // Get the overlay canvas
        if (overlayCanvas) {
            const context = overlayCanvas.getContext('2d');
            drawVertices(context, {
                width: overlayCanvas.width,
                height: overlayCanvas.height,
                scale: overlayCanvas.scale ?? 1
            }, vertices, rotation, scrollToView, '', page);
        }
    };

    // UseEffect to update vertices without re-rendering PDF
    useEffect(() => {
        let page = (verticesGroups.length > 0) ? parseInt(verticesGroups[0].page) + 1 : 1;
        setCurrentPage(page);
        console.log('To Draw', verticesGroups, 'on page:', page)
        // deboucing
        setTimeout(() => {
            updateVertices(verticesGroups, true, page);
        }, 10);
    }, [verticesGroups]);
    

    const drawVertices = (context, viewport, vertices, rotationAngle = 0, scrollToView=true, text='', page) => {

        // Clear the entire canvas before drawing
        context.clearRect(0, 0, viewport.width, viewport.height);
        
        vertices.forEach((vertice) => {
            if ((vertice.page === 'all')  || parseInt(vertice.page) === page-1) {
                context.strokeStyle = `rgba(0, 0, 255, 0.8)`;
                context.lineWidth = 1;
                // Save the current context state
                context.save();

                // Normalize the rotation angle to 0, 90, 180, or 270 degrees
                const normalizedAngle = (rotationAngle % 360 + 360) % 360;

                // Adjust based on rotation angle
                let adjustedX, adjustedY;

                context.beginPath();

                let firstVertex; // To store the first vertex for positioning text

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
                        firstVertex = { x: adjustedX, y: adjustedY }; // Save the first vertex
                        context.moveTo(adjustedX, adjustedY);
                    } else {
                        context.lineTo(adjustedX, adjustedY);
                    }

                    if (vertices.length === 1 && scrollToView) {
                        scrollToVertex(adjustedX, adjustedY, scale, scrollableRef.current)
                    }
                });
                context.closePath();
                
                context.fillStyle = 'rgba(0, 0, 255, 0.2)';
                context.fill();
                
                context.stroke();


                // Add text above the rectangle (if provided)
                if (text && firstVertex) {
                    context.fillStyle = 'rgba(0, 0, 255, 0.8)'; // Text color
                    context.font = 'bold 14px "Hanken Grotesk"'; // Font style
                    // Calculate the text width to determine the background size
                    const textWidth = context.measureText(text).width;
                    const textHeight = 16; // Approximation of text height for a 14px font size
                    
                    // Set background color
                    context.fillStyle = 'rgba(0, 0, 255)'; // Background color (yellow with transparency)
                    context.fillRect(firstVertex.x - textWidth / 2 - 4, firstVertex.y - textHeight - 10, textWidth + 8, textHeight); // Background rectangle
                    
                    // Set text color and draw text
                    context.fillStyle = 'white'; // Text color
                    context.fillText(text, firstVertex.x - (textWidth / 2), firstVertex.y - 15);
                }


                // Restore the context to its original state
                context.restore();
            }
        });
    };

    const scrollToVertex = (x, y, scale, container, margin=50) => {
        if (!container) return;
    
        // Adjust the scroll position considering the scale and margin
        const scrollX = x - margin;
        const scrollY = y - margin;

        // Ensure the scroll position doesn't go below zero
        const adjustedX = Math.max(scrollX, 0);
        const adjustedY = Math.max(scrollY, 0);
    
        // Scroll the container to the calculated position
        container.scrollTo({
            left: adjustedX,
            top: adjustedY,
            behavior: 'smooth',
        });
    };

    const MAX_SCALE = 5; // Maximum zoom level (500%)
    const MIN_SCALE = 0.5; // Minimum zoom level (50%)
    
    const zoomIn = () => {
        setScale((prevScale) => Math.min(prevScale * 1.2, MAX_SCALE));
    };
    
    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale / 1.2, MIN_SCALE));
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
        <div className="flex flex-col h-full bg-slate-200">
            <div className="relative z-50 flex items-center justify-between p-2 bg-white shadow-lg top-bar">
                <div className="controls">
                    <button title={t('title-hand-tool')} className={`${activeTool === 'handtool' ? 'active' : ''}`} onClick={() => setActiveTool('handtool')}>
                        <BackHandOutlined />
                    </button>
                    <button title={t('title-selection')} className={`${activeTool === 'selection' ? 'active' : ''}`} onClick={() => setActiveTool('selection')}>
                        <HighlightAltOutlined />
                    </button>
                    <button title={t('title-zoomout')} onClick={zoomOut}>
                        <ZoomOutOutlined />
                    </button>
                    <button title={t('title-zoomin')} onClick={zoomIn}>
                        <ZoomInOutlined />
                    </button>
                    <button title={t('title-rotate-left')} onClick={rotateLeft}>
                        <RotateLeftOutlined />
                    </button>
                    <button title={t('title-rotate-right')} onClick={rotateRight}>
                        <RotateRightOutlined />
                    </button>
                </div>
                <div className='controls'>
                    <button onClick={() => setShowPaginationControl(!showPaginationControl)} className='flex items-center gap-2 text-sm'>
                        {
                            showPaginationControl ?
                            <CheckBox />
                            :
                            <CheckBoxOutlineBlank />
                        }
                        <span>{t('show-pagination-control')}</span>
                    </button>
                    <button title={t('title-pagination')} onClick={() => setShowPagination(!showPagination)}>
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
                        {
                            showError.open &&
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl bg-white rounded-md p-10 flex flex-col items-center ">
                                <WarningOutlined color='warning' fontSize='large' className='my-1' />
                                <h1 className='text-slate-800 text-sm my-2'>{showError.message}</h1>
                                <button className='px-2 py-1 rounded text-white bg-blue-optimum hover:bg-darkblue-optimum'
                                    onClick={refreshPDF}
                                >
                                    Reload
                                </button>
                            </div>
                        }
                    </div>
                    {
                        showPaginationControl &&
                        <div className="pagination-control-floating">
                            <div className='controls'>
                                <button onClick={zoomOut}>
                                    <ZoomOutOutlined />
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
                                <button onClick={zoomIn}>
                                    <ZoomInOutlined />
                                </button>
                            </div>
                        </div>
                    }
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