# Implementation Plan: Expense & Budget Visualizer

## Overview

A fully client-side single-page application using plain HTML5, CSS3, and Vanilla JavaScript. No npm, no build tools, no external libraries. All logic lives in `js/script.js`, all styling in `css/style.css`, and structure in `index.html`. Data is persisted via `localStorage`. The UI follows a SaaS dashboard design with a fixed dark sidebar, sticky topbar, and a four-row main content area.

## Tasks

- [x] 1. Build the HTML structure in `index.html`
  - [x] 1.1 Set up document head: charset, viewport, title ("Spendly — Expense & Budget Visualizer"), Google Fonts preconnect + Inter font link, `<link>` to `css/style.css`, `<script defer>` to `js/script.js`
  - [x] 1.2 Add `#warning-banner` div with `role="alert" aria-live="polite"` (hidden by default via CSS)
  - [x] 1.3 Build the `.app-shell` wrapper containing `<aside class="sidebar">` and `<main class="main-content">`
  - [x] 1.4 Build the sidebar: logo lockup (`.sidebar-logo`), `<nav class="sidebar-nav" aria-label="Site sections">` with three `<ul role="list">` groups (Overview, Manage, Analytics), and `<footer class="sidebar-footer">` containing `#clear-all-btn` with `.sidebar-danger-btn` styling
    - Sidebar nav links: Dashboard (`#kpi-row`), Add Expense (`#panel-add-expense`), Set Budget (`#panel-set-budget`), Charts (`#panel-charts`), Summary (`#panel-summary`), Transactions (`#panel-expenses`)
    - All decorative SVGs: `aria-hidden="true" focusable="false"`
  - [x] 1.5 Build the sticky topbar (`<header class="topbar">`): `<h1 class="topbar-title">Dashboard</h1>`, subtitle paragraph, and Live badge (`.topbar-badge` with animated `.badge-dot`)
  - [x] 1.6 Build ROW 1 — KPI cards: `<section aria-labelledby="kpi-heading" id="kpi-row">` with `<h2 class="sr-only">`, then `.kpi-row` grid containing four `<article class="kpi-card">` elements:
    - `kpi-purple`: Total Spent — `#stat-total` (value), `#stat-count` (sub-label)
    - `kpi-green`: Budgets Active — `#stat-budgets`
    - `kpi-red`: Over Budget — `#stat-over`
    - `kpi-blue`: Categories — `#stat-categories`
  - [x] 1.7 Build ROW 2 — Forms row: `.forms-row` flex container with two `.forms-row-item` sections:
    - Add Expense (`#panel-add-expense`): `<article class="card card-stretch">`, `<form id="expense-form" novalidate>`, 2×2 `.form-row-2` grid (amount + category / date + description), each field in `.field-group` with label, input/select, and `<span class="error-msg" role="alert" aria-live="polite">` with `aria-describedby` on inputs
    - Set Budget (`#panel-set-budget`): `<article class="card card-stretch">`, `<form id="budget-form" novalidate class="form-stretch">`, `.form-row-2` grid (category + amount), `.form-spacer` to push button down, submit button
    - _Requirements: 1.1, 4.1_
  - [x] 1.8 Build ROW 3 — Charts row: `.charts-row` flex container with `<h2 class="sr-only">Spending charts</h2>`, two `.charts-row-item` sections each containing an `<article class="card">` with `<header class="card-header">`, `<div class="card-body chart-body">`, `<figure>`, and `<canvas>`:
    - Bar chart: `id="bar-chart"` `width="520"` `height="240"` `role="img"` with `aria-label` and `<figcaption class="sr-only">`
    - Pie chart: `id="pie-chart"` `width="520"` `height="240"` `role="img"` with `aria-label` and `<figcaption class="sr-only">`
    - _Requirements: 5.5_
  - [x] 1.9 Build ROW 4 — Dashboard grid: `.dashboard-grid` with `.dashboard-col-main` (left) and `.dashboard-col-side` (right):
    - Left col: Filter card (`#filter-controls`) with `.filter-inline` in card-header containing From date, To date, Category select, and `#clear-filters-btn`; Transactions card (`#panel-expenses`) with `#expense-count-badge` in header and `#expense-list` div (`aria-live="polite"`)
    - Right col: Budget Summary card (`#panel-summary`) with `#summary` div (`aria-live="polite" aria-relevant="all"`)
    - _Requirements: 2.1, 3.1, 6.1, 7.1_

