import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  border: 10px solid transparent;
  border-radius: 50%;
  background-image: linear-gradient(#000, #000),
    linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
  background-origin: border-box;
  background-clip: content-box, border-box;
  z-index: 9999;
  animation: ${rotate} 1s linear infinite;
`;

export default function Loader() {
  return <LoadingSpinner />;
}
