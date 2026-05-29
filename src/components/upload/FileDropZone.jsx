import { useCallback, useState } from 'react';
import { Upload, FileArchive, File, X } from 'lucide-react';

export default function FileDropZone({ onFilesChange, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);

  const ACCEPTED = ['.tml', '.zip'];

  const isValid = (file) =>
    ACCEPTED.some((ext) => file.name.toLowerCase().endsWith(ext));

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(isValid);
    const updated = [
      ...files,
      ...valid.filter((v) => !files.find((f) => f.name === v.name && f.size === v.size)),
    ];
    setFiles(updated);
    onFilesChange(updated);
  }, [files, onFilesChange]);

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange(updated);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  };

  const onInputChange = (e) => {
    if (disabled) return;
    addFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`
          relative rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragOver ? 'border-primary-400 bg-primary-50/60 scale-[1.01]' : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50/30'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && document.getElementById('ts-file-input').click()}
      >
        <input
          id="ts-file-input"
          type="file"
          multiple
          accept=".tml,.zip"
          onChange={onInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4 transition-colors ${dragOver ? 'bg-primary-100' : 'bg-white border border-gray-200'}`}>
            <Upload className={`w-7 h-7 ${dragOver ? 'text-primary-600' : 'text-gray-500'}`} />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            {dragOver ? 'Drop your files here' : 'Drag & drop your ThoughtSpot files'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            or <span className="text-primary-600 font-medium underline underline-offset-2">browse to select</span>
          </p>
          <div className="flex gap-2 mt-4">
            {['.tml', '.zip (SpotApp)'].map((t) => (
              <span key={t} className="text-[11px] bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-md font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Selected Files ({files.length})
          </p>
          {files.map((file, idx) => {
            const isZip = file.name.endsWith('.zip');
            const Icon = isZip ? FileArchive : File;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isZip ? 'bg-amber-50' : 'bg-primary-50'}`}>
                  <Icon className={`w-4 h-4 ${isZip ? 'text-amber-600' : 'text-primary-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {isZip ? 'SpotApp Bundle' : 'TML File'}
                  </p>
                </div>
                {!disabled && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
