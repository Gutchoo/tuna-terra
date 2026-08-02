'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  InfoIcon,
  CheckCircle2Icon,
  FileTextIcon,
  ArrowRightIcon,
} from 'lucide-react'
import {
  DOC_TYPE_LABELS,
  RECEIVED_VIA_LABELS,
  type IntakeDocument,
} from '@/lib/document-intake'

interface DocumentReviewSheetProps {
  doc: IntakeDocument | null
  onOpenChange: (open: boolean) => void
  onDecide: (doc: IntakeDocument, decision: 'posted' | 'rejected', note: string) => void
  onOpenProperty?: (propertyId: string) => void
}

const CHECK_ICONS = {
  pass: <CheckCircle2Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
  warn: <AlertTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
  fail: <XIcon className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
}

const fmt = (v: string | number | null) => {
  if (v === null) return '—'
  if (typeof v === 'number') {
    return Number.isInteger(v) && Math.abs(v) >= 1000
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
      : String(v)
  }
  return v
}

// Extraction review: source document on top, extracted fields below with
// per-field confidence and current-vs-extracted comparison, then validation
// results. The reviewer posts or rejects with a note for the audit log.
export function DocumentReviewSheet({
  doc,
  onOpenChange,
  onDecide,
  onOpenProperty,
}: DocumentReviewSheetProps) {
  const [note, setNote] = useState('')

  useEffect(() => {
    setNote('')
  }, [doc?.id])

  if (!doc) return null

  const warnings = doc.validations.filter(v => v.status !== 'pass').length
  const readOnly = doc.status !== 'needs-review'
  const changedFields = doc.extractedFields.filter(
    f => f.field && String(f.value) !== String(f.currentValue ?? '')
  ).length

  return (
    <Sheet open={doc !== null} onOpenChange={onOpenChange}>
      {/* z-60: stays above the property modal when both are open */}
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto z-[60]">
        <SheetHeader className="pb-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            {DOC_TYPE_LABELS[doc.type]}
            <Badge variant="outline" className="text-xs font-normal font-mono">{doc.id}</Badge>
            {readOnly && (
              <Badge variant="secondary" className="text-xs capitalize">{doc.status}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            <button
              type="button"
              className="hover:underline"
              onClick={() => onOpenProperty?.(doc.propertyId)}
            >
              {doc.propertyAddress}
            </button>
            {' '}· {doc.sender} · {RECEIVED_VIA_LABELS[doc.receivedVia]} ·{' '}
            {new Date(doc.receivedAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-5">
          {/* Source document, rendered */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
              <FileTextIcon className="h-3.5 w-3.5" />
              Source document
            </p>
            <div className="rounded-md border bg-card shadow-sm px-4 py-3 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto">
              {doc.lines.map((line, i) =>
                line.separator ? (
                  <hr key={i} className="my-2 border-border" />
                ) : (
                  <div
                    key={i}
                    className={`flex justify-between gap-4 ${line.bold ? 'font-semibold' : ''} ${
                      line.highlight ? 'bg-blue-500/10 -mx-1 px-1 rounded-sm' : ''
                    }`}
                    style={line.indent ? { paddingLeft: line.indent * 12 } : undefined}
                  >
                    <span className="whitespace-pre-wrap">{line.text}</span>
                    {line.rightText && <span className="tabular-nums shrink-0">{line.rightText}</span>}
                  </div>
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Highlighted lines are where fields were extracted from.
            </p>
          </div>

          {/* Extracted fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Extracted fields
              </p>
              <Badge variant="outline" className="text-xs font-normal">
                {changedFields} of {doc.extractedFields.length} change the record
              </Badge>
            </div>
            <div className="rounded-md border divide-y">
              {doc.extractedFields.map(field => {
                const changed = field.field && String(field.value) !== String(field.currentValue ?? '')
                const lowConfidence = field.confidence < 0.95
                return (
                  <div key={field.label} className="px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{field.label}</p>
                      <span
                        className={`text-xs tabular-nums ${
                          lowConfidence ? 'text-amber-700 dark:text-amber-400 font-medium' : 'text-muted-foreground'
                        }`}
                        title="Extraction confidence"
                      >
                        {(field.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm flex-wrap mt-0.5">
                      <span className="text-muted-foreground">{fmt(field.currentValue)}</span>
                      <ArrowRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className={changed ? 'font-medium' : 'text-muted-foreground'}>
                        {fmt(field.value)}
                      </span>
                      {!changed && (
                        <span className="text-xs text-muted-foreground">(no change)</span>
                      )}
                      {field.field == null && (
                        <Badge variant="secondary" className="text-xs font-normal">informational</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Read as <span className="font-mono">&ldquo;{field.rawText}&rdquo;</span>
                      {field.field && (
                        <> · posts to <span className="font-mono">{field.field}</span></>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Validations */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Validation checks
              </p>
              {warnings > 0 ? (
                <Badge variant="secondary" className="text-xs border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  {warnings} of {doc.validations.length} checks flagged
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  {doc.validations.length} checks passed
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2.5">
              {warnings > 0
                ? 'Automated screens found items to verify before posting.'
                : 'Automated screens found no issues — extraction is consistent with the record.'}
            </p>
            <div className="space-y-2.5">
              {doc.validations.map(check => (
                <div key={check.label} className="flex gap-2">
                  {CHECK_ICONS[check.status]}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{check.label}</p>
                    <p className="text-xs text-muted-foreground">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!readOnly && (
            <>
              <Separator />

              {/* Decision note */}
              <div className="space-y-1.5">
                <Label htmlFor="doc-review-note" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Review note
                </Label>
                <Textarea
                  id="doc-review-note"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Anything verified or reconciled during review — recorded in the audit log."
                  rows={3}
                />
              </div>

              {/* Decision */}
              <div className="flex gap-2 pb-6">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => onDecide(doc, 'rejected', note)}
                >
                  <XIcon className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="flex-1 gap-1.5"
                  onClick={() => onDecide(doc, 'posted', note)}
                >
                  <CheckIcon className="h-4 w-4" />
                  Post to record
                </Button>
              </div>
            </>
          )}
          {readOnly && <div className="pb-6" />}
        </div>
      </SheetContent>
    </Sheet>
  )
}
