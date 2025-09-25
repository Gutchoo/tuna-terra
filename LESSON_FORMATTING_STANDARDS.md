# Lesson Formatting Standards

This document defines the consistent formatting standards for all educational lessons in the CRE Portfolio Management application. These standards ensure visual consistency, accessibility, and professional presentation across all content.

## Table of Contents

1. [Typography Hierarchy](#typography-hierarchy)
2. [Component Styling](#component-styling)
3. [Table Formatting](#table-formatting)
4. [Color and Theme Standards](#color-and-theme-standards)
5. [Spacing and Layout](#spacing-and-layout)
6. [Formula Presentation](#formula-presentation)
7. [Interactive Elements](#interactive-elements)
8. [Animation and Motion](#animation-and-motion)

---

## Typography Hierarchy

### Headings

```jsx
// Main section headings (h2)
<h2 className="text-3xl font-bold mb-6">Section Title</h2>

// Subsection headings (h4)
<h4 className="font-semibold mb-4">🏢 Major Subsection (with emojis)</h4>
<h4 className="font-semibold mb-3">Standard Subsection</h4>
<h4 className="font-semibold mb-3">Card/Component Titles</h4>
```

### Body Text

```jsx
// Main descriptive paragraphs
<p className="text-lg leading-relaxed">Primary content text...</p>

// Secondary text and lists
<ul className="text-sm text-muted-foreground space-y-1">
  <li>• List item with bullet</li>
</ul>

// Strong emphasis
<strong>Emphasized text</strong>
```

### Monospace/Code Text

```jsx
// Financial calculations and formulas
<div className="text-center text-2xl font-mono">Formula = A ÷ B</div>

// Large emphasis formulas
<div className="text-4xl font-mono">Major Formula Display</div>

// Inline calculations
<div className="text-xl font-mono mb-3">Inline calculation</div>
```

---

## Component Styling

### Cards

```jsx
// Main content cards
<Card className="p-6">
  <CardContent className="space-y-6 p-0">
    {/* Content with 24px spacing between elements */}
  </CardContent>
</Card>

// Smaller component cards (in grids)
<Card className="p-4">
  <div className="text-center space-y-3">
    {/* Grid card content */}
  </div>
</Card>

// Cards with bottom margin
<Card className="p-6 mb-6">
```

### Badges

Use semantic color combinations for different content types:

```jsx
// Income/Revenue (Blue)
<Badge className="bg-blue-100 text-blue-700 border-blue-300">
  Gross Income
</Badge>

// Expenses/Costs (Red/Orange)  
<Badge className="bg-red-100 text-red-700 border-red-300">
  Vacancy Loss
</Badge>

<Badge className="bg-orange-100 text-orange-700 border-orange-300">
  Operating Expenses
</Badge>

// Results/Analysis (Green)
<Badge className="bg-green-100 text-green-700 border-green-300">
  Cash Flow
</Badge>

// Balanced/Medium (Yellow)
<Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
  Medium Cap Rate
</Badge>

// Larger badges for section dividers
<Badge className="bg-blue-100 text-blue-700 border-blue-300 text-base">
  Section Badge
</Badge>
```

### Alerts

```jsx
// Insight alerts with icon
<Alert>
  <Lightbulb className="h-4 w-4" />
  <AlertDescription>
    <strong>Think of concept as analogy</strong> - explanatory text
  </AlertDescription>
</Alert>

// Standalone alerts with margin
<Alert className="mt-6">
  <AlertDescription>
    <strong>Key Insight:</strong> Important information
  </AlertDescription>
</Alert>
```

---

## Table Formatting

### Financial Tables

**Critical Rule: Negative numbers MUST use parentheses, NOT red color or minus signs**

```jsx
<Table className="min-w-full bg-background">
  <TableHeader>
    <TableRow>
      <TableHead className="w-48 bg-muted text-muted-foreground font-semibold">
        Line Item
      </TableHead>
      <TableHead className="text-center min-w-32 bg-muted text-muted-foreground font-semibold">
        Year 1
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Regular line items */}
    <TableRow>
      <TableCell className="font-medium">Revenue Item</TableCell>
      <TableCell className="text-center font-mono">$360,000</TableCell>
    </TableRow>
    
    {/* Negative amounts - use parentheses */}
    <TableRow>
      <TableCell className="font-medium">Expense Item</TableCell>
      <TableCell className="text-center font-mono">($18,000)</TableCell>
    </TableRow>
    
    {/* Subtotals */}
    <TableRow className="bg-muted/50">
      <TableCell className="font-semibold">Subtotal</TableCell>
      <TableCell className="text-center font-mono font-semibold">$354,000</TableCell>
    </TableRow>
    
    {/* Final important totals */}
    <TableRow className="border-t border-border mt-2 pt-3">
      <TableCell className="font-bold text-primary">Final Result</TableCell>
      <TableCell className="text-center font-mono font-bold text-primary text-lg">
        $256,000
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Table Hierarchy

1. **Regular items**: `font-medium` for labels, `font-mono` for numbers
2. **Subtotals**: `bg-muted/50`, `font-semibold` 
3. **Final totals**: `font-bold text-primary text-lg`, `border-t`
4. **Headers**: `bg-muted text-muted-foreground font-semibold`

---

## Color and Theme Standards

### Background Colors

```jsx
// Formula and highlight boxes
<div className="bg-muted/30 dark:bg-muted/60 p-6 rounded-lg">

// Information boxes
<div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg">

// Warning/note boxes  
<div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg">

// Success/positive information
<div className="bg-green-50 dark:bg-green-950/30 rounded-lg">
```

### Text Colors

```jsx
// Primary text (default)
className=""

// Secondary/muted text
className="text-muted-foreground"

// Important highlights
className="text-primary"

// Badge-specific colors (see Badge section above)
```

### Dark Mode Support

All colors must include dark mode variants:
- `bg-blue-50 dark:bg-blue-950/30`
- `text-blue-700 dark:text-blue-300`
- `bg-muted/30 dark:bg-muted/60`

---

## Spacing and Layout

### Section Spacing

```jsx
// Main sections
<section id="section-name" className="space-y-6 mb-12">

// Last sections (no bottom margin)
<section id="last-section" className="mb-20 pb-20">
```

### Component Spacing

```jsx
// Between elements in cards
className="space-y-4"  // 16px for regular content
className="space-y-6"  // 24px for main content sections

// Between grid items
<div className="grid gap-6 md:grid-cols-2">

// List item spacing
<ul className="space-y-1">  // 4px between small list items
<ul className="space-y-2">  // 8px between larger list items
```

### Margins

```jsx
// Section titles
className="mb-6"  // 24px after all section headings

// Subsection titles
className="mb-3"  // 12px for most subsection headings
className="mb-4"  // 16px for major subsections with emojis

// Alerts and standalone components
className="mt-6"  // 24px before important alerts
```

---

## Formula Presentation

### Standard Formula Display

```jsx
// Main formula boxes
<div className="bg-muted/30 dark:bg-muted/60 p-6 rounded-lg">
  <h4 className="font-semibold mb-3">Formula Name:</h4>
  <div className="text-center">
    <div className="inline-block">
      <div className="text-lg font-medium mb-2">Result =</div>
      <div className="text-2xl font-mono">
        <div>A</div>
        <div className="border-t border-current py-1"></div>
        <div>B</div>
      </div>
    </div>
  </div>
</div>
```

### Large Emphasis Formulas

```jsx
// For detailed formula explanations
<div className="text-center space-y-6">
  <div className="inline-block">
    <div className="text-2xl font-medium mb-4">Cap Rate =</div>
    <div className="text-4xl font-mono leading-tight">
      <div>NOI</div>
      <div className="border-t-2 border-current my-2"></div>
      <div>Property Value</div>
    </div>
  </div>
</div>
```

### Division/Fraction Standards

- **Always use**: Proper fraction notation with numerator over denominator
- **Never use**: `÷` (division symbol) or `/` (forward slash) in display formulas
- **Exception**: Code examples may use `/` for programming context

#### Fraction Formatting

```jsx
// Standard fraction display
<div className="text-center">
  <div className="text-2xl font-mono">
    <div>NOI</div>
    <div className="border-t border-current py-1"></div>
    <div>Property Value</div>
  </div>
</div>

// Large emphasis fractions
<div className="text-center">
  <div className="text-4xl font-mono leading-tight">
    <div>Numerator</div>
    <div className="border-t-2 border-current my-2"></div>
    <div>Denominator</div>
  </div>
</div>

// Inline fractions in text
<span className="inline-flex flex-col text-center text-base font-mono mx-1">
  <span>A</span>
  <span className="border-t border-current text-xs leading-none">B</span>
</span>
```

---

## Interactive Elements

### Calculators

```jsx
// Embedded calculators
<CalculatorComponent embedded={false} />

// Calculator introduction text
<p className="text-muted-foreground mb-6">
  Use this calculator to explore different scenarios...
</p>
```

### Navigation

```jsx
// Section navigation (handled by LessonLayout)
sections={[
  { id: 'concept', title: 'What is Concept?', completed: false },
  { id: 'calculator', title: 'Interactive Calculator', completed: false },
]}
```

---

## Animation and Motion

### Motion Wrapper Standards

```jsx
<MotionWrapper
  initial={{ opacity: 0, y: 15 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}  // Stagger delays: 0.2, 0.4, 0.6
  viewport={{ once: true }}
>
  {/* Section content */}
</MotionWrapper>
```

### Delay Patterns

- First section: `delay: 0` or no delay
- Second section: `delay: 0.2`
- Third section: `delay: 0.4`
- Continue incrementing by 0.2s

---

## Examples and Patterns

### Complete Section Template

```jsx
<section id="section-id" className="space-y-6 mb-12">
  <MotionWrapper
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    viewport={{ once: true }}
  >
    <h2 className="text-3xl font-bold mb-6">Section Title</h2>
    
    <Card className="p-6">
      <CardContent className="space-y-6 p-0">
        <p className="text-lg leading-relaxed">
          Main content description with <strong>emphasis</strong>.
        </p>
        
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Key insight</strong> - explanatory text.
          </AlertDescription>
        </Alert>

        <div className="bg-muted/30 dark:bg-muted/60 p-6 rounded-lg">
          <h4 className="font-semibold mb-3">Formula Name:</h4>
          <div className="text-center">
            <div className="inline-block">
              <div className="text-lg font-medium mb-2">Result =</div>
              <div className="text-2xl font-mono">
                <div>Input</div>
                <div className="border-t border-current py-1"></div>
                <div>Base Value</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </MotionWrapper>
</section>
```

---

## Quality Checklist

Before publishing any lesson, verify:

- [ ] All section headings use `text-3xl font-bold mb-6`
- [ ] Financial tables use parentheses for negative numbers
- [ ] All formulas use proper fraction notation (numerator/line/denominator)  
- [ ] Cards have appropriate padding (`p-6` or `p-4`)
- [ ] Color schemes include dark mode variants
- [ ] Motion delays follow 0.2s increment pattern
- [ ] All text follows typography hierarchy
- [ ] Spacing follows established patterns
- [ ] No red text used for negative financial numbers

---

## File Structure

Lessons should follow this component structure:

```
src/app/education/[slug]/page.tsx
├── LessonLayout wrapper
├── Multiple sections with MotionWrapper
├── Consistent imports from @/components/ui/
└── Proper metadata and navigation
```

## Related Files

- `/src/components/education/LessonLayout.tsx` - Layout wrapper
- `/src/components/education/MotionWrapper.tsx` - Animation wrapper  
- `/src/components/education/AnimatedExplainer.tsx` - Formula explanations
- `/src/lib/education.ts` - Lesson registry and metadata