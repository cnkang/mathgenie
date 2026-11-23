import type { PaperSizeOptions, Problem, Settings } from "@/types";
import {
  getMinimumPdfLineSpacing,
  PDF_FONT_SIZE_RANGE,
  PDF_MAX_LINE_SPACING,
  type PdfLabels,
  type PreparedPdf,
  prepareAnswerKeyPdf,
  preparePdf,
} from "@/utils/pdf";
import { useEffect, useId, useRef, useState } from "react";
import "./PdfPreview.css";

const largePrint = { font: 24, spacing: 40 };
const paperSizeNames: Record<string, string> = {
  a4: "A4",
  letter: "Letter",
  legal: "Legal",
};

type PdfPreviewProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  problems: Problem[];
  settings: Settings;
  paperSizes: PaperSizeOptions;
  labels: PdfLabels;
  onClose: () => void;
  onDownload: (pdf: PreparedPdf, filename?: string) => Promise<void>;
};

type PreviewMeasureProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

function PreviewMeasure({ label, value, min, max, onChange }: Readonly<PreviewMeasureProps>) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step="any"
        min={min}
        max={max}
        required
        value={draft ?? value}
        onChange={(event) => {
          const input = event.currentTarget;
          setDraft(input.value);
          if (input.validity.valid && Number.isFinite(input.valueAsNumber)) {
            onChange(input.valueAsNumber);
          }
        }}
        onBlur={() => setDraft(null)}
      />
    </div>
  );
}

