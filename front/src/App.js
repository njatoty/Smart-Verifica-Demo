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
import Login from "./Components/login/login";
import AddUser from "./Components/pages/AddUser";
import PrivateRoute from "./Components/login/PrivateRoute";
import { Provider } from "react-redux";
import ForgotPassword from "./Components/login/ForgotPassword";
import ResetPassword from "./Components/login/ResetPassword";
// import {ROUTES} from "./Routes"
import store from './Components/redux/store'
import Validated from "./Components/pages/Validated";
import User from "./Components/pages/User";
import { ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import { AuthProvider } from './firebase/AuthContext';
import { memo, useEffect } from "react";
import Rejected from "./Components/pages/Rejected";
import DataSource from "./Components/pages/DataSource";
import StandarLookup from "./Components/others/lookup/Lookup";

const AppRoutes = memo(() => (
  <Routes>
      <Route path="/" key="login" element={<Login />} />
      <Route key="private-layout" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="accueil" key="home" element={<Home />} />
          <Route path="prevalidation" key="prevalidation" element={<PreValidation />} />
          <Route path="validation" key="validation" element={<Validation />} />
          {/* <Route path="returned" key="returned" element={<Retourne />} /> */}
          <Route path="validated" key="validated" element={<Validated />} />
          <Route path="rejected" key="rejected" element={<Rejected />} />
          <Route path="alldoc" key="alldoc" element={<AllDoc />} />
          <Route path="/user/add" element={<AddUser />} />
          <Route path="/user/view" element={<User />} />
          <Route path="/data-source" element={<DataSource />} />
      </Route>
      <Route path="*" key="no-page" element={<NoPage />} />
      <Route path="document/:validation/:id" key="doc" element={<PrivateRoute><Doc /></PrivateRoute>} />
      {/* <Route path="test" key="table" element={<Table />} /> */}
      {/* <Route path="info/:id" key="info" element={<InfoPage />} /> */}
      <Route path="forgotPassword" key="forgotPassword" element={<ForgotPassword />} />
      <Route path="reset-password/:token" key="resetPassword" element={<ResetPassword />} />
  </Routes>
));

export default function App() {

  return (
    <>
      <Provider store={store} >
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </>
  );
}