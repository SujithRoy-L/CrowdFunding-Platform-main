import React, { useState } from "react";
import styled from "styled-components";
import { Star } from "lucide-react";

const RatingContainer = styled.div`
  display: flex;
  gap: 0.15rem;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: ${(props) => (props.readonly ? "default" : "pointer")};
  color: ${(props) => (props.active ? "#ffab00" : "#e0e0e0")};
  transition: all 0.2s ease;
  transform: ${(props) =>
    !props.readonly && props.hovered ? "scale(1.2)" : "scale(1)"};
`;

const StarRating = ({ rating, setRating, readonly = false, size = 20 }) => {
  const [hover, setHover] = useState(0);

  return (
    <RatingContainer>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarButton
          key={star}
          active={star <= (hover || rating)}
          hovered={star <= hover}
          readonly={readonly}
          onClick={() => !readonly && setRating(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <Star
            size={size}
            fill={star <= (hover || rating) ? "currentColor" : "none"}
          />
        </StarButton>
      ))}
    </RatingContainer>
  );
};

export default StarRating;
