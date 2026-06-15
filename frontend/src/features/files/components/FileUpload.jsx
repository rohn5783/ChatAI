import React, { useRef } from "react";
import { uploadFile } from "../service/file.api";
import "../styles/fileUpload.css";

const FileUpload = ({ mode = "button", attachedFiles, setAttachedFiles }) => {
  const fileInputRef = useRef(null);

  const processFiles = async (filesList) => {
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const isImg = file.type.startsWith("image/");
      
      // Local preview URL for instant React visual feedback before upload finishes
      const localPreviewUrl = isImg ? URL.createObjectURL(file) : null;
      
      const tempId = `temp-${Date.now()}-${i}`;
      const tempFile = {
        _id: tempId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        processingStatus: "uploading",
        localPreviewUrl,
      };
      
      setAttachedFiles((prev) => [...prev, tempFile]);

      try {
        const response = await uploadFile(file);
        
        if (response.success && response.file) {
          // Replace temp item with file response metadata
          setAttachedFiles((prev) =>
            prev.map((item) =>
              item._id === tempId 
                ? { ...response.file, localPreviewUrl } 
                : item
            )
          );

          // If PDF, poll to watch background vector chunking completion
          if (response.file.fileType === "application/pdf") {
            pollPdfStatus(response.file._id);
          }
        }
      } catch (err) {
        console.error("Upload failed for file:", file.name, err);
        setAttachedFiles((prev) =>
          prev.map((item) =>
            item._id === tempId
              ? { ...item, processingStatus: "failed" }
              : item
          )
        );
      }
    }
  };

  const pollPdfStatus = (fileId) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/api/files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && data.files) {
          const updatedFile = data.files.find((f) => f._id === fileId);
          if (updatedFile) {
            if (
              updatedFile.processingStatus === "completed" ||
              updatedFile.processingStatus === "failed"
            ) {
              clearInterval(interval);
              setAttachedFiles((prev) =>
                prev.map((item) => (item._id === fileId ? updatedFile : item))
              );
            }
          }
        }
      } catch (err) {
        console.error("Error polling PDF status:", err);
      }
    }, 2000);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleRemove = (id) => {
    setAttachedFiles((prev) => prev.filter((item) => item._id !== id));
  };

  const getFileIcon = (mimeType) => {
    if (mimeType === "application/pdf") return "📄";
    return "📎";
  };

  const getImageUrl = (file) => {
    if (file.localPreviewUrl) return file.localPreviewUrl;
    if (file.storagePath) {
      const filename = file.storagePath.split(/[\\/]/).pop();
      return `http://localhost:3000/uploads/${filename}`;
    }
    return "";
  };

  if (mode === "button") {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
          style={{ display: "none" }}
          onChange={handleChange}
        />
        <button
          type="button"
          className="btn-attach-trigger"
          title="Attach files (PDF, PNG, JPG, WEBP)"
          onClick={triggerFileSelect}
        >
          📎
        </button>
      </div>
    );
  }

  // Previews Mode
  return (
    <div className="upload-previews-list">
      {attachedFiles.map((file) => {
        const isImage = file.fileType.startsWith("image/");
        const imageUrl = isImage ? getImageUrl(file) : null;

        return (
          <div key={file._id} className={`file-preview-card ${isImage ? "image-preview-card" : "pdf-preview-card"}`}>
            {isImage ? (
              <div className="preview-image-container">
                {imageUrl ? (
                  <img src={imageUrl} alt={file.fileName} className="preview-thumbnail" />
                ) : (
                  <span className="file-preview-icon">🖼️</span>
                )}
                {file.processingStatus === "uploading" && (
                  <div className="image-loading-overlay">Uploading...</div>
                )}
              </div>
            ) : (
              <div className="pdf-preview-content">
                <span className="file-preview-icon">{getFileIcon(file.fileType)}</span>
                <div className="file-preview-details">
                  <span className="file-preview-name" title={file.fileName}>
                    {file.fileName}
                  </span>
                  <span className={`file-preview-status status-${file.processingStatus}`}>
                    {file.processingStatus}
                  </span>
                </div>
              </div>
            )}
            
            <button
              type="button"
              className="btn-remove-preview"
              onClick={() => handleRemove(file._id)}
              title="Remove file"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FileUpload;
