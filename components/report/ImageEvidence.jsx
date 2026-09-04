'use client';

import { useRef, useState } from 'react';
import { Camera, CheckCircle2, ImageOff, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import { cn } from '@/utils/client';
import AiProcessing from './AiProcessing';
import Badge from '@/components/ui/Badge';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ImageEvidence({
  image,
  phase, // 'idle' | 'uploading' | 'analyzing' | 'ready' | 'failed'
  errorText,
  analysis, // validated imageAnalysis | null
  onFile,
  onRemove,
  onReanalyze,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localErr, setLocalErr] = useState('');

  const pickFile = (file) => {
    setLocalErr('');
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setLocalErr('Please choose a JPG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalErr('Image is larger than 10 MB. Please pick a smaller photo.');
      return;
    }
    onFile(file);
  };

  const busy = phase === 'uploading' || phase === 'analyzing';

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Upload / preview */}
        <div>
          {!image && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                'flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
                dragOver ? 'border-civic-blue bg-blue-50/60' : 'border-slate-300 bg-slate-50/50 hover:border-slate-400'
              )}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-civic-blue shadow-card">
                <Camera size={26} aria-hidden />
              </span>
              <p className="mt-4 text-[15px] font-bold text-navy-950">Add photographic evidence</p>
              <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-slate-500">
                A clear photo of the problem helps AI verify your report. JPG, PNG, WebP or GIF
                up to 10 MB.
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="btn btn-blue mt-5 px-5 py-2.5"
              >
                <UploadCloud size={16} aria-hidden />
                Choose photo
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-3 text-[12.5px] font-semibold text-slate-400 hover:text-slate-600"
              >
                Or open the camera
              </button>
              {(localErr || errorText) && (
                <p className="mt-4 max-w-xs text-[12.5px] font-medium text-red-600" role="alert">
                  {localErr || errorText}
                </p>
              )}
            </div>
          )}

          {image && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-card">
              <div className="relative bg-slate-900">
                <img
                  src={`/api/images/${image.fileId}`}
                  alt="Uploaded evidence"
                  className={cn('mx-auto max-h-[300px] w-full object-contain', busy && 'opacity-80')}
                />
                {busy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-navy-950/10">
                    <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 shadow-soft">
                      <RefreshCw size={15} className="animate-spin text-civic-blue" aria-hidden />
                      {phase === 'uploading' ? 'Uploading…' : 'AI is analyzing…'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-800">
                    {image.filename || 'Evidence photo'}
                  </p>
                  <p className="text-[12px] text-slate-400">
                    {Math.round((image.size || 0) / 1024)} KB ·{' '}
                    {(image.mimeType || '').replace('image/', '').toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="btn btn-outline px-2.5 py-1.5 text-[12.5px]"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={onRemove}
                    aria-label="Remove photo"
                    disabled={busy}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>

        {/* Analysis / prompt column */}
        <div className="space-y-4">
          {phase === 'uploading' && (
            <AiProcessing message="Uploading your photo to secure storage…" />
          )}
          {phase === 'analyzing' && (
            <AiProcessing message="AI is analyzing the evidence…" />
          )}
          {phase === 'ready' && analysis && (
            <div className="card !p-0">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <h4 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-civic-blue">
                    <Camera size={16} aria-hidden />
                  </span>
                  Image Analysis
                </h4>
                <button type="button" onClick={onReanalyze} className="btn btn-ghost px-2.5 py-1 text-[12px]">
                  <RefreshCw size={13} aria-hidden /> Re-analyze
                </button>
              </div>
              <dl className="space-y-3 px-4 py-4">
                {analysis.isCivicIssue ? (
                  <>
                    <InfoRow k="Detected issue" v={analysis.detectedIssue} />
                    <InfoRow k="Category" v={analysis.category} />
                    <InfoRow k="Estimated severity" v={`${analysis.severity}/10`} />
                    <InfoRow k="Confidence" v={`${Math.round((analysis.confidence || 0) * 100)}%`} />
                  </>
                ) : (
                  <p className="text-[13.5px] text-red-600">
                    {analysis.notCivicReason || 'No clear civic issue is visible in this image.'}
                  </p>
                )}
                {analysis.visibleEvidence?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Visible evidence
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {analysis.visibleEvidence.map((e) => (
                        <li key={e} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[12.5px] text-slate-600">
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.impact && (
                  <p className="rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-600">
                    <span className="font-semibold text-slate-500">Impact: </span>
                    {analysis.impact}
                  </p>
                )}
                {analysis.suspicious && (
                  <Badge tone="orange" dot="bg-orange-500">
                    Image shows possible signs of reuse — treat with caution
                  </Badge>
                )}
                {analysis.imageRelevant === false && analysis.isCivicIssue && (
                  <p className="text-[12.5px] text-amber-700">Image relevance to civic issues is unclear.</p>
                )}
              </dl>
            </div>
          )}
          {phase === 'failed' && (
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
              <p className="flex items-center gap-2 text-[14px] font-semibold text-red-700">
                <ImageOff size={16} aria-hidden /> Could not process the image
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-red-800">{errorText}</p>
              <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-outline mt-4 px-4 py-2 text-[13px]">
                Try another photo
              </button>
            </div>
          )}

          <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/50 px-3.5 py-3">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-civic-blue" aria-hidden />
            <p className="text-[12.5px] leading-relaxed text-slate-600">
              Photos are stored securely and analysed server-side. AI describes what{' '}
              <em>appears</em> visible — it cannot prove a photo is authentic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ k, v }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{k}</span>
      <span className="text-right text-[13.5px] font-semibold text-slate-800">{v}</span>
    </div>
  );
}
