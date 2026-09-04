'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eraser,
  MessageSquareText,
  Send,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { ApiError, fetchJson, cn } from '@/utils/client';
import StepIndicator from './StepIndicator';
import AiProcessing from './AiProcessing';
import VoiceRecorder from './VoiceRecorder';
import AnalysisPanel from './AnalysisPanel';
import ImageEvidence from './ImageEvidence';
import VerificationPanel from './VerificationPanel';
import DuplicateCard from './DuplicateCard';
import ReviewPanel from './ReviewPanel';
import SubmissionSuccess from './SubmissionSuccess';
import LocationPicker from '@/components/map/LocationPicker';

const DRAFT_KEY = 'civicai_report_draft_v1';
const EXAMPLE_ISSUES = [
  'There is a large garbage pile near my college and it has been there for several days. It is causing a bad smell and stray animals around it.',
  'There is a major water pipeline leakage near the bus stand. Clean water is flooding the road and the road surface is breaking.',
  'A street light on the main road has not been working for a week, making the road very dark at night.',
];

const EMPTY_DRAFT = {
  complaint: '',
  analysis: null,
  priority: null,
  emergency: null,
  image: null,
  imageAnalysis: null,
  verification: null,
  location: null,
  duplicates: null,
};

const STEP_COPY = {
  1: { eyebrow: 'Tell CivicAI what happened', title: 'Describe the civic issue' },
  2: { eyebrow: 'AI complaint understanding', title: 'AI analysis' },
  3: { eyebrow: 'Photographic evidence', title: 'Upload evidence' },
  4: { eyebrow: 'Cross-validation', title: 'AI evidence verification' },
  5: { eyebrow: 'Where is it?', title: 'Confirm the location' },
  6: { eyebrow: 'Final check', title: 'Review your civic report' },
  7: { eyebrow: 'Done', title: 'Submitted' },
};

function getStoredDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.complaint) return null;
    return { ...EMPTY_DRAFT, ...parsed };
  } catch {
    return null;
  }
}

