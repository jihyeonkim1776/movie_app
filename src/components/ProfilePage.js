// import AuthContext from "context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import AuthContext from "../Context/AuthContext";
import app, { db, storage } from "../firebaseApp";
import "./Profile.css";
import { FaRegImage } from "react-icons/fa6";
import { TiDeleteOutline } from "react-icons/ti";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [imageFile, setImageFile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);

  const handleFileUpload = (e) => {
    const {
      target: { files },
    } = e;

    const file = files?.[0];
    const fileReader = new FileReader();
    fileReader?.readAsDataURL(file);

    fileReader.onloadend = (e) => {
      const { result } = e?.currentTarget;
      setImageFile(result);
    };
  };

  const handleDeleteImage = () => {
    setImageFile(null);
  };

  useEffect(() => {
    if (user) {
      let postsRef = collection(db, "posts");
      const myPostQuery = query(
        postsRef,
        where("likes", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );

      const fetchData = async () => {
        const datas = await getDocs(myPostQuery);
        const fetchedPosts = datas?.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMyPosts(fetchedPosts);
      };

      fetchData();

      // Unsubscribe from the snapshot listener when the component unmounts
      return () => {
        // Your cleanup code goes here, if needed
      };
    }
  }, [user]);
  console.log("myPosts:", myPosts);

  return (
    <div>
      <div className="profile__box">
        <div className="profile__photo">
          {imageFile && <img src={imageFile} alt="attachment" />}
        </div>
        <label htmlFor="file-input" className="post-form__file">
          <FaRegImage className="post-form__file-icon" />
          {imageFile && (
            <TiDeleteOutline
              className="post-form__delete-icon"
              onClick={handleDeleteImage}
            />
          )}
        </label>
        <input
          type="file"
          name="file-input"
          id="file-input"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <div className="flex__box-lg">
          <div className="profile__email">{user?.email}</div>
          <div className="profile__name">{user?.displayName || "사용자"}</div>
        </div>
      </div>

      <div className="flex__box-like">
        <div className="movie__like">
          {myPosts.map((post) => (
            <img
              key={post.id}
              src={`https://image.tmdb.org/t/p/original${post.moviePost}`}
              alt={post.movieTitle}
              className="liked-movie-poster"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
