import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import { ToastContainer } from "react-toastify";
function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="login" element={<Login />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
