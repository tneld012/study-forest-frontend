import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRouter from "./routes/AppRouter.jsx";

export default function App() {
  return (
    <>
      <AppRouter />

      <ToastContainer
        position="bottom-center"
        autoClose={1200}
        hideProgressBar
        closeButton={false}
      />
    </>
  );
}