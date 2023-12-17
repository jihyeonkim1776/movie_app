import axios from "../api/axios";
import React, { useCallback, useContext, useEffect, useState } from "react";
import "./Row.css";
import MovieModal from "./MovieModal";
import {
  collection,
  addDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  where,
  query,
  getDocs,
  doc,
} from "firebase/firestore";
import app, { db, storage } from "../firebaseApp";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";
import { FaStar } from "react-icons/fa6";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

// import swiper style

import "swiper/css";
import "swiper/css/navigation";
import styled from "styled-components";
import AuthContext from "../Context/AuthContext";

const Row = ({ title, id, fetchUrl }) => {
  const { user } = useContext(AuthContext); // Use destructuring to get user from AuthContext
  const [movies, setMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movieSelected, setMovieSelection] = useState({});
  const [likedMovies, setLikedMovies] = useState({});
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

  const truncate = (str, n) => {
    return str?.length > n ? str.substring(0, n) + "..." : str;
  };
  const onSubmit = async ({
    id,
    backdrop_path,
    name,
    overview,
    release_date,
    first_air_date,
    vote_average,
    genres,
  }) => {
    // Check if the document already exists for the movie
    const postQuery = query(
      collection(db, "posts"),
      where("movieId", "==", id)
    );
    const postQuerySnapshot = await getDocs(postQuery);

    if (!postQuerySnapshot.empty) {
      // Document already exists, update the likes array
      const postDoc = postQuerySnapshot.docs[0];
      const postData = postDoc.data();
      const postRef = doc(db, "posts", postDoc.id);

      if (user?.uid && postData?.likes?.includes(user?.uid)) {
        // User has already liked the movie, remove like
        await updateDoc(postRef, {
          likes: arrayRemove(user?.uid),
        });
      } else {
        // User hasn't liked the movie, add like
        await updateDoc(postRef, {
          likes: arrayUnion(user?.uid),
        });
      }
    } else {
      // Document doesn't exist, create a new one

      // Check if genres is defined, provide a default value or handle accordingly
      const movieGenres = genres || [];

      addDoc(collection(db, "posts"), {
        movieId: id,
        moviePost: backdrop_path,
        movieTitle: name,
        overview: overview,
        release_date: release_date,
        first_air_date: first_air_date || null, // Provide a default value or handle accordingly
        vote_average: vote_average,
        genres: movieGenres,
        createdAt: new Date()?.toLocaleDateString("ko", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        likes: [user?.uid],
      });
    }
  };
  console.log("User ID:", user?.uid);

  // const toggleLike = async (movieId) => {
  //   // Assuming "posts" is the collection where you store movie information
  //   const postQuery = query(
  //     collection(db, "posts"),
  //     where("movieId", "==", movieId)
  //   );
  //   const postQuerySnapshot = await getDocs(postQuery);

  //   if (!postQuerySnapshot.empty) {
  //     const postDoc = postQuerySnapshot.docs[0];
  //     const postData = postDoc.data();

  //     const postRef = doc(db, "posts", postDoc.id);

  //     if (user?.uid && postData?.likes?.includes(user?.uid)) {
  //       // User has already liked the movie, remove like
  //       await updateDoc(postRef, {
  //         likes: arrayRemove(user?.uid),
  //         likeCount: postData?.likeCount ? postData?.likeCount - 1 : 0,
  //       });
  //     } else {
  //       // User hasn't liked the movie, add like
  //       await updateDoc(postRef, {
  //         likes: arrayUnion(user?.uid),
  //         likeCount: postData?.likeCount ? postData?.likeCount + 1 : 1,
  //       });
  //     }
  //   }
  // };

  return (
    <Container>
      <h2>{title}</h2>
      <Swiper
        // install Swiper modules
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        loop={true} //loop 기능을 사용할 것인지
        navigation // arrow 버튼 사용 유무
        pagination={{ clickable: true }} //페이지 버튼 보이게 할지
        breakpoints={{
          1378: {
            slidesPerView: 6, //한번에 보이는 슬라이드 개수
            slidesPerGroup: 6,
          },
          998: {
            slidesPerView: 5, //한번에 보이는 슬라이드 개수
            slidesPerGroup: 5,
          },
          625: {
            slidesPerView: 4, //한번에 보이는 슬라이드 개수
            slidesPerGroup: 4,
          },
          0: {
            slidesPerView: 3, //한번에 보이는 슬라이드 개수
            slidesPerGroup: 3,
          },
        }}
      >
        <Content id={id}>
          {movies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <Wrap>
                <img
                  key={movie.id}
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={movie.name}
                  onClick={() => handleClick(movie)}
                />
              </Wrap>

              <TextGroup>
                <Title>
                  {truncate(
                    movie.title || movie.original_title || movie.name,
                    12
                  )}
                </Title>
                <Detail>
                  <div>
                    {movie.first_air_date
                      ? new Date(movie.first_air_date).getFullYear()
                      : movie.release_date
                      ? new Date(movie.release_date).getFullYear()
                      : ""}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginRight: "10px",
                    }}
                  >
                    {user && likedMovies[movie.id] ? (
                      <AiFillHeart className="fill_heart" />
                    ) : (
                      <AiOutlineHeart
                        className="empty_heart"
                        onClick={() =>
                          onSubmit({
                            id: movie.id,
                            backdrop_path: movie.backdrop_path,
                            name:
                              movie.title || movie.original_title || movie.name,
                            overview: movie.overview,
                            release_date: movie.release_date,
                            first_air_date: movie.first_air_date,
                            vote_average: movie.vote_average,
                            genres: movie.genres,
                          })
                        }
                      />
                    )}
                    <FaStar style={{ color: "yellow" }} />
                    {movie.vote_average.toFixed(1)}
                  </div>
                </Detail>
              </TextGroup>
            </SwiperSlide>
          ))}
        </Content>
      </Swiper>
      {modalOpen && (
        <MovieModal {...movieSelected} setModalOpen={setModalOpen} />
      )}
    </Container>
  );
};

export default Row;

const Container = styled.div`
  padding: 0 0 26px;
`;

const Content = styled.div``;
const TextGroup = styled.div`
  color: white;
  padding: 1.5% 2%;
  height: 90px;
`;
const Title = styled.div`
  color: white;
  font-size: 2.7vh;
  padding: 5px 0;
`;

const Detail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 2.3vh;
`;

const Wrap = styled.div`
  width: 95%;
  height: 95%;
  padding-top: 56.25%;
  border-radius: 10px;
  box-shadow: rgb(0 0 0/69%) 0px 26px 30px -10px,
    rgb(0 0 0/73%) 0px 16px 10px -10px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;
  border: 3px solid rgba(249, 249, 249, 0.1);

  img {
    inset: 0px;
    display: block;
    height: 100%;
    object-fit: cover;
    opacity: 1;
    position: absolute;
    width: 100%;
    transition: opacity 500ms ease-in-out;
    z-index: 1;
  }
  &:hover {
    box-shadow: rgb(0 0 0 / 80%) 0px 40px 58px -16px,
      rgb(0 0 0 / 72%) 0px 30px 22px -10px;
    transform: scale(0.98);
    border-color: rgba(249, 249, 249, 0.8);
  }
`;
