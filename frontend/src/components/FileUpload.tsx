import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { 
  Upload, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  Loader2,
  ExternalLink
} from 'lucide-react';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onUploadComplete: (fileUrl: string, fileMetadata: any) => void;
  currentValue?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Upload Media or Resource',
  accept = 'image/*,video/*,application/pdf,.doc,.docx',
  onUploadComplete,
  currentValue
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentValue || null);
  const [fileType, setFileType] = useState<'image' | 'video' | 'pdf' | 'other' | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploaded = res.data.file;
      setPreviewUrl(uploaded.url);
      setFileType(uploaded.type);
      setUploadSuccess(true);
      onUploadComplete(uploaded.url, uploaded);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setFileType(null);
    setUploadSuccess(false);
    onUploadComplete('', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300">{label}</label>
        {previewUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
          uploadSuccess
            ? 'border-emerald-500/50 bg-emerald-950/20'
            : isUploading
            ? 'border-indigo-500/50 bg-indigo-950/20'
            : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={accept}
          className="hidden"
        />

        {isUploading ? (
          <div className="py-4 space-y-2">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-indigo-300 font-bold">Uploading file to server...</p>
          </div>
        ) : previewUrl ? (
          <div className="space-y-2">
            {previewUrl.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i) || fileType === 'image' ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-36 mx-auto rounded-xl object-contain ring-1 ring-slate-800 shadow"
              />
            ) : previewUrl.match(/\.(mp4|webm|mov)$/i) || fileType === 'video' ? (
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 inline-flex items-center gap-2 text-xs font-bold">
                <Video className="w-5 h-5 text-rose-400" />
                <span>Video File Ready ({previewUrl.split('/').pop()})</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 inline-flex items-center gap-2 text-xs font-bold">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>Document Attached ({previewUrl.split('/').pop()})</span>
              </div>
            )}

            <div className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Uploaded successfully</span>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-300">
              Click to upload file (Image, Video, PDF, Resource)
            </div>
            <p className="text-[11px] text-slate-500">
              PNG, JPG, MP4, PDF, WebM up to 100MB
            </p>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-[11px] text-rose-400 font-semibold">{errorMsg}</p>
      )}
    </div>
  );
};
