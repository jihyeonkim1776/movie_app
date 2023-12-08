// import AuthContext from "context/AuthContext";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import app from "../firebaseApp";
import "./Profile.css";

const onSignOut = async () => {
  try {
    const auth = getAuth(app);
    await signOut(auth);
    toast.success("로그아웃 되었습니다.");
  } catch (error) {
    console.log(error);
    toast.error(error?.code);
  }
};

export default function Profile() {
  const auth = getAuth(app);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  return (
    <div className="profile__box">
      <div className="flex__box-lg">
        <div className="profile__email">{currentUser?.email}</div>
        <div className="profile__name">
          {currentUser?.displayName || "사용자"}
        </div>
      </div>
      <div role="presentation" className="profile__logout" onClick={onSignOut}>
        로그아웃
      </div>
    </div>
  );
}
