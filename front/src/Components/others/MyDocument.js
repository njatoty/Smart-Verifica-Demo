import React, { useRef, useEffect, useState } from 'react';
import WebViewer from '@pdftron/pdfjs-express-viewer';


function addHighlightWithBorder(result, Core, Annotations) {
    const { pageNum, quads } = result;

    const annotationManager = Core.annotationManager;

    // Create a highlight annotation
    const highlightAnnotation = new Annotations.TextHighlightAnnotation();
    highlightAnnotation.PageNumber = pageNum;
    highlightAnnotation.Quads = quads;

    // Set the background highlight color (light blue in this case)
    highlightAnnotation.FillColor = new Annotations.Color(0, 0, 255, 0.2); // Light blue fill

    // Simulate a red border by using StrokeColor and increasing the stroke thickness
    highlightAnnotation.StrokeColor = new Annotations.Color(255, 0, 0); // Red border color
    highlightAnnotation.StrokeThickness = 2; // Thickness for the "border"

    // Add the annotation to the document
    annotationManager.addAnnotation(highlightAnnotation);
    annotationManager.redrawAnnotation(highlightAnnotation);
}

const MyDocument = React.memo(({ fileUrl, searchText }) => {
    const viewer = useRef(null);
    const webViewerInstance = useRef(null);  // Ref to store the WebViewer instance

    const licenseKey = 'zrdUB8ao0L3PgYK8cyxL' // process.env.PDF_VIEWER_LICENCE_KEY;

    // if using a class, equivalent of componentDidMount
    useEffect(() => {
        console.log('PDF Viewer Licence Key:', licenseKey)

            WebViewer(
                {
                    path: '/webviewer/lib',
                    initialDoc: fileUrl,
                    licenseKey: licenseKey ?? 'VMeLR5MsW5lX3X9YfqQF',
                },
                viewer.current,
            ).then((instance) => {

                webViewerInstance.current = instance;

                // now you can access APIs through the WebViewer instance
                const { Core, UI } = instance;

                // adding an event listener for when a document is loaded
                Core.documentViewer.addEventListener('documentLoaded', () => {
                    console.log('document loaded');

                    // Core.documentViewer.setSearchHighlightColors({
                    //     searchResult: new Annotations.Color(0, 0, 255, 0.5),
                    //     activeSearchResult: 'rgba(0, 255, 0, 0.5)'
                    // });

                });

                // adding an event listener for when the page number has changed
                Core.documentViewer.addEventListener('pageNumberUpdated', (pageNumber) => {
                    console.log(`Page number is: ${pageNumber}`);
                });

                // disable printing, downloading
                instance.UI.disableFeatures([UI.Feature.Print, UI.Feature.Download])

                // Set dark mode as the default theme
                // UI.setTheme('dark');

                // adds a button to the header that on click sets the page to the next page
                UI.setHeaderItems(header => {

                    // Add custom buttons for rotating
                    header.push({
                        type: 'actionButton',
                        img: "icon-header-page-manipulation-page-rotation-counterclockwise-line",  // You can provide a custom icon
                        title: 'Rotate Left',
                        onClick: () => {
                            UI.rotateCounterClockwise();
                        },
                    });

                    header.push({
                        type: 'actionButton',
                        img: "icon-header-page-manipulation-page-rotation-clockwise-line",  // You can provide a custom icon
                        title: 'Rotate Right',
                        onClick: () => {
                            UI.rotateClockwise();;  // Rotate clockwise
                        },
                    });

                });
            }).catch((err) => console.log("Error:", err));

        return () => {
            if (webViewerInstance.current) {
                try {
                    webViewerInstance.current.dispose();  // Clean up the WebViewer instance
                    webViewerInstance.current = null;
                } catch (error) {
                    console.log(error)
                }
            }
        };

    }, [fileUrl]);

    // change url
    // useEffect(() => {
    //     if (fileUrl && webViewerInstance.current) {
    //         webViewerInstance.current.UI.loadDocument(fileUrl);
    //     }
    // }, [fileUrl, webViewerInstance.current]);

    useEffect(() => {
        // search text here
        if (searchText && webViewerInstance.current) {
            
            // now you can access APIs through the WebViewer instance
            const { Core, UI, Annotations } = webViewerInstance.current;
            
            // Call the search function here
            UI.searchTextFull(searchText, {
                regex: true,
                onResult: (result) => {
                    if (result.resultCode === 'found') {
                        console.log('Text found on page:', result.pageNum);

                        // Apply custom highlight with border
                        addHighlightWithBorder(result, Core, Annotations);
                    }
                }
            });

            // After starting the search, immediately hide the search panel
            UI.closeElements(['searchPanel']);
        }
    }, [searchText]);
    

    return (
        <div className="webviewer" ref={viewer} />
    );
});

export default MyDocument;
