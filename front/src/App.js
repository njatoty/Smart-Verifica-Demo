import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Components/pages/Layout";
import Home from "./Components/pages/Home";
import Doc from "./Components/pages/Doc";
import NoPage from "./Components/pages/NoPage";
import "./App.css"
import PreValidation from "./Components/pages/Prevalidation";
import Validation from "./Components/pages/Validation";
import AllDoc from "./Components/pages/AllDocument";
import './i18n'
import Table from "./Components/test/table";
import InfoPage from "./Components/test/InfoPage";
import Login from "./Components/login/login";
import AddUser from "./Components/pages/AddUser";
import PrivateRoute from "./Components/login/PrivateRoute";
import { Provider } from "react-redux";
import ForgotPassword from "./Components/login/ForgotPassword";
import ResetPassword from "./Components/login/ResetPassword";
// import {ROUTES} from "./Routes"
import store from './Components/redux/store'
import Validated from "./Components/pages/Validated";
import { createTheme, ThemeProvider } from '@mui/material';
import User from "./Components/pages/User";
import useAxiosInterceptors from "./Components/login/useAxiosInterceptors";

export default function App() {

  //Deconnecter si token est expiré

  // Step 1: Define your custom theme with the new font
  const theme = createTheme({
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
  return (
    <Provider store={store} >
      <ThemeProvider theme={theme}>
          <BrowserRouter>
          {/* {useAxiosInterceptors()} */}
            <Routes>
              <Route path="/" key="login" index element={<Login />} />
    
              {/* Private routes */}
              <Route path="/" key="private-layout" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="accueil" key="home" element={<Home />} />
                <Route path="prevalidation" key="prevalidation" element={<PreValidation />} />
                <Route path="validation" key="validation" element={<Validation />} />
                {/* <Route path="returned" key="returned" element={<Retourne />} /> */}
                <Route path="validated" key="validated" element={<Validated />} />
                <Route path="alldoc" key="alldoc" element={<AllDoc />} />
                <Route path="/user/add" element={<AddUser/>} />
                <Route path="/user/view" element={<User/>} />
              </Route>
    
              <Route path="*" key="no-page" element={<NoPage />} />
              <Route path="document/:validation/:id" key="doc" element={<PrivateRoute><Doc /></PrivateRoute>} />
              <Route path="test" key="table" element={<PrivateRoute><Table /></PrivateRoute>} />
              <Route path="info/:id" key="info" element={<PrivateRoute><InfoPage /></PrivateRoute>} />
              <Route path="forgotPassword" key="forgotPassword" element={<ForgotPassword />} />
              <Route path="reset-password/:token" key="resetPassword" element={<ResetPassword />} />
            </Routes>
          </BrowserRouter>
      </ThemeProvider>
    </Provider>
  
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);