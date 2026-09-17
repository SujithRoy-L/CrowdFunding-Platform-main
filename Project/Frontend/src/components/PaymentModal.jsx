import React, { useState, useRef } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, Check, AlertCircle } from "lucide-react";
import { Button, Card, Flex, Input } from "./ui";

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 550px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
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

const AmountDisplay = styled.div`
  background: rgba(0, 113, 227, 0.05);
  padding: 1.25rem;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 113, 227, 0.1);

  p {
    color: #6e6e73;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  h3 {
    font-size: 2rem;
    font-weight: 800;
    color: ${(props) => props.theme.colors.accent || "#0071e3"};
    font-family: var(--font-mono);
  }
`;

const PaymentMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PaymentMethodButton = styled(motion.button)`
  background: ${(props) => (props.selected ? "rgba(0, 113, 227, 0.05)" : "#fff")};
  border: 2px solid ${(props) => (props.selected ? (props.theme.colors.accent || "#0071e3") : "#e3e0d8")};
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent || "#0071e3"};
    background: ${(props) => (props.selected ? "rgba(0, 113, 227, 0.05)" : "rgba(0, 0, 0, 0.02)")};
  }

  svg {
    color: ${(props) => (props.selected ? (props.theme.colors.accent || "#0071e3") : "#6e6e73")};
    width: 28px;
    height: 28px;
  }

  span {
    font-weight: 700;
    color: #191919;
    font-size: 0.9rem;
  }
`;

