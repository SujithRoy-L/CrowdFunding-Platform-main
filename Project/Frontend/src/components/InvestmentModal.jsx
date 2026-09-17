import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { X, Info } from "lucide-react";
import { Button, Card, Flex, Input } from "./ui";

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h2 {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    font-size: 0.95rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #333;
  font-size: 0.95rem;
`;

const InfoBox = styled.div`
  background: rgba(0, 113, 227, 0.05);
  border-left: 4px solid ${(props) => props.theme.colors.accent || "#0071e3"};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #191919;

  svg {
    color: ${(props) => props.theme.colors.accent || "#0071e3"};
    flex-shrink: 0;
    margin-top: 0.2rem;
  }
`;

const EquityInfo = styled.div`
  background: #faf8f5;
  padding: 1.25rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  border: 1px solid #e3e0d8;

  div {
    h4 {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #6e6e73;
      margin-bottom: 0.5rem;
      letter-spacing: 0.05em;
    }

    p {
      font-size: 1.35rem;
      font-weight: 800;
      color: ${(props) => props.theme.colors.accent || "#0071e3"};
      font-family: var(--font-mono);
    }
  }
`;

const InvestmentModal = ({ isOpen, onClose, project, onProceed }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !project) return null;

  const handleProceed = () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid investment amount");
      return;
    }

    if (Number(amount) > 10000000) {
      setError("Maximum investment limit is ₹1,00,00,000");
      return;
    }

    setError("");
    setLoading(true);
    onProceed(Number(amount));
  };

  const equityPerAmount =
    (project.equity * Number(amount)) / project.targetAmount || 0;

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>

        <Header>
          <h2>Investment Details</h2>
          <p>Invest in {project.title}</p>
        </Header>

        <InfoBox>
          <Info size={18} />
          <span>
            You are investing in equity of this startup. Your investment will be
            locked until the campaign ends.
          </span>
        </InfoBox>

        <FormGroup>
          <Label>Investment Amount (₹)</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            min="1000"
            step="1000"
            style={{
              padding: "1rem",
              fontSize: "1rem",
              borderColor: error ? "#e53e3e" : "#e0e0e0",
            }}
          />
          {error && (
            <p
              style={{
                color: "#e53e3e",
                fontSize: "0.85rem",
                marginTop: "0.5rem",
              }}
            >
              {error}
            </p>
          )}
        </FormGroup>

        {amount && Number(amount) > 0 && (
          <EquityInfo>
            <div>
              <h4>Your Investment</h4>
              <p>₹{Number(amount).toLocaleString()}</p>
            </div>
            <div>
              <h4>Equity Stake</h4>
              <p>{equityPerAmount.toFixed(4)}%</p>
            </div>
          </EquityInfo>
        )}

        <Flex gap="1rem" style={{ marginTop: "2rem" }}>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ flex: 1 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            style={{ flex: 1 }}
            disabled={loading || !amount || Number(amount) <= 0}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </Flex>
      </ModalContent>
    </ModalOverlay>
  );
};

export default InvestmentModal;