- [x] 2. Implement the State object and Storage Module in `js/script.js`
  - [x] 2.1 Define `CATEGORIES` constant array (`['Food','Transport','Entertainment','Health','Housing','Shopping','Other']`) and `state` object with `expenses[]`, `budgets{}`, `filters{startDate, endDate, category}`
    - _Requirements: 1.1, 4.1, 8.1_
  - [x] 2.2 Implement `StorageModule.save()` — serializes `state.expenses` and `state.budgets` to `localStorage` under keys `"ebv_expenses"` and `"ebv_budgets"`
    - _Requirements: 8.1_
  - [x] 2.3 Implement `StorageModule.load()` — reads both keys from `localStorage`, parses JSON, populates `state`; wraps in `try/catch` and falls back to empty state + calls `RenderModule.showWarningBanner('Could not load saved data. Starting fresh.')` on error
    - _Requirements: 8.2, 8.3_
  - [x] 2.4 Implement `StorageModule.clear()` — removes both `localStorage` keys and resets `state.expenses = []` and `state.budgets = {}`
    - _Requirements: 9.3_

- [x] 3. Implement the Validation Module in `js/script.js`
  - [x] 3.1 Implement `ValidationModule.validateExpense(formData)` — checks `amount > 0`, `category` not empty, `date` not empty; returns `{ valid, errors }` map keyed by field name
    - _Requirements: 1.4, 1.5, 1.6_
  - [x] 3.2 Implement `ValidationModule.validateBudget(formData)` — checks `amount > 0`, `category` not empty; returns `{ valid, errors }`
    - _Requirements: 4.4_

- [x] 4. Implement the Filter Module in `js/script.js`
  - [x] 4.1 Implement `FilterModule.apply(expenses, filters)` — chains date-range filter (ISO string lexicographic comparison) then category filter; returns filtered array without mutating the original
    - _Requirements: 7.2_
  - [x] 4.2 Implement `FilterModule.clear()` — resets `state.filters.startDate`, `state.filters.endDate`, `state.filters.category` to `null`
    - _Requirements: 7.3_

- [x] 5. Implement the Render Module in `js/script.js`
  - [x] 5.1 Implement `RenderModule._formatCurrency(amount)` — formats number as USD string using `toLocaleString`
  - [x] 5.2 Implement `RenderModule.renderExpenseList(expenses)` — clears `#expense-list`; updates `#expense-count-badge`; renders `.expense-table` with columns Amount, Category, Description, Date, (delete); sorts by date descending (copy, no mutation); renders `.empty-state` block when empty
    - _Requirements: 2.1, 2.2, 2.3, 3.1_
  - [x] 5.3 Implement `RenderModule.renderSummary(expenses, budgets)` — aggregates spending per category; collects all categories with spending or a budget; renders `.summary-table` with columns Category, Spending, Budget, Progress; applies `tr.over-budget` class and `.over-budget-badge` when spending > budget; renders `.budget-progress-wrap` with `.budget-progress-fill.over` when over budget; renders `.empty-state` when no data
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 5.4 Implement `RenderModule.renderValidationErrors(errors, formId)` — finds `${formId}-${field}-error` spans and sets their `textContent`; and `RenderModule.clearValidationErrors(formId)` — clears all `.error-msg` spans within the form
    - _Requirements: 1.4, 1.5, 1.6, 4.4_
  - [x] 5.5 Implement `RenderModule.showWarningBanner(message)` — sets `#warning-banner` textContent and `style.display = 'block'`
    - _Requirements: 8.3_
  - [x] 5.6 Implement `RenderModule.renderStatCards(expenses, budgets)` — updates `#stat-total` (formatted total), `#stat-count` (transaction count sub-label), `#stat-budgets` (budget count), `#stat-over` (over-budget category count)
    - _Requirements: 10.2, 10.3, 10.4_
  - [x] 5.7 Implement `RenderModule.refresh()` — calls `FilterModule.apply` once, then calls `renderStatCards`, `renderExpenseList`, `renderSummary`, `ChartModule.drawBarChart`, `ChartModule.drawPieChart` with current filtered state
    - _Requirements: 3.3, 4.5, 5.3, 6.4, 7.4_