const FormSection = styled(motion.div)`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #191919;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.cols || "1fr"};
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatusBox = styled.div`
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: ${(props) =>
    props.type === "success"
      ? "#f0fdf4"
      : props.type === "error"
        ? "#fef2f2"
        : "rgba(0, 113, 227, 0.05)"};
  border: 1px solid
    ${(props) =>
      props.type === "success"
        ? "#dcfce7"
        : props.type === "error"
          ? "#fee2e2"
          : "rgba(0, 113, 227, 0.1)"};

  svg {
    color: ${(props) =>
      props.type === "success"
        ? "#22c55e"
        : props.type === "error"
          ? "#ef4444"
          : "#0071e3"};
    flex-shrink: 0;
  }

  span {
    color: #191919;
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const PaymentModal = ({
  isOpen,
  onClose,
  project,
  amount,
  projectId,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'processing', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState("");

  // Form data for different payment methods
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [upiData, setUpiData] = useState({ upiId: "" });
  const [netBankingData, setNetBankingData] = useState({
    bankName: "",
    accountNumber: "",
  });

  if (!isOpen) return null;

  const paymentMethods = [
    { id: "credit-debit", label: "Credit/Debit Card", icon: "💳" },
    { id: "upi", label: "UPI", icon: "📱" },
    { id: "netbanking", label: "Net Banking", icon: "🏦" },
    { id: "wallet", label: "Digital Wallet", icon: "👛" },
  ];

  const handlePaymentSubmit = async () => {
    if (!selectedMethod) {
      setStatus("error");
      setStatusMessage("Please select a payment method");
      return;
    }

    // Validate form data based on selected method
    if (selectedMethod === "credit-debit") {
      if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv) {
        setStatus("error");
        setStatusMessage("Please fill in all card details");
        return;
      }
    } else if (selectedMethod === "upi") {
      if (!upiData.upiId) {
        setStatus("error");
        setStatusMessage("Please enter your UPI ID");
        return;
      }
    } else if (selectedMethod === "netbanking") {
      if (!netBankingData.bankName || !netBankingData.accountNumber) {
        setStatus("error");
        setStatusMessage("Please fill in all bank details");
        return;
      }
    }

    setLoading(true);
    setStatus("processing");
    setStatusMessage("Processing your payment...");

    try {
      // Create payment order
      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            amount,
            projectId,
            paymentMethod: selectedMethod,
            paymentDetails: {
              card: selectedMethod === "credit-debit" ? cardData : null,
              upi: selectedMethod === "upi" ? upiData : null,
              netbanking:
                selectedMethod === "netbanking" ? netBankingData : null,
            },
          }),
        },
      );

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const { order } = await orderResponse.json();

      // For demo purposes, simulate successful payment
      // In production, this would integrate with Razorpay Checkout or a payment gateway
      setTimeout(async () => {
        try {
          // Verify payment
          const verifyResponse = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/payment/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                razorpayOrderId: order.id,
                razorpayPaymentId:
                  "pay_" + Math.random().toString(36).substr(2, 14),
                projectId,
                amount,
              }),
            },
          );

          if (verifyResponse.ok) {
            setStatus("success");
            setStatusMessage("Payment successful! Investment recorded.");
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2000);
          } else {
            throw new Error("Payment verification failed");
          }
        } catch (error) {
          setStatus("error");
          setStatusMessage(error.message || "Payment verification failed");
          setLoading(false);
        }
      }, 2000);
    } catch (error) {
      setStatus("error");
      setStatusMessage(error.message || "Failed to process payment");
      setLoading(false);
    }
  };

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
        <CloseButton onClick={onClose} disabled={loading}>
          <X size={24} />
        </CloseButton>

        <Header>
          <h2>Payment</h2>
          <p>Choose your payment method and complete the transaction</p>
        </Header>

        <AmountDisplay>
          <p>Investment Amount</p>
          <h3>₹{Number(amount).toLocaleString()}</h3>
        </AmountDisplay>

        <AnimatePresence>
          {status && (
            <StatusBox type={status}>
              {status === "processing" && (
                <Loader
                  size={20}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              )}
              {status === "success" && <Check size={20} />}
              {status === "error" && <AlertCircle size={20} />}
              <span>{statusMessage}</span>
            </StatusBox>
          )}
        </AnimatePresence>

        {!status || status === "error" ? (
          <>
            <FormSection>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                Select Payment Method
              </h3>
              <PaymentMethodsGrid>
                {paymentMethods.map((method) => (
                  <PaymentMethodButton
                    key={method.id}
                    selected={selectedMethod === method.id}
                    onClick={() => {
                      setSelectedMethod(method.id);
                      setStatus(null);
                    }}
                    whileHover={{ y: -2 }}
                    disabled={loading}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{method.icon}</span>
                    <span>{method.label}</span>
                  </PaymentMethodButton>
                ))}
              </PaymentMethodsGrid>
            </FormSection>

            {selectedMethod === "credit-debit" && (
              <FormSection
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label>Card Number</Label>
                <Input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      cardNumber: e.target.value
                        .replace(/\s/g, "")
                        .slice(0, 16),
                    })
                  }
                  maxLength="16"
                  style={{ marginBottom: "1rem", padding: "0.75rem" }}
                  disabled={loading}
                />

                <FormGrid cols="1fr 1fr">
                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={cardData.expiryDate}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          expiryDate: e.target.value.slice(0, 5),
                        })
                      }
                      maxLength="5"
                      style={{ padding: "0.75rem" }}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label>CVV</Label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          cvv: e.target.value.slice(0, 3),
                        })
                      }
                      maxLength="3"
                      style={{ padding: "0.75rem" }}
                      disabled={loading}
                    />
                  </div>
                </FormGrid>
              </FormSection>
            )}

            {selectedMethod === "upi" && (
              <FormSection
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label>UPI ID</Label>
                <Input
                  type="text"
                  placeholder="your.upi@bank"
                  value={upiData.upiId}
                  onChange={(e) => setUpiData({ upiId: e.target.value })}
                  style={{ padding: "0.75rem" }}
                  disabled={loading}
                />
              </FormSection>
            )}

            {selectedMethod === "netbanking" && (
              <FormSection
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label>Bank Name</Label>
                <Input
                  type="text"
                  placeholder="ICICI Bank"
                  value={netBankingData.bankName}
                  onChange={(e) =>
                    setNetBankingData({
                      ...netBankingData,
                      bankName: e.target.value,
                    })
                  }
                  style={{ marginBottom: "1rem", padding: "0.75rem" }}
                  disabled={loading}
                />
                <Label>Account Number</Label>
                <Input
                  type="text"
                  placeholder="1234567890"
                  value={netBankingData.accountNumber}
                  onChange={(e) =>
                    setNetBankingData({
                      ...netBankingData,
                      accountNumber: e.target.value,
                    })
                  }
                  style={{ padding: "0.75rem" }}
                  disabled={loading}
                />
              </FormSection>
            )}

            {selectedMethod === "wallet" && (
              <FormSection
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <StatusBox type="info">
                  <AlertCircle size={20} />
                  <span>
                    Digital wallet payment will redirect to the provider's app
                  </span>
                </StatusBox>
              </FormSection>
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
                onClick={handlePaymentSubmit}
                style={{ flex: 1 }}
                disabled={loading || !selectedMethod}
              >
                {loading
                  ? "Processing..."
                  : `Pay ₹${Number(amount).toLocaleString()}`}
              </Button>
            </Flex>
          </>
        ) : null}
      </ModalContent>
    </ModalOverlay>
  );
};

export default PaymentModal;
