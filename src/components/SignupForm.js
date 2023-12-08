import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "./SignupForm.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../firebaseApp";
import { toast } from "react-toastify";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth(app);
      await createUserWithEmailAndPassword(auth, email, password);

      toast.success("회원가입에 성공했습니다.");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error?.code);
    }
  };

  const onChange = (e) => {
    const {
      target: { name, value },
    } = e;

    if (name === "email") {
      setEmail(value);
      const validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

      if (!value?.match(validRegex)) {
        setError("이메일 형식이 올바르지 않습니다.");
      } else {
        setError("");
      }
    }

    if (name === "password") {
      setPassword(value);

      if (value?.length < 8) {
        setError("비밀번호는 8자리 이상으로 입력해주세요");
      } else if (passwordConfirm?.length > 0 && value !== passwordConfirm) {
        setError("비밀번호와 비밀번호 확인 값이 다릅니다. 다시 확인해주세요.");
      } else {
        setError("");
      }
    }

    if (name === "password_confirm") {
      setPasswordConfirm(value);

      if (value?.length < 8) {
        setError("비밀번호는 8자리 이상으로 입력해주세요");
      } else if (value !== password) {
        setError("비밀번호와 비밀번호 확인 값이 다릅니다. 다시 확인해주세요.");
      } else {
        setError("");
      }
    }
  };
  return (
    <>
      <form onSubmit={onSubmit} className="form">
        <h2>Create Your Account</h2>
        <div className="form__block">
          <label htmlFor="email"></label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="email"
            required
            onChange={onChange}
          />
        </div>
        <div className="form__block">
          <label htmlFor="password"></label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="password"
            required
            onChange={onChange}
          />
        </div>
        <div className="form__block">
          <label htmlFor="password_confirm"></label>
          <input
            type="password"
            name="password_confirm"
            id="password_confirm"
            placeholder="password"
            required
            onChange={onChange}
          />
        </div>
        {error && error?.length > 0 && (
          <div className="form__block">
            <div className="form__error">{error}</div>
          </div>
        )}
        <div className="form__block text">
          Not a member yet?
          <Link to="/" className="form__link">
            Resister Now
          </Link>
        </div>
        <div className="form__block button">
          <input
            type="submit"
            value="Sign up"
            className="form__btn--submit"
            disabled={error?.length > 0}
          />
        </div>
      </form>
    </>
  );
};

export default SignupForm;