function PdfPreview({
  t,
  problems,
  settings,
  paperSizes,
  labels,
  onClose,
  onDownload,
}: Readonly<PdfPreviewProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pageViewportRef = useRef<HTMLElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const viewModeName = useId();
  const pageInputId = useId();
  const paperSizeId = useId();
  const answerHelpId = useId();
  const [paperSize, setPaperSize] = useState(settings.paperSize);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [requestedSpacing, setRequestedSpacing] = useState(settings.lineSpacing);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [prepared, setPrepared] = useState<PreparedPdf | "error" | null>(null);
  const [isPreparingAnswerKey, setIsPreparingAnswerKey] = useState(false);
  const [answerKeyError, setAnswerKeyError] = useState(false);
  const answerKeyControllerRef = useRef<AbortController | null>(null);
  const minimumSpacing = getMinimumPdfLineSpacing(fontSize);
  const lineSpacing = Math.max(requestedSpacing, minimumSpacing);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setPrepared(null);
    preparePdf(
      problems,
      { ...settings, paperSize, fontSize, lineSpacing },
      paperSizes,
      labels,
      includeAnswers,
      controller.signal,
    ).then(
      (document) => {
        if (!controller.signal.aborted) setPrepared(document);
      },
      () => {
        if (!controller.signal.aborted) setPrepared("error");
      },
    );
    return () => controller.abort();
  }, [problems, settings, paperSizes, paperSize, fontSize, lineSpacing, labels, includeAnswers]);

  const handlePreviewClose = () => {
    answerKeyControllerRef.current?.abort();
    answerKeyControllerRef.current = null;
    onClose();
  };

  const downloadAnswerKey = async () => {
    if (problems.length === 0 || isPreparingAnswerKey) return;
    const controller = new AbortController();
    answerKeyControllerRef.current = controller;
    setAnswerKeyError(false);
    setIsPreparingAnswerKey(true);
    try {
      const answerPdf = await prepareAnswerKeyPdf(
        problems,
        { ...settings, paperSize, fontSize, lineSpacing },
        paperSizes,
        labels,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      answerKeyControllerRef.current = null;
      setIsPreparingAnswerKey(false);
      dialogRef.current?.close();
      void onDownload(answerPdf, "mathgenie-answer-key.pdf");
    } catch {
      if (!controller.signal.aborted) setAnswerKeyError(true);
    } finally {
      if (answerKeyControllerRef.current === controller) {
        answerKeyControllerRef.current = null;
      }
      if (!controller.signal.aborted && dialogRef.current?.open) {
        setIsPreparingAnswerKey(false);
      }
    }
  };

  const pdf = prepared === "error" ? null : prepared;
  const pageCount = pdf?.pages.length ?? 1;
  const firstAnswerPage = pdf?.pages.findIndex(({ kind }) => kind === "answerKey") ?? -1;
  const pageIndex = Math.min(selectedPage ?? Math.max(0, firstAnswerPage), pageCount - 1);
  const page = pdf?.pages[pageIndex];
  const pageLabel = page?.kind === "answerKey" ? t("pdf.answerKey") : t("pdf.worksheet");

  useEffect(() => {
    if (pageInputRef.current) pageInputRef.current.value = String(pageIndex + 1);
  }, [pdf, pageIndex]);

  useEffect(() => {
    pageViewportRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [page, isZoomed]);

  return (
    <dialog
      className="pdf-preview"
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handlePreviewClose}
    >
      <header className="pdf-preview-header">
        <h2 id={titleId}>{t("pdf.previewTitle")}</h2>
        <button type="button" onClick={() => dialogRef.current?.close()}>
          {t("pdf.closePreview")}
        </button>
      </header>
      <div className="pdf-preview-layout">
        <div className="pdf-preview-stage" aria-busy={prepared === null}>
          <fieldset className="pdf-preview-view">
            <legend className="sr-only">{t("pdf.previewSize")}</legend>
            {[false, true].map((zoomed) => {
              const labelKey = zoomed ? "pdf.zoomPage" : "pdf.fitPage";
              return (
                <label key={labelKey}>
                  <input
                    type="radio"
                    name={viewModeName}
                    className="sr-only"
                    checked={isZoomed === zoomed}
                    onChange={() => setIsZoomed(zoomed)}
                  />
                  <span>{t(labelKey)}</span>
                </label>
              );
            })}
          </fieldset>
          <section
            className="pdf-preview-canvas"
            data-zoomed={isZoomed}
            ref={pageViewportRef}
            aria-label={pageLabel}
            tabIndex={-1}
          >
            {prepared === null && <output>{t("pdf.preparingPreview")}</output>}
            {prepared === "error" && <p role="alert">{t("errors.pdfFailed")}</p>}
            {pdf && page && (
              <div
                className="pdf-preview-page"
                style={{
                  aspectRatio: `${pdf.width} / ${pdf.height}`,
                  maxWidth: `calc(var(--pdf-preview-sheet-height) * ${(pdf.width / pdf.height) * (isZoomed ? 2 : 1)})`,
                }}
              >
                {[
                  ...(page.studentInfo?.lines ?? []),
                  ...page.lines,
                  ...(page.pageNumber ? [page.pageNumber] : []),
                ].map(({ text, x, y, size }) => (
                  <span
                    key={`${x}-${y}`}
                    className="pdf-preview-line"
                    style={{
                      left: `${(x / pdf.width) * 100}%`,
                      top: `${(y / pdf.height) * 100}%`,
                      fontSize: `${(size / pdf.width) * 100}cqw`,
                    }}
                  >
                    {text}
                  </span>
                ))}
                {[
                  ...(page.studentInfo?.rules ?? []).map((rule) => ({
                    rule,
                    className: "pdf-preview-student-rule",
                  })),
                  ...page.answerRules.map((rule) => ({
                    rule,
                    className: "pdf-preview-answer-rule",
                  })),
                  ...(page.decorativeRules ?? []).map((rule) => ({
                    rule,
                    className: "pdf-preview-decoration-rule",
                  })),
                ].map(({ rule: { x, y, width }, className }) => (
                  <span
                    key={`${className}-${x}-${y}`}
                    className={`pdf-preview-rule ${className}`}
                    aria-hidden="true"
                    style={{
                      left: `${(x / pdf.width) * 100}%`,
                      top: `${(y / pdf.height) * 100}%`,
                      width: `${(width / pdf.width) * 100}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </section>
          {pdf && (
            <div className="pdf-preview-pagination">
              <button
                type="button"
                aria-label={t("results.previousPage")}
                disabled={pageIndex === 0}
                onClick={() => setSelectedPage(pageIndex - 1)}
              >
                ←
              </button>
              <div className="pdf-preview-page-navigation">
                <output aria-live="polite">
                  {pageLabel} · {t("results.page", { page: pageIndex + 1, pages: pageCount })}
                </output>
                {pageCount > 1 && (
                  <form
                    className="pdf-preview-jump"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const input = pageInputRef.current;
                      if (!input?.validity.valid) return;
                      const destination = input.valueAsNumber;
                      input.value = String(destination);
                      setSelectedPage(destination - 1);
                      pageViewportRef.current?.focus();
                    }}
                  >
                    <label htmlFor={pageInputId} className="sr-only">
                      {t("pdf.pageNumber")}
                    </label>
                    <input
                      ref={pageInputRef}
                      id={pageInputId}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={pageCount}
                      step={1}
                      required
                      defaultValue={pageIndex + 1}
                    />
                    <button type="submit">{t("pdf.goToPage")}</button>
                  </form>
                )}
              </div>
              <button
                type="button"
                aria-label={t("results.nextPage")}
                disabled={pageIndex >= pageCount - 1}
                onClick={() => setSelectedPage(pageIndex + 1)}
              >
                →
              </button>
            </div>
          )}
        </div>
        <div className="pdf-preview-options">
          <div className="pdf-preview-paper-select">
            <label htmlFor={paperSizeId}>{t("pdf.paperSize")}</label>
            <select
              id={paperSizeId}
              value={paperSize}
              onChange={(event) => {
                const nextSize = Object.values(paperSizes).find(
                  (size) => size === event.target.value,
                );
                if (!nextSize || nextSize === paperSize) return;
                setPrepared(null);
                setPaperSize(nextSize);
              }}
            >
              {Object.values(paperSizes).map((size) => (
                <option key={size} value={size}>
                  {paperSizeNames[size] ?? size}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="pdf-preview-large-print"
            onClick={() => {
              if (fontSize === largePrint.font && lineSpacing === largePrint.spacing) return;
              setPrepared(null);
              setFontSize(largePrint.font);
              setRequestedSpacing(largePrint.spacing);
            }}
          >
            {t("pdf.largePrint")}
            <span>{t("pdf.largePrintDetails", largePrint)}</span>
          </button>
          <div className="pdf-preview-type-options">
            <PreviewMeasure
              label={t("pdf.fontSize")}
              value={fontSize}
              {...PDF_FONT_SIZE_RANGE}
              onChange={(value) => {
                if (value === fontSize) return;
                setPrepared(null);
                setFontSize(value);
              }}
            />
            <PreviewMeasure
              label={t("pdf.lineSpacing")}
              value={lineSpacing}
              min={minimumSpacing}
              max={PDF_MAX_LINE_SPACING}
              onChange={(value) => {
                if (value === lineSpacing) return;
                setPrepared(null);
                setRequestedSpacing(value);
              }}
            />
          </div>
          <label className="pdf-preview-answer-option">
            <input
              type="checkbox"
              checked={includeAnswers}
              aria-describedby={answerHelpId}
              onChange={(event) => {
                setPrepared(null);
                setSelectedPage(null);
                setIncludeAnswers(event.target.checked);
              }}
            />
            {t("pdf.includeAnswerKey")}
          </label>
          <p className="pdf-preview-help" id={answerHelpId}>
            {t("pdf.answerKeyHelp")}
          </p>
          <button
            type="button"
            className="pdf-preview-download"
            disabled={!pdf}
            onClick={() => {
              if (!pdf) return;
              dialogRef.current?.close();
              void onDownload(pdf);
            }}
          >
            {t("buttons.download")}
          </button>
          <button
            type="button"
            className="pdf-preview-download-answer-key"
            aria-busy={isPreparingAnswerKey}
            disabled={problems.length === 0 || isPreparingAnswerKey}
            onClick={() => void downloadAnswerKey()}
          >
            {t(isPreparingAnswerKey ? "pdf.preparingAnswerKey" : "pdf.downloadAnswerKeyOnly")}
          </button>
          {answerKeyError && (
            <p className="pdf-preview-download-error" role="alert">
              {t("errors.pdfFailed")}
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}

export default PdfPreview;
