import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useAxiosInterceptors = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response } = error;

        if (response && response.status === 401) {
          localStorage.removeItem("token");
          navigate("/"); // Rediriger vers la page de connexion
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);
};

export default useAxiosInterceptors;
