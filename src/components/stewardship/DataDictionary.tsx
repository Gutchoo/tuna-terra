'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SearchIcon } from 'lucide-react'
import {
  DATA_DICTIONARY,
  CATEGORY_LABELS,
  SOURCE_LABELS,
  type DataDictionaryEntry,
} from '@/lib/data-dictionary'

const SOURCE_STYLES: Record<DataDictionaryEntry['source'], string> = {
  'county-assessor': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'geocoding': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'user-entered': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'derived': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
}

// The field catalog a reference-data team publishes: definition, type,
// source system, lineage, and update cadence for every maintained field.
export function DataDictionary() {
  const [query, setQuery] = useState('')

  const grouped = useMemo(() => {
    const q = query.toLowerCase().trim()
    const filtered = q
      ? DATA_DICTIONARY.filter(e =>
          [e.field, e.label, e.lineage, e.notes ?? '', SOURCE_LABELS[e.source]].join(' ').toLowerCase().includes(q)
        )
      : DATA_DICTIONARY

    const byCategory = new Map<DataDictionaryEntry['category'], DataDictionaryEntry[]>()
    for (const entry of filtered) {
      const list = byCategory.get(entry.category) || []
      list.push(entry)
      byCategory.set(entry.category, list)
    }
    return byCategory
  }, [query])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-semibold">Data Dictionary</h3>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">
            The reference catalog for every field this platform maintains — data type, source system,
            lineage, and update cadence. Published so downstream consumers know exactly what each field
            means and where it came from.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fields, lineage…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {Array.from(grouped.entries()).map(([category, entries]) => (
        <section key={category}>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            {CATEGORY_LABELS[category]}
          </h4>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[180px]">Field</TableHead>
                  <TableHead className="w-[90px]">Type</TableHead>
                  <TableHead className="w-[170px]">Source</TableHead>
                  <TableHead>Lineage</TableHead>
                  <TableHead className="w-[190px]">Update Cadence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(entry => (
                  <TableRow key={entry.field} className="align-top">
                    <TableCell>
                      <p className="font-medium text-sm">{entry.label}</p>
                      <p className="font-mono text-xs text-muted-foreground">{entry.field}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{entry.dataType}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs font-normal ${SOURCE_STYLES[entry.source]}`}>
                        {SOURCE_LABELS[entry.source]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground max-w-md">{entry.lineage}</p>
                      {entry.notes && (
                        <p className="text-xs mt-1 max-w-md">
                          <span className="font-medium">Note:</span>{' '}
                          <span className="text-muted-foreground">{entry.notes}</span>
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">{entry.updateCadence}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ))}

      {grouped.size === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No fields match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