- [x] 6. Implement the Chart Module in `js/script.js`
  - [x] 6.1 Define `ChartModule._PALETTE` — 10-color array: `['#6366f1','#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#14b8a6','#f97316','#06b6d4','#84cc16']`
  - [x] 6.2 Implement `ChartModule._colorFor(index)` — returns `_PALETTE[index % _PALETTE.length]`
  - [x] 6.3 Implement `ChartModule._aggregateByCategory(expenses)` — returns `{ [category]: totalAmount }` object
  - [x] 6.4 Implement `ChartModule.drawBarChart(canvas, expenses, budgets)` — clears canvas; renders "No data" text when empty; draws y-axis gridlines + labels, x-axis baseline, one colored bar per spending category, dashed red budget reference line for categories with a budget, truncated x-axis category labels
    - _Requirements: 5.1, 5.4, 5.5, 5.6_
  - [x] 6.5 Implement `ChartModule.drawPieChart(canvas, expenses)` — clears canvas; renders "No data" text when empty; draws one arc per category with non-zero spending proportional to total (starting at 12 o'clock), white 1.5px separators between slices, color legend below the pie (color swatch + category name)
    - _Requirements: 5.2, 5.5, 5.6_

- [x] 7. Implement event handlers and `init()` in `js/script.js`
  - [x] 7.1 Implement `handleExpenseFormSubmit(event)` — reads form fields, calls `clearValidationErrors` then `validateExpense`; on failure calls `renderValidationErrors`; on success creates Expense object (`id: \`${Date.now()}-${Math.random()}\``, parsed amount, category, description, date), pushes to `state.expenses`, calls `StorageModule.save()`, resets form, calls `RenderModule.refresh()`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [x] 7.2 Implement `handleExpenseListClick(event)` — event-delegated on `#expense-list`; checks `event.target.classList.contains('btn-delete')`; reads `data-id`; filters `state.expenses`; calls `StorageModule.save()` and `RenderModule.refresh()`
    - _Requirements: 3.2, 3.3_
  - [x] 7.3 Implement `handleBudgetFormSubmit(event)` — reads form fields, calls `clearValidationErrors` then `validateBudget`; on failure calls `renderValidationErrors`; on success sets `state.budgets[category] = parseFloat(amount)`, calls `StorageModule.save()` and `RenderModule.refresh()`
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [x] 7.4 Implement `handleFilterChange()` — reads `filter-start-date`, `filter-end-date`, `filter-category` values into `state.filters` (empty string → null); calls `RenderModule.refresh()`
    - _Requirements: 7.1, 7.2_
  - [x] 7.5 Implement `handleClearFilters()` — calls `FilterModule.clear()`, resets all three filter DOM fields to `''`, calls `RenderModule.refresh()`
    - _Requirements: 7.3_
  - [x] 7.6 Implement `handleClearAll()` — calls `window.confirm()`; on confirm calls `StorageModule.clear()`, `FilterModule.clear()`, resets filter DOM fields, calls `RenderModule.refresh()`; on cancel takes no action
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 7.7 Implement `init()` — populates `#expense-category`, `#budget-category`, and `#filter-category` selects from `CATEGORIES`; attaches all event listeners (expense form submit, expense-list click delegation, budget form submit, three filter field change events, clear-filters click, clear-all click); calls `StorageModule.load()` then `RenderModule.refresh()`; wires to `DOMContentLoaded`
    - _Requirements: 1.1, 4.1, 8.2_

- [x] 8. Style the application in `css/style.css` — SaaS dashboard design
  - [x] 8.1 Define CSS custom properties (design tokens): brand colors (`--brand`, `--brand-dark`, `--brand-light`, `--brand-mid`), gray scale (`--gray-0` through `--gray-900`), semantic colors (`--green`, `--red`, `--blue`, `--amber` with `-bg` and `-dark` variants), layout vars (`--sidebar-w: 220px`, `--topbar-h: 56px`), border radii (`--r-sm`, `--r-md`, `--r-lg`), shadows (`--shadow-xs`, `--shadow-sm`, `--shadow-md`), focus ring (`--glow`)
  - [x] 8.2 Import Inter from Google Fonts; apply CSS reset (`box-sizing: border-box`, zero margin/padding); set body font, background (`--gray-100`), and line-height
  - [x] 8.3 Style `.sr-only` utility class (visually hidden, accessible)
  - [x] 8.4 Style `#warning-banner` (hidden by default, amber background, amber border-bottom)
  - [x] 8.5 Style app shell: `.app-shell` (flex), `.sidebar` (fixed, 220px, `--gray-900`), `.main-content` (`margin-left: var(--sidebar-w)`, flex column)
  - [x] 8.6 Style sidebar internals: `.sidebar-logo`, `.sidebar-logo-icon` (brand color square), `.sidebar-logo-text`, `.sidebar-logo-sub`, `.sidebar-nav`, `.sidebar-nav-list`, `.sidebar-section-label`, `.sidebar-link` (hover + `.active` states), `.sidebar-footer`, `.sidebar-danger-btn` (red, hover red tint)
  - [x] 8.7 Style topbar: `.topbar` (sticky, 56px, white, border-bottom), `.topbar-title`, `.topbar-subtitle`, `.topbar-badge` (brand pill), `.badge-dot` (pulsing animation)
  - [x] 8.8 Style `.page-body` (flex column, gap, padding)
  - [x] 8.9 Style KPI row: `.kpi-row` (4-column grid), `.kpi-card` (white card, hover lift), `.kpi-purple/.kpi-green/.kpi-red/.kpi-blue` accent variants, `.kpi-icon`, `.kpi-body`, `.kpi-label`, `.kpi-value`, `.kpi-sub`
  - [x] 8.10 Style forms row: `.forms-row` (flex, stretch), `.forms-row-item` (flex: 1), `.card-stretch`, `.card-body-stretch`, `.form-stretch`, `.form-spacer` (flex: 1 spacer), `.form-row-2` (2-column grid), `.field-group`, `.label-opt`, `.error-msg` (red, prepends ⚠ when non-empty)
  - [x] 8.11 Style charts row: `.charts-row` (flex), `.charts-row-item` (flex: 1), `.chart-body` (centered flex), `canvas` (max-width: 100%, display: block)
  - [x] 8.12 Style dashboard grid: `.dashboard-grid` (`grid-template-columns: 1fr 420px`), `.dashboard-col-main`, `.dashboard-col-side`
  - [x] 8.13 Style card components: `.card` (white, border, border-radius, shadow), `.card-header` (flex, border-bottom), `.card-title` (flex, icon + text), `.card-badge`, `.card-tag` (brand pill), `.card-body`
  - [x] 8.14 Style filter bar: `.filter-inline` (flex row, inline in card-header), `.filter-field` (label + input column)
  - [x] 8.15 Style buttons: `.btn` base, `.btn-primary` (brand, hover lift + shadow), `.btn-ghost` (transparent, border), `.btn-sm`, `.btn-full`, `.btn-delete` (transparent, hover red tint); all with `:focus-visible` ring
  - [x] 8.16 Style expense table: `.expense-table` (full-width, collapsed borders), `.amount-cell` (bold, tabular nums), `.category-pill` (brand pill badge), row hover
  - [x] 8.17 Style summary table: `.summary-table`, `.budget-progress-wrap`, `.budget-progress-bar`, `.budget-progress-fill` (brand color), `.budget-progress-fill.over` (red), `.budget-progress-pct`, `tr.over-budget` (red text), `.over-budget-badge` (red pill)
  - [x] 8.18 Style empty states: `.empty-state`, `.empty-state-icon` (circular gray bg), `.empty-state-title`, `.empty-state-sub`
  - [x] 8.19 Add responsive breakpoints:
    - `≤ 1280px`: dashboard grid side column → 360px
    - `≤ 1100px`: KPI row → 2 columns; charts stack; dashboard grid → 1 column
    - `≤ 900px`: sidebar hidden (`--sidebar-w: 0px`); main-content margin reset; reduced padding
    - `≤ 640px`: forms stack; form-row-2 → 1 column; filter stacks vertically
    - `≤ 400px`: KPI row → 1 column
    - _Requirements: 11.3_

## Notes

- Each task references specific requirements for traceability
- No test framework is required — all verification is done manually via the browser
- Charts are rendered using HTML Canvas 2D API and Vanilla JavaScript only — no external charting libraries
- The three-file constraint (`index.html`, `css/style.css`, `js/script.js`) is respected throughout — no additional source files are created
- The app is branded "Spendly" in the page title, sidebar logo, and topbar
