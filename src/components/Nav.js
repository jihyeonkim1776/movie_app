import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import app from "../firebaseApp";

const Nav = () => {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();
  console.log(pathname);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const auth = getAuth(app);
  const [isAuthenticated, setIsAuthenticated] = useState(!!auth?.currentUser);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // console.log("useLocation.search:", useLocation().search);

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setShow(true);
    } else {
      setShow(false);
    }
  };

  const handleChange = (e) => {
    setSearchValue(e.target.value);
    navigate(`/search?q=${e.target.value}`);
  };
  const onSignOut = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      navigate("/");
      toast.success("로그아웃 되었습니다.");
    } catch (error) {
      console.log(error);
      toast.error(error?.code);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  return (
    <NavWrapper $show={show}>
      <Logo>
        <img
          src="/images/logo.png"
          alt="logo"
          onClick={() => (window.location.href = "/")}
          style={{ cursor: "pointer" }}
        />
      </Logo>
      <Input
        value={searchValue}
        onChange={handleChange}
        className="nav__input"
        type="text"
        placeholder="검색해주세요."
      />
      <Menu>
        {isAuthenticated ? (
          <>
            <Link to="/" className="log out" onClick={onSignOut}>
              Log Out
            </Link>
            <Link to="/profile" className="profile">
              Profile
            </Link>
          </>
        ) : (
          <Link to="/login" className="login">
            Login
          </Link>
        )}
      </Menu>
    </NavWrapper>
  );
};

export default Nav;

const Input = styled.input`
  position: fixed;
  left: 50%;

  transform: translate(-50%, 0);
  background-color: rgba(0, 0, 0, 0.582);
  border-radius: 5px;
  color: white;
  padding: 5px;
  border: none;
  top: 20px;
`;

const NavWrapper = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 85px;
  background-color: ${($show) => ($show ? "#090b13" : "transparent")};
  display: flex;
  justify-content: space-between;
  padding: 0 5vw;
  z-index: 3;
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2vh;
  letter-spacing: 0.3vh;
  gap: 2vh;
`;

const Logo = styled.a`
  padding: 0;
  width: 70px;
  margin-top: 4px;
  max-height: 70px;
  font-size: 0;
  display: inline-block;

  img {
    display: block;
    width: 100%;
  }
`;
