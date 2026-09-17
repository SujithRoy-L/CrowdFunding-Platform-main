import React, { useRef, useState } from "react";
import { Button } from "./index";
import styled from "styled-components";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

const UploadContainer = styled.div`
  width: 100%;
  margin-bottom: 2rem;
`;

const DropZone = styled.div`
  border: 1.5px dashed ${(props) => (props.$isDragging ? props.theme.colors.accent : "#e3e0d8")};
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${(props) => (props.$isDragging ? "rgba(0, 113, 227, 0.04)" : "#ffffff")};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};

  &:hover {
    border-color: ${(props) => (props.$disabled ? "#e3e0d8" : props.theme.colors.primary)};
    background: ${(props) => (props.$disabled ? "#ffffff" : "rgba(0, 0, 0, 0.01)")};
    transform: ${(props) => (props.$disabled ? "none" : "scale(1.005)")};
  }
`;

const InfoText = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: #191919;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
`;

const SubText = styled.p`
  font-size: 0.78rem;
  color: #86868b;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const PreviewCard = styled.div`
  position: relative;
  padding-bottom: 100%;
  background: #fbf9f6;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e3e0d8;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: #191919;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(25, 25, 25, 0.9);
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: #e31a1a;
    transform: scale(1.1);
  }
`;

const SinglePreviewWrapper = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e3e0d8;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.015);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SingleMetadataOverlay = styled.div`
  position: absolute;
  bottom: 0;
  inset-inline: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
  padding: 1.5rem;
  color: #ffffff;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  .text-info {
    h4 {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    p {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.7);
      font-family: var(--font-mono);
    }
  }
`;

const ImageUpload = ({
  label,
  value, // file object or URL string
  onChange,
  onRemove,
  multiple = false,
  accept = "image/*",
  disabled = false,
  maxSizeMB = 5,
  existingImages = [],
  onDeleteExisting,
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files || []);
    processFiles(files);
  };

  const handleClickZone = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files) => {
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds ${maxSizeMB}MB limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (multiple) {
      onChange(validFiles);
    } else {
      onChange(validFiles[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getImgSrc = (val) => {
    if (val instanceof File) {
      return URL.createObjectURL(val);
    }
    if (typeof val === "string") {
      return val.startsWith("http") ? val : `http://localhost:5000${val}`;
    }
    return "";
  };

  return (
    <UploadContainer>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        disabled={disabled}
      />

      {/* Single image preview style */}
      {!multiple && value && (
        <SinglePreviewWrapper>
          <img src={getImgSrc(value)} alt="Preview" />
          {!disabled && (
            <SingleMetadataOverlay>
              <div className="text-info">
                <h4>{value instanceof File ? value.name : "Cover Image"}</h4>
                <p>{value instanceof File ? formatFileSize(value.size) : "Uploaded"}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={onRemove}
                style={{
                  background: "#ffffff",
                  color: "#e31a1a",
                  borderColor: "#e3e0d8",
                  padding: "0.5rem 1rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                Change Photo
              </Button>
            </SingleMetadataOverlay>
          )}
        </SinglePreviewWrapper>
      )}

      {/* Dropzone area (rendered if multiple, or if single and no value is selected) */}
      {(multiple || !value) && (
        <DropZone
          $isDragging={isDragging}
          $disabled={disabled}
          onClick={handleClickZone}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload
            size={36}
            style={{
              color: isDragging ? "#0071e3" : "#6e6e73",
              marginBottom: "1rem",
              transition: "color 0.2s",
            }}
          />
          <InfoText>
            {isDragging ? "Drop your files here" : `Drag & drop your ${multiple ? "images" : "image"} here`}
          </InfoText>
          <SubText>
            {!isDragging && (
              <>
                or <span style={{ color: "#0071e3", fontWeight: 700 }}>browse files</span> from your computer
              </>
            )}
          </SubText>
          <SubText style={{ marginTop: "0.5rem", fontSize: "0.72rem" }}>
            Supports JPG, PNG, WEBP · Max {maxSizeMB}MB
          </SubText>
        </DropZone>
      )}

      {/* Grid previews for multiple/gallery uploads */}
      {multiple && (existingImages.length > 0 || (Array.isArray(value) && value.length > 0)) && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem" }}>
            Gallery Images ({existingImages.length + (Array.isArray(value) ? value.length : 0)})
          </p>

          <PreviewGrid>
            {/* Existing Uploaded Images */}
            {existingImages.map((imgUrl, idx) => (
              <PreviewCard key={`existing-${idx}`}>
                <img src={getImgSrc(imgUrl)} alt={`Existing ${idx}`} />
                {!disabled && onDeleteExisting && (
                  <RemoveButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteExisting(imgUrl);
                    }}
                  >
                    ×
                  </RemoveButton>
                )}
              </PreviewCard>
            ))}

            {/* New Selected Images */}
            {Array.isArray(value) &&
              value.map((file, idx) => (
                <PreviewCard key={`new-${idx}`}>
                  <img src={getImgSrc(file)} alt={`New ${idx}`} />
                  {!disabled && onRemove && (
                    <RemoveButton
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(idx);
                      }}
                    >
                      ×
                    </RemoveButton>
                  )}
                </PreviewCard>
              ))}
          </PreviewGrid>
        </div>
      )}
    </UploadContainer>
  );
};

export default ImageUpload;
