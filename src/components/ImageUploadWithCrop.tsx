"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  UploadCloud,
  Camera,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Check,
  X,
  Trash2,
  AlertCircle,
  Eye,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";

export interface ImageUploadWithCropProps {
  currentImageUrl?: string;
  onImageCropped: (url: string, file?: File) => void;
  aspectRatio?: number; // e.g. 1 (1:1), 16/9, 4/3, or undefined for free
  aspectRatioLabel?: string; // e.g. "૧:૧ (ચોરસ)", "૧૬:૯ (બેનર)"
  category?:
    | "member-photos"
    | "business-photos"
    | "advertisement-banners"
    | "donor-photos"
    | "samiti-assets"
    | "payment-proofs";
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  className?: string;
  circleOverlay?: boolean;
  minWidth?: number;
  minHeight?: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];

export default function ImageUploadWithCrop({
  currentImageUrl,
  onImageCropped,
  aspectRatio = 1,
  aspectRatioLabel,
  category = "member-photos",
  maxSizeMB = 5,
  label = "તસવીર અપલોડ કરો",
  helperText,
  className = "",
  circleOverlay = false,
  minWidth = 50,
  minHeight = 50,
}: ImageUploadWithCropProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || "");
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Crop Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [sourceImageSrc, setSourceImageSrc] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState("image.jpg");
  const [originalFileType, setOriginalFileType] = useState("image/jpeg");

  // Crop Controls State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isUploading, setIsUploading] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [fitMode, setFitMode] = useState<"fill" | "fit">("fill");

  const editorBoxWidth = 360;
  const editorBoxHeight = aspectRatio ? Math.round(editorBoxWidth / aspectRatio) : 260;

  // Calculate base display dimensions so the image fits the 360px viewport properly
  const baseDimensions = useMemo(() => {
    if (!naturalDimensions.width || !naturalDimensions.height) {
      return { width: editorBoxWidth, height: editorBoxHeight };
    }
    const imgRatio = naturalDimensions.width / naturalDimensions.height;
    const boxRatio = editorBoxWidth / editorBoxHeight;

    if (fitMode === "fit") {
      // Contain: scale down so entire image fits inside box with letterboxing
      if (imgRatio > boxRatio) {
        const w = editorBoxWidth;
        const h = w / imgRatio;
        return { width: w, height: h };
      } else {
        const h = editorBoxHeight;
        const w = h * imgRatio;
        return { width: w, height: h };
      }
    } else {
      // Fill: scale so image covers crop box completely (standard crop default)
      if (imgRatio > boxRatio) {
        const h = editorBoxHeight;
        const w = h * imgRatio;
        return { width: w, height: h };
      } else {
        const w = editorBoxWidth;
        const h = w / imgRatio;
        return { width: w, height: h };
      }
    }
  }, [naturalDimensions.width, naturalDimensions.height, editorBoxWidth, editorBoxHeight, fitMode]);

  // Interaction dragging inside editor
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const livePreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync preview when currentImageUrl prop changes
  useEffect(() => {
    if (currentImageUrl !== undefined) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  // Validation function
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "અમાન્ય ફાઇલ પ્રકાર. ફક્ત JPG, PNG, WEBP અથવા GIF ફાઇલ જ માન્ય છે.";
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `ફાઇલનું કદ ${maxSizeMB}MB કરતાં ઓછું હોવું આવશ્યક છે. (તમારી ફાઇલ: ${(
        file.size /
        (1024 * 1024)
      ).toFixed(1)}MB)`;
    }
    return null;
  };

  // Process chosen or dropped file
  const handleFile = (file: File) => {
    setErrorMessage(null);
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setOriginalFileName(file.name);
    setOriginalFileType(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      // Validate image dimensions
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth < minWidth || img.naturalHeight < minHeight) {
          setErrorMessage(
            `તસવીરનું માપ ઘણું નાનું છે. લઘુત્તમ ${minWidth}x${minHeight} પિક્સેલ જરૂરી છે.`
          );
          return;
        }
        setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setSourceImageSrc(resultStr);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
        setIsCropModalOpen(true);
      };
      img.onerror = () => {
        setErrorMessage("તસવીર લોડ કરવામાં ક્ષતિ આવી. કૃપા કરીને બીજી ફાઇલ પસંદ કરો.");
      };
      img.src = resultStr;
    };
    reader.onerror = () => {
      setErrorMessage("ફાઇલ વાંચવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.");
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers for upload zone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  // Pan interaction inside crop editor
  const handleEditorMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleEditorMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleEditorMouseUp = () => {
    setIsPanning(false);
  };

  // Touch handlers for mobile pan
  const handleEditorTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleEditorTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleEditorTouchEnd = () => {
    setIsPanning(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(3, Math.max(0.5, +(prev + delta).toFixed(2))));
  };

  // Live preview drawing
  const updateLivePreview = useCallback(() => {
    if (!livePreviewCanvasRef.current || !imageElementRef.current) return;
    const canvas = livePreviewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageElementRef.current;
    if (!ctx || !img.complete || img.naturalWidth === 0) return;

    // Viewport box dimensions
    const targetW = 120;
    const targetH = aspectRatio ? Math.round(targetW / aspectRatio) : 90;
    canvas.width = targetW;
    canvas.height = targetH;

    ctx.clearRect(0, 0, targetW, targetH);
    ctx.save();

    // Move to center of preview canvas
    ctx.translate(targetW / 2, targetH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate base draw size matching the editor box ratio
    const scaleFactor = targetW / editorBoxWidth;
    const drawW = baseDimensions.width * scaleFactor;
    const drawH = baseDimensions.height * scaleFactor;
    const panX = pan.x * scaleFactor;
    const panY = pan.y * scaleFactor;

    ctx.drawImage(
      img,
      -drawW / 2 + panX,
      -drawH / 2 + panY,
      drawW,
      drawH
    );

    ctx.restore();
  }, [aspectRatio, baseDimensions.width, baseDimensions.height, editorBoxWidth, pan.x, pan.y, rotation, zoom]);

  useEffect(() => {
    if (isCropModalOpen) {
      updateLivePreview();
    }
  }, [isCropModalOpen, updateLivePreview, zoom, pan, rotation]);

  // Crop execution & Upload to API
  const handleApplyCropAndUpload = async () => {
    if (!imageElementRef.current) return;
    const img = imageElementRef.current;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // 1. Output resolution calculation
      let outWidth = 800;
      let outHeight = aspectRatio ? Math.round(outWidth / aspectRatio) : 600;

      // For standard banners (16:9), generate high-res 1280x720
      if (aspectRatio && Math.abs(aspectRatio - 16 / 9) < 0.1) {
        outWidth = 1280;
        outHeight = 720;
      } else if (aspectRatio && Math.abs(aspectRatio - 1) < 0.05) {
        // Square 600x600
        outWidth = 600;
        outHeight = 600;
      }

      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context creation failed");

      ctx.imageSmoothingQuality = "high";
      ctx.imageSmoothingEnabled = true;

      ctx.save();
      ctx.translate(outWidth / 2, outHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const scaleMultiplier = outWidth / editorBoxWidth;
      const finalDrawW = baseDimensions.width * scaleMultiplier;
      const finalDrawH = baseDimensions.height * scaleMultiplier;
      const finalPanX = pan.x * scaleMultiplier;
      const finalPanY = pan.y * scaleMultiplier;

      ctx.drawImage(
        img,
        -finalDrawW / 2 + finalPanX,
        -finalDrawH / 2 + finalPanY,
        finalDrawW,
        finalDrawH
      );
      ctx.restore();

      // 2. Export canvas to Blob
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("ક્રોપ કરેલી તસવીર બનાવવામાં નિષ્ફળ."));
          },
          "image/jpeg",
          0.92
        );
      });

      // 3. Create File object
      const safeName = originalFileName.replace(/\.[^/.]+$/, "") + "-cropped.jpg";
      const croppedFile = new File([blob], safeName, { type: "image/jpeg" });

      // 4. Upload through existing /api/upload
      const formData = new FormData();
      formData.append("file", croppedFile);
      formData.append("category", category);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "તસવીર અપલોડ કરવામાં નિષ્ફળ.");
      }

      const finalUrl = data.url;
      setPreviewUrl(finalUrl);
      setIsCropModalOpen(false);
      onImageCropped(finalUrl, croppedFile);
    } catch (err: any) {
      console.error("[Crop Upload Error]", err);
      setErrorMessage(err.message || "તસવીર ક્રોપ અને અપલોડ કરતી વખતે ક્ષતિ આવી.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    onImageCropped("");
    setErrorMessage(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Upload Zone & Live Preview Box */}
      {previewUrl ? (
        <div className="relative group rounded-2xl overflow-hidden border border-ivory-300 bg-ivory-100 shadow-sm transition-all hover:border-saffron-400">
          <div
            className="w-full flex items-center justify-center bg-charcoal-900/5 relative overflow-hidden"
            style={{
              aspectRatio: aspectRatio ? `${aspectRatio}` : "16/9",
              maxHeight: "340px",
            }}
          >
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-102 ${
                circleOverlay ? "rounded-full max-w-[180px] max-h-[180px] border-4 border-white shadow-md mx-auto" : ""
              }`}
            />
          </div>

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-charcoal-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-white hover:bg-saffron-50 text-charcoal-900 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-saffron-600" />
              <span>તસવીર બદલો</span>
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>દૂર કરો</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty Drag & Drop Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center group ${
            isDragging
              ? "border-saffron-600 bg-saffron-50/70 scale-[1.01] shadow-md"
              : "border-ivory-300 hover:border-saffron-500 hover:bg-saffron-50/20 bg-ivory-50/50"
          }`}
          style={{ minHeight: "160px" }}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
              isDragging
                ? "bg-saffron-600 text-white animate-bounce"
                : "bg-saffron-100 text-saffron-700 group-hover:bg-saffron-200"
            }`}
          >
            <UploadCloud className="w-6 h-6" />
          </div>

          <span className="text-xs sm:text-sm font-extrabold text-charcoal-900 mb-1">
            {isDragging ? "તસવીર અહીં છોડો (Drop Here)" : label}
          </span>

          <p className="text-[11px] text-charcoal-500 max-w-xs leading-normal">
            {helperText ||
              `ડ્રેગ & ડ્રોપ કરો અથવા તમારા ડિવાઇસમાંથી પસંદ કરો • JPG, PNG, WebP (મહત્તમ ${maxSizeMB}MB)`}
          </p>

          {aspectRatioLabel && (
            <span className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold text-saffron-800 bg-saffron-100 px-2.5 py-0.5 rounded-full border border-saffron-200">
              <Crop className="w-3 h-3 text-saffron-600" />
              <span>માપ: {aspectRatioLabel}</span>
            </span>
          )}
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* Interactive Crop & Adjust Editor Modal Dialog                 */}
      {/* ============================================================ */}
      {isCropModalOpen && sourceImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl border border-ivory-300 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-ivory-200 flex items-center justify-between bg-ivory-50/70">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-saffron-100 text-saffron-700">
                  <Crop className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-charcoal-900">
                    તસવીર ક્રોપ & એડિટ કરો (Crop &amp; Position)
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    તસવીરને ડ્રેગ કરીને સ્થાન બદલો અને નીચે આપેલા સ્લાઇડરથી ઝૂમ સેટ કરો.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                disabled={isUploading}
                className="p-1.5 rounded-xl hover:bg-ivory-200 text-charcoal-500 transition-colors"
                title="બંધ કરો"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Editor Workspace & Live View */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-ivory-100/40">
              {/* Interactive Viewport Canvas */}
              <div className="flex flex-col items-center">
                <div
                  onMouseDown={handleEditorMouseDown}
                  onMouseMove={handleEditorMouseMove}
                  onMouseUp={handleEditorMouseUp}
                  onTouchStart={handleEditorTouchStart}
                  onTouchMove={handleEditorTouchMove}
                  onTouchEnd={handleEditorTouchEnd}
                  onWheel={handleWheel}
                  className="relative overflow-hidden rounded-2xl bg-charcoal-900 select-none shadow-inner cursor-grab active:cursor-grabbing border-2 border-saffron-500 flex items-center justify-center"
                  style={{
                    width: "360px",
                    maxWidth: "100%",
                    height: aspectRatio ? `${Math.round(360 / aspectRatio)}px` : "260px",
                    maxHeight: "360px",
                  }}
                >
                  {/* The Scaled and Positioned Image */}
                  <img
                    ref={imageElementRef}
                    src={sourceImageSrc}
                    alt="Editor Source"
                    draggable={false}
                    className="pointer-events-none select-none transition-transform duration-75"
                    style={{
                      width: `${baseDimensions.width}px`,
                      height: `${baseDimensions.height}px`,
                      maxWidth: "none",
                      maxHeight: "none",
                      transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                      transformOrigin: "center center",
                    }}
                  />

                  {/* Visual Guide / Rule of Thirds Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none border border-white/40">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-white" />
                      <div className="border-r border-white" />
                      <div />
                    </div>
                  </div>

                  {/* Circular Overlay Mask if circleOverlay enabled */}
                  {circleOverlay && (
                    <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-saffron-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                  )}

                  {/* Aspect Ratio Badge */}
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-charcoal-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-sm pointer-events-none">
                    {aspectRatioLabel || (aspectRatio === 1 ? "૧:૧" : `${aspectRatio}:૧`)}
                  </span>
                </div>

                <span className="text-[10px] text-charcoal-400 mt-2">
                  💡 તસવીરને મુવ કરવા માટે માઉસથી ખેંચો (Drag to Reposition)
                </span>
              </div>

              {/* Controls Bar: Zoom Slider, Rotate, Reset */}
              <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-2xs space-y-3">
                {/* Zoom Controller */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-charcoal-700 flex items-center gap-1.5 w-16">
                    <ZoomIn className="w-3.5 h-3.5 text-saffron-600" />
                    <span>ઝૂમ:</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.2).toFixed(2)))}
                    className="p-1 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 transition-colors"
                    title="ઝૂમ આઉટ (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-ivory-200 rounded-lg appearance-none cursor-pointer accent-saffron-600"
                  />

                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)))}
                    className="p-1 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 transition-colors"
                    title="ઝૂમ ઇન (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-xs font-mono font-bold text-charcoal-600 w-10 text-right">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* Additional Tools: Rotate, Fit/Fill, Reset, Live Preview */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-ivory-200 text-xs flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode((prev) => (prev === "fill" ? "fit" : "fill"));
                        setPan({ x: 0, y: 0 });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 font-bold flex items-center gap-1 transition-colors"
                      title={fitMode === "fill" ? "આખી તસવીર સમાવો (Fit)" : "સંપૂર્ણ બોક્સ ભરો (Fill)"}
                    >
                      {fitMode === "fill" ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5 text-saffron-600" />
                          <span>આખી તસવીર (Fit)</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5 text-saffron-600" />
                          <span>સંપૂર્ણ ભરો (Fill)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-3 py-1.5 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 font-bold flex items-center gap-1 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-forest-700" />
                      <span>૯૦° ફેરવો</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setPan({ x: 0, y: 0 });
                        setRotation(0);
                        setFitMode("fill");
                      }}
                      className="px-3 py-1.5 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-charcoal-600 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>રીસેટ</span>
                    </button>
                  </div>

                  {/* Hidden Live Preview Canvas for Instant Verification */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-charcoal-400 font-bold hidden sm:inline">
                      પ્રીવ્યૂ:
                    </span>
                    <canvas
                      ref={livePreviewCanvasRef}
                      className={`w-12 h-12 object-cover border border-ivory-300 shadow-2xs ${
                        circleOverlay ? "rounded-full" : "rounded-lg"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-5 py-3.5 border-t border-ivory-200 bg-white flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-bold text-charcoal-700 hover:bg-ivory-100 rounded-xl transition-colors border border-ivory-300 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>બીજી તસવીર પસંદ કરો</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-bold text-charcoal-600 hover:bg-ivory-100 rounded-xl transition-colors"
                >
                  રદ કરો
                </button>

                <button
                  type="button"
                  onClick={handleApplyCropAndUpload}
                  disabled={isUploading}
                  className="px-5 py-2.5 text-xs font-bold bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>અપલોડ થઈ રહ્યું છે...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>ક્રોપ &amp; સેવ કરો (Apply)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

