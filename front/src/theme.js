import { createTheme } from "@mui/material";

export const theme = createTheme({
    typography: {
        fontFamily: `'Hanken Grotesk', sans-serif`, // Use the desired font
    },
    // You can also override specific typography variants
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: `'Hanken Grotesk', sans-serif`,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: `'Hanken Grotesk', sans-serif`,
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                toolbarContainer: {
                    color: 'red', // Custom text color for the toolbar
                },
            },
        },
        // Add more component-specific overrides if needed
    },
});