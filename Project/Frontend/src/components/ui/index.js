import styled from "styled-components";

export const Button = styled.button`
  background-color: ${(props) =>
    props.variant === "outline" ? "transparent" : props.theme.colors.primary};
  color: ${(props) =>
    props.variant === "outline" ? props.theme.colors.primary : "#ffffff"};
  border: ${(props) =>
    props.variant === "outline"
      ? `1px solid ${props.theme.colors.primary}`
      : "none"};
  padding: 0.65rem 1.6rem;
  border-radius: 99px;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${(props) =>
      props.variant === "outline"
        ? `${props.theme.colors.primary}0c`
        : props.theme.colors.accent};
    transform: scale(1.025);
    box-shadow: 0 4px 16px rgba(0, 119, 182, 0.15);
  }

  &:active {
    transform: scale(0.965);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1.25rem;
  border: 1px solid #dcdad2;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  height: 3rem;
  background: #ffffff;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(25, 25, 25, 0.04);
  }

  &::placeholder {
    color: #86868b;
  }
`;

export const Card = styled.div`
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e3e0d8;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.015);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.035);
  }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

export const Flex = styled.div`
  display: flex;
  align-items: ${(props) => props.align || "center"};
  justify-content: ${(props) => props.justify || "flex-start"};
  gap: ${(props) => props.gap || "1rem"};
  flex-direction: ${(props) => props.direction || "row"};
  flex-wrap: ${(props) => props.wrap || "nowrap"};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${(props) => {
    if (typeof props.cols === "string" && props.cols.includes("fr")) {
      return props.cols;
    }
    return `repeat(${props.cols || 1}, 1fr)`;
  }};
  gap: ${(props) => props.gap || "2rem"};

  @media (max-width: 992px) {
    grid-template-columns: ${(props) =>
      props.cols > 2 ? "repeat(2, 1fr)" : "1fr"};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export { default as ImageUpload } from "./ImageUpload";

