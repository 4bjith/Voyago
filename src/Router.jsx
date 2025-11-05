import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";

function Router() {
  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home/>}/>
        </Routes>

        
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
      </BrowserRouter>
    </>
  );
}

export default Router;
