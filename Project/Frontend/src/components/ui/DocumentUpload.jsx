import React, { useState } from "react";
import styled from "styled-components";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button, Flex } from "./index";

/* ─── Styled ──────────────────────────── */
const DropZone = styled.div`
  border: 1.5px dashed
    ${(props) => (props.$isDragging ? props.theme.colors.accent : props.hasFile ? props.theme.colors.primary : "#e3e0d8")};
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${(props) =>
    props.$isDragging ? "rgba(0, 113, 227, 0.04)" : props.hasFile ? "rgba(0, 113, 227, 0.02)" : "#ffffff"};
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  position: relative;
  margin-bottom: 1.5rem;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    background: rgba(0, 0, 0, 0.01);
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6e6e73;
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.85rem 1.25rem;
  border: 1px solid #dcdad2;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  height: 3rem;
  background: #ffffff;
  margin-bottom: 1.5rem;
  box-sizing: border-box;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236e6e73%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 16px) center;

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(25, 25, 25, 0.04);
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 0.85rem 1.25rem;
  border: 1px solid #dcdad2;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  height: 3rem;
  margin-bottom: 1.5rem;
  box-sizing: border-box;
  background: #ffffff;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(25, 25, 25, 0.04);
  }
`;

const Alert = styled.div`
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  ${(props) =>
    props.variant === "error"
      ? "background:#fff5f5;border:1px solid #fed7d7;color:#c53030;"
      : "background:#f0fff4;border:1px solid #9ae6b4;color:#276749;"}
`;

const FilePill = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(0, 113, 227, 0.05);
  border: 1px solid rgba(0, 113, 227, 0.15);
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;

  .name {
    font-weight: 700;
    flex-grow: 1;
    word-break: break-all;
    color: #191919;
  }
  .size {
    color: #6e6e73;
    white-space: nowrap;
    font-size: 0.8rem;
    font-family: var(--font-mono);
  }
`;

/* ─── Component ──────────────────────── */
const DocumentUpload = ({ onUploadSuccess }) => {
  const fileInputRef = React.useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("");
  const [projName, setProjName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fmt = (b) =>
    b < 1048576
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1048576).toFixed(1)} MB`;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    validateAndSetFile(f);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    validateAndSetFile(f);
  };

  const validateAndSetFile = (f) => {
    setError("");
    setSuccess("");
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type)) {
      setError("Only PDF, JPEG, PNG, DOC or DOCX files allowed.");
      return;
    }
    if (f.size > 9 * 1024 * 1024) {
      setError("File must be under 9 MB.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!file) {
      setError("Please select a file.");
      return;
    }
    if (!docType) {
      setError("Please select a document type.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("documentType", docType);
    if (projName) form.append("projectName", projName);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setSuccess(`"${file.name}" uploaded and pending verification.`);
      toast.success("Document uploaded successfully!");
      setFile(null);
      setDocType("");
      setProjName("");
      if (onUploadSuccess) onUploadSuccess(data);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3
        style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}
      >
        Secure Document Portal
      </h3>
      <p
        style={{
          color: "#666",
          fontSize: "0.9rem",
          marginBottom: "2rem",
          lineHeight: 1.6,
        }}
      >
        Upload KYC, financial statements, or project documents. Accepted: PDF,
        JPEG, PNG, DOC (max 9 MB).
      </p>

      {error && (
        <Alert variant="error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <DropZone
          hasFile={!!file}
          $isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          <div
            style={{
              background: "rgba(0, 113, 227, 0.08)",
              color: "#0071e3",
              padding: "1rem",
              borderRadius: "50%",
              display: "inline-block",
              marginBottom: "1rem",
            }}
          >
            <Upload size={28} />
          </div>
          <p
            style={{ fontWeight: 600, color: "#191919", marginBottom: "0.25rem" }}
          >
            {file ? file.name : "Drag & drop or click to select"}
          </p>
          <p style={{ fontSize: "0.8rem", color: "#6e6e73" }}>
            {file ? fmt(file.size) : "PDF, JPEG, PNG, DOC/DOCX · Max 9 MB"}
          </p>
        </DropZone>

        {file && (
          <FilePill>
            <FileText size={20} color="#0071e3" style={{ flexShrink: 0 }} />
            <span className="name">{file.name}</span>
            <span className="size">{fmt(file.size)}</span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#999",
                padding: 0,
              }}
            >
              <X size={16} />
            </button>
          </FilePill>
        )}

        <Label>Document Type *</Label>
        <Select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          required
        >
          <option value="">Select document type…</option>
          <option value="identity">
            Identity Proof (Aadhaar / PAN / Passport)
          </option>
          <option value="address">Address Proof</option>
          <option value="financial">Financial Statement</option>
          <option value="project">Project Document</option>
          <option value="other">Other</option>
        </Select>

        <Label>Related Project (optional)</Label>
        <TextInput
          type="text"
          placeholder="e.g. My Startup Campaign"
          value={projName}
          onChange={(e) => setProjName(e.target.value)}
        />

        <Button
          type="submit"
          size="lg"
          style={{ width: "100%" }}
          disabled={loading || !file || !docType}
        >
          {loading ? "Uploading…" : "Upload Document"}
        </Button>
      </form>

      <Flex
        gap="1rem"
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#f8f9fa",
          borderRadius: "12px",
        }}
      >
        <ShieldCheck size={20} style={{ color: "#2f855a", flexShrink: 0 }} />
        <span style={{ fontSize: "0.85rem", color: "#666" }}>
          Documents are encrypted and stored in compliance with our crowdfunding
          data isolation policies.
        </span>
      </Flex>
    </div>
  );
};

export default DocumentUpload;
