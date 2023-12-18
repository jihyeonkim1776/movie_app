//import AuthContext from "context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { getAuth, signOut } from "firebase/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import AuthContext from "../Context/AuthContext";
import app, { db, storage } from "../firebaseApp";
import "./Profile.css";
import { FaRegImage } from "react-icons/fa6";
import { TiDeleteOutline } from "react-icons/ti";
import {
  ref,
  uploadString,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import axios from "../api/axios";
import MovieModal from "./MovieModal";
import { updateProfile } from "firebase/auth";
const Profile = ({ title, id, fetchUrl }) => {
  const { user } = useContext(AuthContext);
  const [imageUrl, setImageUrl] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [movies, setMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movieSelected, setMovieSelection] = useState({});
  // const PROFILE_DEFAULT_URL =
  //   "https://images.unsplash.com/photo-1612538498456-e861df91d4d0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const STORAGE_DOWNLOAD_URL_STR = "https://firebasestorage.googleapis.com";

  const fetchMovieData = useCallback(async () => {
    const response = await axios.get(fetchUrl);
    // console.log('response', response);
    setMovies(response.data.results);
    console.log("response:", response);
  }, [fetchUrl]);

  useEffect(() => {
    fetchMovieData();
  }, [fetchMovieData]);

  const handleClick = (movie) => {
    setModalOpen(true);
    setMovieSelection(movie);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Check if there is a new image URL
    if (imageUrl) {
      // Display a confirmation dialog
      const isConfirmed = window.confirm("Do you want to change the photo?");

      // If the user confirms, proceed with the photo change
      if (isConfirmed) {
        let key = `${user?.uid}/${uuidv4()}`;
        const storageRef = ref(storage, key);
        let newImageUrl = null;

        try {
          // Delete the previous user image if it exists
          if (
            user?.photoURL &&
            user?.photoURL?.includes(STORAGE_DOWNLOAD_URL_STR)
          ) {
            const imageRef = ref(storage, user?.photoURL);
            if (imageRef) {
              await deleteObject(imageRef).catch((error) => {
                console.log(error);
              });
            }
          }

          // Upload the new image
          const data = await uploadString(storageRef, imageUrl, "data_url");
          newImageUrl = await getDownloadURL(data?.ref);

          // Update the user profile with the new photo URL
          if (user) {
            await updateProfile(user, {
              photoURL: newImageUrl || "",
            });

            toast.success("프로필이 업데이트 되었습니다.");
          }
        } catch (e) {
          console.log(e);
        }
      }
    } else {
      // Handle the case where no new image is selected
      toast.warning("이미지를 선택하세요.");
    }
  };

  const handleFileUpload = (e) => {
    const {
      target: { files },
    } = e;

    const file = files?.[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onloadend = (e) => {
      const { result } = e?.currentTarget;
      setImageUrl(result);
    };
  };
  const handleDeleteImage = () => {
    setImageUrl(null);
  };

  useEffect(() => {
    if (user?.photoURL) {
      setImageUrl(user?.photoURL);
    }
  }, [user?.photoURL]);
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
      <form className="post-form" onSubmit={onSubmit}>
        <div className="profile__box">
          <div
            className="profile__photo"
            onClick={() => document.getElementById("file-input").click()}
          >
            <img src={imageUrl} alt="" />
            {user?.profilePhoto && (
              <img
                src={user?.photoURL || ""}
                alt="profile"
                className="profile__image"
              />
            )}
          </div>
          <label htmlFor="file-input" className="post-form__file">
            <FaRegImage className="post-form__file-icon" />

            <TiDeleteOutline
              className="post-form__delete-icon"
              onClick={handleDeleteImage}
            />
          </label>
          <input
            type="file"
            name="file-input"
            id="file-input"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <input
            type="submit"
            className="post-form__submit-btn"
            value="이미지수정"
          />
          <div className="flex__box-lg">
            <div className="profile__email">{user?.email}</div>
            <div className="profile__name">{user?.displayName || "사용자"}</div>
          </div>
        </div>
      </form>
      <div className="flex__box-like">
        <div className="movie__like">
          {myPosts.map((post) => (
            <img
              key={post.id}
              src={`https://image.tmdb.org/t/p/original${post.moviePost}`}
              alt={post.movieTitle}
              className="liked-movie-poster"
              onClick={() => handleClick(post)}
            />
          ))}
          {modalOpen && (
            <MovieModal {...movieSelected} setModalOpen={setModalOpen} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
