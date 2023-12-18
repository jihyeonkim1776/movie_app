import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import app from "../firebaseApp";
import { IoClose } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";

const Nav = () => {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();
  console.log(pathname);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const [searchVisible, setSearchVisible] = useState(false);
  const auth = getAuth(app);
  const [isAuthenticated, setIsAuthenticated] = useState(!!auth?.currentUser);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setShow(true);
    } else {
      setShow(false);
    }
  };

  useEffect(() => {
    // Check if the current pathname is "/search" and the search input is not visible
    if (pathname === "/search" && !searchVisible) {
      setSearchVisible(true);
    }
  }, [pathname]);

  const toggleSearch = () => {
    // Navigate to the search page
    navigate(`/search`);

    // Toggle the search input after a short delay to ensure navigation completes
    setTimeout(() => {
      setSearchVisible(!searchVisible);
    }, 300);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    navigate(`/search?q=${newValue}`);
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

      <Menu>
        {searchVisible ? (
          <InputWrapper>
            <Input
              value={searchValue}
              onChange={handleChange}
              className="nav__input"
              type="text"
              placeholder="검색해주세요."
            />
            {
              <CloseButton
                onClick={() => {
                  setSearchValue("");
                  toggleSearch();
                }}
              />
            }
          </InputWrapper>
        ) : (
          <IoMdSearch onClick={toggleSearch} style={{ fontSize: "24px" }} />
        )}
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

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  background-color: rgba(0, 0, 0, 0.582);
  border-radius: 5px;
  color: white;
  padding: 5px;
  border: none;
  @media (max-width: 768px) {
    font-size: 0.5rem;
  }
`;

const CloseButton = styled(IoClose)`
  font-size: 24px;
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
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
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  img {
    display: block;
    width: 100%;
    @media (max-width: 768px) {
      max-width: 40px;
    }
  }
`;
