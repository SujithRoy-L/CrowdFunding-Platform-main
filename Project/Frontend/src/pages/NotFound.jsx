import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Container, Flex } from "../components/ui";

const Wrapper = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fbf9f6;
  background-image: radial-gradient(#d3d0c9 1px, transparent 1px);
  background-size: 24px 24px;
`;

const Content = styled.div`
  text-align: center;
  max-width: 480px;
  padding: 3rem;
  background: #ffffff;
  border: 1px solid #e3e0d8;
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.015);
`;

const Code = styled.h1`
  font-size: 6.5rem;
  font-weight: 850;
  color: #191919;
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: 1rem;
  font-family: ${(props) => props.theme.fonts.mono};
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #191919;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
  font-family: ${(props) => props.theme.fonts.serif};
`;

const Text = styled.p`
  font-size: 0.95rem;
  color: #6e6e73;
  margin-bottom: 2.5rem;
  line-height: 1.6;
`;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <Container>
        <Flex justify="center">
          <Content>
            <Code>404</Code>
            <Title>Identity Lost</Title>
            <Text>
              The resource you are looking for has either been moved, updated, or does not exist in our system registry.
            </Text>
            <Button
              onClick={() => navigate("/")}
              style={{ padding: "0.8rem 2rem", fontSize: "0.95rem" }}
            >
              Return to Registry
            </Button>
          </Content>
        </Flex>
      </Container>
    </Wrapper>
  );
};

export default NotFound;
