import React from "react";
import styled from "styled-components";
import Profile from "../../components/ProfilePage";

const ProfilePage = () => {
  return (
    <Container>
      <Profile />
    </Container>
  );
};

export default ProfilePage;

const Container = styled.main`
  overflow: hidden;
  display: block;
  top: 72px;
  padding: 0 calc(3.5vw + 5px);
`;
