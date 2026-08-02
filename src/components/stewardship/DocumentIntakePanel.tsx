'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InboxIcon, SearchIcon, AlertTriangleIcon } from 'lucide-react'
import {
  DOC_TYPE_LABELS,
  RECEIVED_VIA_LABELS,
  type IntakeDocument,
} from '@/lib/document-intake'

interface DocumentIntakePanelProps {
  documents: IntakeDocument[]
  onReview: (doc: IntakeDocument) => void
}

const STATUS_META: Record<IntakeDocument['status'], { label: string; dot: string }> = {
  'needs-review': { label: 'Needs review', dot: 'bg-amber-500' },
  posted: { label: 'Posted', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', dot: 'bg-red-500' },
}

// The intake queue: documents that arrived (email, portals, uploads), each
// carried through Received -> Extracted -> Validated -> Posted. Reviewers
// open a document to verify extraction against the source before posting.
export function DocumentIntakePanel({ documents, onReview }: DocumentIntakePanelProps) {
  const pending = documents.filter(d => d.status === 'needs-review').length

  return (
    <section>
      <h3 className="text-base font-semibold flex items-center gap-2 mb-1">
        <InboxIcon className="h-4 w-4" />
        Document Intake
        {pending > 0 && <Badge variant="destructive">{pending} to review</Badge>}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        Statements, bills, and reports arrive as documents. Fields are extracted and validated;
        a reviewer verifies against the source before values post to the property record.
      </p>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[130px]">Document</TableHead>
              <TableHead>Type / Sender</TableHead>
              <TableHead>Property</TableHead>
              <TableHead className="w-[130px]">Received</TableHead>
              <TableHead className="text-right w-[80px]">Fields</TableHead>
              <TableHead className="text-right w-[95px]">Flags</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[90px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map(doc => {
              const flags = doc.validations.filter(v => v.status !== 'pass').length
              const meta = STATUS_META[doc.status]
              return (
                <TableRow
                  key={doc.id}
                  className="cursor-pointer"
                  onClick={() => onReview(doc)}
                >
                  <TableCell>
                    <span className="font-mono text-xs">{doc.id}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{DOC_TYPE_LABELS[doc.type]}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.sender} · {RECEIVED_VIA_LABELS[doc.receivedVia]}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{doc.propertyAddress}</p>
                    <p className="text-xs text-muted-foreground">{doc.periodOrDate}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">
                      {new Date(doc.receivedAt).toLocaleString('en-US', {
                        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{doc.extractedFields.length}</TableCell>
                  <TableCell className="text-right">
                    {flags > 0 ? (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                        <AlertTriangleIcon className="h-3 w-3" />
                        {flags}
                      </span>
                    ) : (
                      0
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full shrink-0 ${meta.dot}`} />
                      <span className="text-xs">{meta.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                      <SearchIcon className="h-3.5 w-3.5" />
                      {doc.status === 'needs-review' ? 'Review' : 'View'}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
