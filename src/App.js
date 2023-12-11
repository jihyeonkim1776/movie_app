import styled from "styled-components";
import request from "./api/request";
import "./App.css";
import Banner from "./components/Banner";
import Nav from "./components/Nav";
import Row from "./components/Row";
import MainPage from "./pages/MainPage";
import SearchPage from "./pages/SearchPage";
import DetailPage from "./pages/DetailPage";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import { useEffect, useState } from "react";
import ProfilePage from "./pages/ProfilePage";
import app, { db } from "./firebaseApp";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./components/Loader";

const Layout = () => {
  return (
    <div>
      <Nav />

      <Outlet />
    </div>
  );
};

function App() {
  console.log(db);
  const auth = getAuth(app);
  const [isAuthenticated, setIsAuthenticated] = useState(!!auth?.currentUser);
  const [init, setInit] = useState(false);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setInit(true);
    });
  }, [auth]);
  return (
    <div className="app">
      <ToastContainer />
      {init ? (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path=":movieId" element={<DetailPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="signup" element={<SignupForm />} />
            <Route path="login" element={<LoginForm />} />
          </Route>
        </Routes>
      ) : (
        <Loader />
      )}
    </div>
  );
}

export default App;
