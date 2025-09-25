'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface ChartDataPoint {
  [key: string]: string | number | boolean | undefined
  isHighlighted?: boolean
}

interface SensitivityChartProps {
  title: string
  data: ChartDataPoint[]
  xKey: string
  yKey: string
  xLabel: string
  yLabel: string
  xFormatter?: (value: string | number) => string
  yFormatter?: (value: string | number) => string
  color?: string
  highlightColor?: string
  className?: string
}

export function SensitivityChart({
  title,
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
  xFormatter,
  yFormatter,
  color = 'hsl(var(--primary))',
  highlightColor = 'hsl(var(--destructive))',
  className,
}: SensitivityChartProps) {
  const formatTooltip = (value: string | number, name: string) => {
    const formatter = name === xKey ? xFormatter : yFormatter
    const label = name === xKey ? xLabel : yLabel
    
    return [
      formatter ? formatter(value) : value,
      label
    ]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey={xKey}
                  tickFormatter={xFormatter}
                  className="text-xs"
                />
                <YAxis
                  tickFormatter={yFormatter}
                  className="text-xs"
                />
                <Tooltip
                  formatter={formatTooltip}
                  labelFormatter={(label) => `${xLabel}: ${xFormatter ? xFormatter(label) : label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'calc(var(--radius) - 2px)',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={yKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={(props: { cx: number; cy: number; payload: ChartDataPoint }) => {
                    const { cx, cy, payload } = props
                    const isHighlighted = payload?.isHighlighted
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHighlighted ? 6 : 4}
                        fill={isHighlighted ? highlightColor : color}
                        stroke={isHighlighted ? highlightColor : color}
                        strokeWidth={2}
                      />
                    )
                  }}
                  activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>{xLabel}</span>
            <span>{yLabel}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}