export default function ReportWizard() {
  const { user, status: authStatus } = useAuth();

  const [step, setStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  // Deliberately empty for SSR parity; a saved draft is restored in an effect.
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [resumed, setResumed] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [imgPhase, setImgPhase] = useState('idle'); // idle | uploading | analyzing | ready | failed
  const [imgError, setImgError] = useState('');
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [dupState, setDupState] = useState('idle'); // idle | checking | done
  const [loginModal, setLoginModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [completed, setCompleted] = useState(null);
  const restoredRef = useRef(false);
  const analyzingRef = useRef(false);

  const isAuthed = authStatus === 'ready' && Boolean(user);

  // Restore a saved draft exactly once (e.g. after returning from login).
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const saved = getStoredDraft();
    if (saved && saved.complaint && !saved.completedAt) {
      setDraft({ ...EMPTY_DRAFT, ...saved });
      const lastStep = saved.lastStep || 1;
      if (lastStep > 1) {
        setStep(Math.min(7, lastStep));
        setMaxReached(Math.min(7, lastStep));
      }
      setResumed(true);
    }
  }, []);

  // Persist draft (never binary data, only the GridFS id + metadata).
  const saveDraft = useCallback((d) => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, lastStep: step }));
    } catch {
      /* storage full — ignore */
    }
  }, [step]);

  const patchDraft = useCallback(
    (patch) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        saveDraft(next);
        return next;
      });
    },
    [saveDraft]
  );

  const go = useCallback(
    (target) => {
      setStep((cur) => {
        const t = Math.max(1, Math.min(7, target));
        setMaxReached((m) => Math.max(m, t));
        return t;
      });
      setFormError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const startOver = () => {
    setDraft({ ...EMPTY_DRAFT });
    setResumed(false);
    setDupState('idle');
    setStep(1);
    setMaxReached(1);
    setCompleted(null);
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch { /* ignore */ }
  };

  /* ------------------------------ analysis ------------------------------ */
  const runAnalysis = async () => {
    if (analyzingRef.current) return;
    const text = draft.complaint.trim();
    if (text.length < 5) {
      setFormError('Please describe the issue you want to report first.');
      return;
    }
    analyzingRef.current = true;
    setAnalyzing(true);
    setFormError('');
    try {
      const data = await fetchJson('/api/analyze-complaint', {
        method: 'POST',
        body: { complaint: text },
      });
      if (data.analysis?.isCivicIssue === false) {
        patchDraft({
          analysis: data.analysis,
          priority: null,
          emergency: null,
          verification: null,
          duplicates: null,
        });
        setStep(2);
        setMaxReached((m) => Math.max(m, 2));
      } else {
        patchDraft({
          analysis: data.analysis,
          priority: data.priority,
          emergency: data.emergency,
          verification: null,
          duplicates: null,
        });
        setStep(2);
        setMaxReached((m) => Math.max(m, 2));
      }
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Analysis failed. Please try again.');
    } finally {
      analyzingRef.current = false;
      setAnalyzing(false);
    }
  };

  /* ------------------------------- image ------------------------------- */
  const uploadAndAnalyze = async (file) => {
    setImgError('');
    setImgPhase('uploading');
    try {
      const fd = new FormData();
      fd.append('file', file);
      let res;
      try {
        res = await fetch('/api/images', { method: 'POST', body: fd });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new ApiError(data?.error?.message || 'Upload failed.', {
            status: res.status,
            code: data?.error?.code,
          });
        }
        patchDraft({
          image: {
            fileId: data.fileId,
            mimeType: data.mimeType,
            size: data.size,
            filename: file.name || 'evidence.jpg',
          },
          imageAnalysis: null,
          verification: null,
        });
        setImgPhase('analyzing');
        const analysisRes = await fetchJson('/api/analyze-image', {
          method: 'POST',
          body: { fileId: data.fileId },
        });
        patchDraft({ imageAnalysis: analysisRes.imageAnalysis });
        setImgPhase('ready');
      } catch (err) {
        setImgError(err instanceof ApiError ? err.message : 'Could not process this image.');
        setImgPhase('failed');
      }
    } catch {
      setImgError('Unexpected upload error. Please try again.');
      setImgPhase('failed');
    }
  };

  const removeImage = () => {
    patchDraft({ image: null, imageAnalysis: null, verification: null });
    setImgPhase('idle');
    setImgError('');
  };

  const reanalyzeImage = () => {
    if (!draft.image) return;
    setImgPhase('analyzing');
    fetchJson('/api/analyze-image', { method: 'POST', body: { fileId: draft.image.fileId } })
      .then((res) => {
        patchDraft({ imageAnalysis: res.imageAnalysis, verification: null });
        setImgPhase('ready');
      })
      .catch((err) => {
        setImgError(err instanceof ApiError ? err.message : 'Re-analysis failed.');
        setImgPhase('failed');
      });
  };

  /* --------------------------- verification ---------------------------- */
  const canVerify = Boolean(draft.analysis?.isCivicIssue && draft.imageAnalysis && draft.image);
  const runVerification = useCallback(async () => {
    if (!canVerify || draft.verification || verifyBusy) return;
    setVerifyBusy(true);
    try {
      const res = await fetchJson('/api/verify-report', {
        method: 'POST',
        body: {
          textAnalysis: draft.analysis,
          imageAnalysis: draft.imageAnalysis,
          location: draft.location,
        },
      });
      patchDraft({ verification: res.verification });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Verification could not be completed.');
    } finally {
      setVerifyBusy(false);
    }
  }, [canVerify, draft, verifyBusy, patchDraft]);

  useEffect(() => {
    if (step === 4 && canVerify && !draft.verification && !verifyBusy) {
      runVerification();
    }
  }, [step, canVerify, draft.verification, verifyBusy, runVerification]);

  /* ---------------------------- duplicates ----------------------------- */
  const checkDuplicates = async () => {
    if (!Number.isFinite(Number(draft.location?.latitude)) || !Number.isFinite(Number(draft.location?.longitude)) || !draft.analysis) return;
    setDupState('checking');
    try {
      const res = await fetchJson('/api/duplicates', {
        method: 'POST',
        body: {
          complaint: draft.complaint,
          category: draft.analysis.category,
          issue: draft.analysis.issue,
          keywords: draft.analysis.keywords || [],
          location: draft.location,
        },
      });
      patchDraft({ duplicates: res });
      setDupState('done');
    } catch {
      setDupState('done');
    }
  };

  const handleLocationConfirm = async () => {
    await checkDuplicates();
    document.getElementById('step-footer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* ------------------------------ submit ------------------------------- */
  const submitReport = async () => {
    let latitude = Number(draft.location?.latitude);
    let longitude = Number(draft.location?.longitude);
    let hasValidLocation = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
    if (!hasValidLocation) {
      setFormError('Please select a location on the map.');
      go(5);
      return;
    }
    if (!isAuthed) {
      setLoginModal(true);
      return;
    }
    setSubmitBusy(true);
    setFormError('');
    try {
      const res = await fetchJson('/api/reports', {
        method: 'POST',
        body: {
          complaint: draft.complaint,
          analysis: draft.analysis,
          imageFileId: draft.image?.fileId || null,
          imageAnalysis: draft.imageAnalysis,
          verification: draft.verification,
          emergency: draft.emergency,
          duplicateDetection: draft.duplicates,
          location: draft.location,
        },
      });
      setCompleted(res.report);
      patchDraft({ completedAt: new Date().toISOString() });
      setStep(7);
      setMaxReached(7);
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch { /* ignore */ }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setLoginModal(true);
        else setFormError(err.message);
      } else {
        setFormError('Could not submit the report. Please try again.');
      }
    } finally {
      setSubmitBusy(false);
    }
  };

  const analysisIsNonCivic = Boolean(draft.analysis && draft.analysis.isCivicIssue === false);
  const stepReady = useMemo(() => {
    switch (step) {
      case 1: return draft.complaint.trim().length >= 5;
      case 2: return analysisIsNonCivic || Boolean(draft.analysis?.isCivicIssue);
      case 3: return Boolean(draft.image && draft.imageAnalysis);
      case 4: return Boolean(draft.verification);
      case 5: return Number.isFinite(Number(draft.location?.latitude)) && Number.isFinite(Number(draft.location?.longitude));
      case 6: return true;
      default: return false;
    }
  }, [step, draft, analysisIsNonCivic]);

  if (completed) return <SubmissionSuccess report={completed} emergency={draft.emergency} />;

  const canGoNext = stepReady && !analyzing && !verifyBusy && !submitBusy && imgPhase !== 'uploading' && imgPhase !== 'analyzing';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-civic-blue">
            {STEP_COPY[step]?.eyebrow}
          </p>
          <h1 className="mt-1 text-[26px] font-extrabold tracking-tight text-navy-950 sm:text-[30px]">
            {STEP_COPY[step]?.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!completed && (
            <button
              type="button"
              onClick={startOver}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <Eraser size={14} aria-hidden /> Start over
            </button>
          )}
          {!isAuthed && (
            <Badge tone="slate" className="gap-1.5 !py-1.5">
              <UserRound size={12} aria-hidden /> Login needed at submit
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-5">
        <StepIndicator
          current={step}
          maxReached={maxReached}
          onJump={(s) => {
            setDraft((prev) => {
              saveDraft({ ...prev, lastStep: s });
              return prev;
            });
            go(s);
          }}
        />
      </div>

      {resumed && (
        <Alert tone="info" className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Resumed a saved report draft from this browser.</span>
            <button type="button" onClick={() => setResumed(false)} className="text-[13px] font-bold underline">
              Dismiss
            </button>
          </div>
        </Alert>
      )}

      {formError && step !== 7 && (
        <div className="mt-5">
          <Alert tone="danger">{formError}</Alert>
        </div>
      )}

      {/* ------------------------- STEP 1 ------------------------- */}
      {step === 1 && (
        <div className="mt-6 space-y-5 animate-fade-in-up">
          <div className="card !p-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="complaint" className="flex items-center gap-2 text-[14px] font-bold text-slate-800">
                <MessageSquareText size={17} className="text-civic-blue" aria-hidden />
                Describe the problem
              </label>
              <span className="text-[12px] text-slate-400">{draft.complaint.length} / 2000</span>
            </div>
            <textarea
              id="complaint"
              rows={6}
              maxLength={2000}
              placeholder="Example: There is a large garbage pile near my college and it has been there for several days. It is causing a bad smell and stray animals around it…"
              value={draft.complaint}
              onChange={(e) => {
                patchDraft({ complaint: e.target.value });
                if (formError) setFormError('');
              }}
              className="input-base mt-3 resize-y leading-relaxed !py-3.5 text-[15px]"
            />
            <div className="mt-4">
              <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">
                Need inspiration?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {EXAMPLE_ISSUES.map((ex) => (
                  <button
                    key={ex.slice(0, 30)}
                    type="button"
                    onClick={() => patchDraft({ complaint: ex })}
                    className="max-w-full truncate rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-[12px] text-slate-500 transition-colors hover:border-civic-blue hover:text-civic-blue"
                    title={ex}
                  >
                    {ex.length > 70 ? `${ex.slice(0, 70)}…` : ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <VoiceRecorder
            onDone={(text) => {
              patchDraft({ complaint: text });
              if (formError) setFormError('');
            }}
          />

          {analyzing ? (
            <AiProcessing message="AI is understanding your complaint…" />
          ) : (
            <Button
              type="button"
              variant="blue"
              size="lg"
              className="w-full !rounded-xl !py-4 text-[15px] sm:w-auto sm:px-10"
              disabled={!stepReady}
              onClick={runAnalysis}
            >
              <Sparkles size={18} aria-hidden />
              Analyze Complaint
            </Button>
          )}
          <p className="text-[12.5px] text-slate-400">
            
          </p>
        </div>
      )}

      {/* ------------------------- STEP 2 ------------------------- */}
      {step === 2 && (
        <div className="mt-6 space-y-6">
          {analyzing && <AiProcessing message="AI is understanding your complaint…" />}
          {!analyzing && analysisIsNonCivic && (
            <div className="card mx-auto max-w-xl !p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <AlertTriangle size={26} aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy-950">This doesn&apos;t look like a civic issue</h3>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-slate-500">
                {draft.analysis?.reason}
              </p>
              {draft.analysis?.confidence != null && (
                <p className="mt-3 text-[12.5px] text-slate-400">
                  AI confidence: {Math.round((draft.analysis.confidence || 0) * 100)}%
                </p>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button type="button" variant="outline" onClick={() => go(1)}>
                  <ArrowLeft size={16} aria-hidden /> Edit my description
                </Button>
                <Button type="button" variant="primary" onClick={runAnalysis} loading={analyzing}>
                  <Sparkles size={16} aria-hidden /> Re-analyse
                </Button>
              </div>
            </div>
          )}
          {!analyzing && !analysisIsNonCivic && draft.analysis && (
            <>
              <AnalysisPanel
                analysis={draft.analysis}
                priority={draft.priority}
                emergency={draft.emergency}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <Button type="button" variant="outline" onClick={() => go(1)}>
                  <ArrowLeft size={16} aria-hidden /> Edit description
                </Button>
                <Button type="button" variant="blue" size="lg" onClick={() => go(3)}>
                  Looks right — continue <ArrowRight size={16} aria-hidden />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ------------------------- STEP 3 ------------------------- */}
      {step === 3 && (
        <div className="mt-6">
          <ImageEvidence
            image={draft.image}
            phase={imgPhase}
            errorText={imgError}
            analysis={draft.imageAnalysis}
            onFile={uploadAndAnalyze}
            onRemove={removeImage}
            onReanalyze={reanalyzeImage}
          />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="outline" onClick={() => go(2)}>
              <ArrowLeft size={16} aria-hidden /> Back to analysis
            </Button>
            <Button type="button" variant="blue" size="lg" disabled={!canGoNext} onClick={() => go(4)}>
              Continue to verification <ArrowRight size={16} aria-hidden />
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------- STEP 4 ------------------------- */}
      {step === 4 && (
        <div className="mt-6">
          {verifyBusy ? (
            <AiProcessing message="AI is comparing the complaint with the image…" />
          ) : draft.verification ? (
            <>
              <VerificationPanel
                verification={draft.verification}
                textAnalysis={draft.analysis}
                imageAnalysis={draft.imageAnalysis}
              />
              {draft.verification.verificationStatus === 'INVALID' && (
                <Alert tone="warn" className="mt-4">
                  You can still submit this report, but the evidence may not support the
                  complaint. Consider re-uploading a clearer photo of the issue.
                </Alert>
              )}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <Button type="button" variant="outline" onClick={() => go(3)}>
                  <ArrowLeft size={16} aria-hidden /> Change photo
                </Button>
                <Button type="button" variant="blue" size="lg" onClick={() => go(5)}>
                  Continue to location <ArrowRight size={16} aria-hidden />
                </Button>
              </div>
            </>
          ) : (
            <AiProcessing message="Preparing evidence verification…" />
          )}
        </div>
      )}

      {/* ------------------------- STEP 5 ------------------------- */}
      {step === 5 && (
        <div className="mt-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <LocationPicker
              value={draft.location}
              onChange={(loc) => {
                patchDraft({ location: loc, duplicates: null });
                setDupState('idle');
              }}
              onConfirm={handleLocationConfirm}
            />
          </div>
          {dupState !== 'idle' && draft.location && (
            <div className="mt-4">
              <DuplicateCard state={dupState} result={draft.duplicates} hasLocation />
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="outline" onClick={() => go(4)}>
              <ArrowLeft size={16} aria-hidden /> Back to verification
            </Button>
            <Button
              type="button"
              variant="blue"
              size="lg"
              disabled={!stepReady}
              onClick={() => go(6)}
            >
              Continue to review <ArrowRight size={16} aria-hidden />
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------- STEP 6 ------------------------- */}
      {step === 6 && (
        <div className="mt-6">
          <ReviewPanel draft={draft} onJump={(s) => go(s)} />
          {dupState === 'done' && draft.location && (
            <div className="mt-4">
              <DuplicateCard state={dupState} result={draft.duplicates} hasLocation />
            </div>
          )}
          <div
            id="step-footer"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-[14px] font-bold text-navy-950">Ready to submit?</p>
              <p className="text-[12.5px] text-slate-500">
                {isAuthed
                  ? `Submitting as ${user?.name}`
                  : 'You will need to login or create a free account to submit.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => go(5)}>
                <ArrowLeft size={16} aria-hidden /> Edit Report
              </Button>
              <Button
                type="button"
                variant={draft.emergency?.isEmergency ? 'danger' : 'primary'}
                size="lg"
                loading={submitBusy}
                onClick={submitReport}
              >
                <Send size={16} aria-hidden />
                Confirm &amp; Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------- Login required modal ------------------------- */}
      <Modal
        open={loginModal}
        onClose={() => setLoginModal(false)}
        title="Login required"
        subtitle="Secure submission needs an account"
        size="sm"
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Please login or create an account before submitting your civic report. Your draft —
          including the AI analysis, photo and location — will be preserved.
        </p>
        <div className="mt-5 grid gap-2.5">
          <Link href="/login?next=/report" className="btn btn-primary w-full !py-3">
            Login
          </Link>
          <Link href="/signup?next=/report" className="btn btn-blue w-full !py-3">
            Create Account
          </Link>
          <button
            type="button"
            onClick={() => setLoginModal(false)}
            className="btn btn-ghost w-full !py-2.5 text-[13px]"
          >
            I&apos;ll submit later
          </button>
        </div>
        <p className="mt-4 text-center text-[12px] text-slate-400">
          Passwords are hashed · sessions use secure HttpOnly cookies
        </p>
      </Modal>
    </div>
  );
}
