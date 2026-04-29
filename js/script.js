'use strict';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  'Food',
  'Transport',
  'Entertainment',
  'Health',
  'Housing',
  'Shopping',
  'Other',
];

// ---------------------------------------------------------------------------
// State  (in-memory mirror of localStorage)
// ---------------------------------------------------------------------------

const state = {
  expenses: [],   // Array<Expense>
  budgets: {},    // { [category: string]: number }
  filters: {
    startDate: null,   // string | null  (YYYY-MM-DD)
    endDate: null,     // string | null
    category: null,    // string | null
  },
};

// ---------------------------------------------------------------------------
// Storage Module
// ---------------------------------------------------------------------------

const StorageModule = {
  /**
   * Serializes state.expenses and state.budgets to localStorage.
   * Keys: "ebv_expenses" and "ebv_budgets"
   * Requirements: 8.1
   */
  save() {
    localStorage.setItem('ebv_expenses', JSON.stringify(state.expenses));
    localStorage.setItem('ebv_budgets', JSON.stringify(state.budgets));
  },

  /**
   * Reads both keys from localStorage, parses JSON, and populates state.
   * Falls back to empty state and shows a warning banner on any error.
   * Requirements: 8.2, 8.3
   */
  load() {
    try {
      const rawExpenses = localStorage.getItem('ebv_expenses');
      const rawBudgets  = localStorage.getItem('ebv_budgets');

      state.expenses = rawExpenses ? JSON.parse(rawExpenses) : [];
      state.budgets  = rawBudgets  ? JSON.parse(rawBudgets)  : {};
    } catch (err) {
      // SecurityError (storage blocked) or SyntaxError (corrupted JSON)
      state.expenses = [];
      state.budgets  = {};
      RenderModule.showWarningBanner(
        'Could not load saved data. Starting fresh.'
      );
    }
  },

  /**
   * Removes both localStorage keys and resets in-memory state.
   * Requirements: 9.3
   */
  clear() {
    localStorage.removeItem('ebv_expenses');
    localStorage.removeItem('ebv_budgets');
    state.expenses = [];
    state.budgets  = {};
  },
};

// ---------------------------------------------------------------------------
// Subsequent modules (ValidationModule, FilterModule, RenderModule,
// ChartModule, event handlers, init) will be appended below.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Validation Module
// ---------------------------------------------------------------------------

const ValidationModule = {
  /**
   * Validates form data for adding an expense.
   * Rules: amount > 0, category not empty, date not empty.
   * description is optional — no validation applied.
   * Requirements: 1.4, 1.5, 1.6
   *
   * @param {{ amount: string|number, category: string, description: string, date: string }} formData
   * @returns {{ valid: boolean, errors: { [field: string]: string } }}
   */
  validateExpense(formData) {
    const errors = {};

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Amount must be greater than zero.';
    }

    if (!formData.category || formData.category.trim() === '') {
      errors.category = 'Category is required.';
    }

    if (!formData.date || formData.date.trim() === '') {
      errors.date = 'Date is required.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Validates form data for setting a budget.
   * Rules: amount > 0, category not empty.
   * Requirements: 4.4
   *
   * @param {{ amount: string|number, category: string }} formData
   * @returns {{ valid: boolean, errors: { [field: string]: string } }}
   */
  validateBudget(formData) {
    const errors = {};

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Amount must be greater than zero.';
    }

    if (!formData.category || formData.category.trim() === '') {
      errors.category = 'Category is required.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

// ---------------------------------------------------------------------------
// Filter Module
// ---------------------------------------------------------------------------

const FilterModule = {
  /**
   * Returns a filtered subset of the given expenses array without mutating it.
   * Chains: date-range filter → category filter.
   * Null/empty filter values mean "no filter applied for that criterion".
   * Date comparison uses string comparison (ISO YYYY-MM-DD strings compare
   * correctly lexicographically).
   * Requirements: 7.2
   *
   * @param {Array<{id: string, amount: number, category: string, description: string, date: string}>} expenses
   * @param {{ startDate: string|null, endDate: string|null, category: string|null }} filters
   * @returns {Array<{id: string, amount: number, category: string, description: string, date: string}>}
   */
  apply(expenses, filters) {
    let result = expenses;

    if (filters.startDate) {
      result = result.filter(expense => expense.date >= filters.startDate);
    }

    if (filters.endDate) {
      result = result.filter(expense => expense.date <= filters.endDate);
    }

    if (filters.category) {
      result = result.filter(expense => expense.category === filters.category);
    }

    return result;
  },

  /**
   * Resets state.filters to all-null values.
   * Requirements: 7.3
   */
  clear() {
    state.filters.startDate = null;
    state.filters.endDate   = null;
    state.filters.category  = null;
  },
};

// ---------------------------------------------------------------------------
// Subsequent modules (RenderModule, ChartModule, event handlers, init)
// will be appended below.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Render Module
// ---------------------------------------------------------------------------

const RenderModule = {
  /**
   * Formats a number as a USD currency string, e.g. "$42.50".
   * @param {number} amount
   * @returns {string}
   */
  _formatCurrency(amount) {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  },

  /**
   * Clears #expense-list and renders one row per expense.
   * Rows show: amount, category, description, date, and a delete button.
   * Sorted by date descending (most recent first); input array is not mutated.
   * When expenses is empty, renders an empty-state block.
   * Requirements: 2.1, 2.2, 2.3, 3.1
   *
   * @param {Array<{id: string, amount: number, category: string, description: string, date: string}>} expenses
   */
  renderExpenseList(expenses) {
    const container = document.getElementById('expense-list');
    container.innerHTML = '';

    // Update badge count
    const badge = document.getElementById('expense-count-badge');
    if (badge) badge.textContent = `${expenses.length} ${expenses.length === 1 ? 'entry' : 'entries'}`;

    if (expenses.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div class="empty-state-title">No expenses yet</div>
          <div class="empty-state-sub">Add your first expense using the form above.</div>
        </div>`;
      return;
    }

    // Sort a copy by date descending
    const sorted = expenses.slice().sort((a, b) => {
      if (b.date < a.date) return -1;
      if (b.date > a.date) return 1;
      return 0;
    });

    const table = document.createElement('table');
    table.className = 'expense-table';

    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Amount</th>
        <th>Category</th>
        <th>Description</th>
        <th>Date</th>
        <th></th>
      </tr>`;
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    for (const expense of sorted) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="amount-cell">${this._formatCurrency(expense.amount)}</td>
        <td><span class="category-pill">${expense.category}</span></td>
        <td style="color:var(--gray-500)">${expense.description || '<span style="color:var(--gray-300)">—</span>'}</td>
        <td style="font-variant-numeric:tabular-nums;color:var(--gray-500)">${expense.date}</td>
        <td>
          <button class="btn btn-delete" data-id="${expense.id}" aria-label="Delete expense">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;pointer-events:none">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </button>
        </td>`;
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    container.appendChild(table);
  },

  /**
   * Aggregates total spending per category and renders one row per category
   * that has either spending OR a budget set.
   * Applies CSS class "over-budget" when spending exceeds the budget.
   * Renders a progress bar for categories with a budget.
   * When no categories have spending AND no budgets are set, renders a placeholder.
   * Requirements: 6.1, 6.2, 6.3
   *
   * @param {Array<{id: string, amount: number, category: string, description: string, date: string}>} expenses
   * @param {{ [category: string]: number }} budgets
   */
  renderSummary(expenses, budgets) {
    const container = document.getElementById('summary');
    container.innerHTML = '';

    // Aggregate spending per category
    const spending = {};
    for (const expense of expenses) {
      spending[expense.category] = (spending[expense.category] || 0) + expense.amount;
    }

    // Collect all categories that have spending or a budget
    const allCategories = new Set([
      ...Object.keys(spending),
      ...Object.keys(budgets),
    ]);

    if (allCategories.size === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="empty-state-title">No data yet</div>
          <div class="empty-state-sub">Add expenses or set budgets to see your summary.</div>
        </div>`;
      return;
    }

    const table = document.createElement('table');
    table.className = 'summary-table';

    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Category</th>
        <th>Spending</th>
        <th>Budget</th>
        <th>Progress</th>
      </tr>`;
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    for (const category of allCategories) {
      const totalSpending = spending[category] || 0;
      const budget = budgets[category];
      const hasBudget = budget !== undefined;
      const isOver = hasBudget && totalSpending > budget;

      const tr = document.createElement('tr');
      if (isOver) tr.classList.add('over-budget');

      const budgetCell = hasBudget ? this._formatCurrency(budget) : '<span style="color:var(--gray-300)">—</span>';

      let progressCell = '<span style="color:var(--gray-300)">—</span>';
      if (hasBudget && budget > 0) {
        const pct = Math.min((totalSpending / budget) * 100, 100);
        const fillClass = isOver ? 'over' : '';
        progressCell = `
          <div class="budget-progress-wrap">
            <div class="budget-progress-bar">
              <div class="budget-progress-fill ${fillClass}" style="width:${pct.toFixed(1)}%"></div>
            </div>
            <span class="budget-progress-pct">${Math.round((totalSpending / budget) * 100)}%</span>
          </div>`;
      }

      const overBadge = isOver ? '<span class="over-budget-badge">Over</span>' : '';

      tr.innerHTML = `
        <td><span class="category-pill">${category}</span>${overBadge}</td>
        <td style="font-weight:600;font-variant-numeric:tabular-nums">${this._formatCurrency(totalSpending)}</td>
        <td style="font-variant-numeric:tabular-nums">${budgetCell}</td>
        <td>${progressCell}</td>`;
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    container.appendChild(table);
  },

  /**
   * For each field in the errors object, finds the corresponding error <span>
   * and sets its textContent to the error message.
   * Span id format: "${formId}-${field}-error" (formId without leading '#').
   * Requirements: 1.4, 1.5, 1.6, 4.4
   *
   * @param {{ [field: string]: string }} errors
   * @param {string} formId  — e.g. 'expense-form' or '#expense-form'
   */
  renderValidationErrors(errors, formId) {
    const normalizedId = formId.replace('#', '');
    for (const [field, message] of Object.entries(errors)) {
      const span = document.getElementById(`${normalizedId}-${field}-error`);
      if (span) {
        span.textContent = message;
      }
    }
  },

  /**
   * Finds all .error-msg spans within the form and clears their textContent.
   * Requirements: 1.4, 1.5, 1.6, 4.4
   *
   * @param {string} formId  — e.g. 'expense-form' or '#expense-form'
   */
  clearValidationErrors(formId) {
    const normalizedId = formId.replace('#', '');
    const form = document.getElementById(normalizedId);
    if (!form) return;
    const errorSpans = form.querySelectorAll('.error-msg');
    for (const span of errorSpans) {
      span.textContent = '';
    }
  },

  /**
   * Makes #warning-banner visible with the given message.
   * Requirements: 8.3
   *
   * @param {string} message
   */
  showWarningBanner(message) {
    const banner = document.getElementById('warning-banner');
    if (banner) {
      banner.textContent = message;
      banner.style.display = 'block';
    }
  },

  /**
   * Updates the three stat cards at the top of the dashboard.
   * Shows total spending, number of budgets set, and over-budget count.
   *
   * @param {Array<{amount: number, category: string}>} expenses  — filtered expenses
   * @param {{ [category: string]: number }} budgets
   */
  renderStatCards(expenses, budgets) {
    // Total spending
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const statTotal = document.getElementById('stat-total');
    if (statTotal) statTotal.textContent = this._formatCurrency(total);

    const statCount = document.getElementById('stat-count');
    if (statCount) statCount.textContent = `${expenses.length} ${expenses.length === 1 ? 'transaction' : 'transactions'}`;

    // Budgets set
    const budgetCount = Object.keys(budgets).length;
    const statBudgets = document.getElementById('stat-budgets');
    if (statBudgets) statBudgets.textContent = budgetCount;

    // Over-budget categories
    const spending = {};
    for (const e of expenses) {
      spending[e.category] = (spending[e.category] || 0) + e.amount;
    }
    const overCount = Object.keys(budgets).filter(
      cat => (spending[cat] || 0) > budgets[cat]
    ).length;
    const statOver = document.getElementById('stat-over');
    if (statOver) statOver.textContent = overCount;
  },

  /**
   * Computes the filtered expense list once, then calls all render functions
   * and both chart draw functions with the current state.
   * Requirements: 3.3, 4.5, 5.3, 6.4, 7.4
   */
  refresh() {
    const filtered = FilterModule.apply(state.expenses, state.filters);
    this.renderStatCards(filtered, state.budgets);
    this.renderExpenseList(filtered);
    this.renderSummary(filtered, state.budgets);
    ChartModule.drawBarChart(document.getElementById('bar-chart'), filtered, state.budgets);
    ChartModule.drawPieChart(document.getElementById('pie-chart'), filtered);
  },
};

// ---------------------------------------------------------------------------
// Subsequent modules (ChartModule, event handlers, init)
// will be appended below.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Chart Module
// ---------------------------------------------------------------------------

const ChartModule = {
  /**
   * Fixed color palette used for both bar and pie charts.
   * Cycles if there are more categories than colors.
   */
  _PALETTE: [
    '#6366f1', // indigo
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#ec4899', // pink
    '#8b5cf6', // violet
    '#14b8a6', // teal
    '#f97316', // orange
    '#06b6d4', // cyan
    '#84cc16', // lime
  ],

  /**
   * Returns the color for a given index, cycling through the palette.
   * @param {number} index
   * @returns {string}
   */
  _colorFor(index) {
    return this._PALETTE[index % this._PALETTE.length];
  },

  /**
   * Aggregates total spending per category from an expenses array.
   * Returns an object { [category]: totalAmount }.
   * @param {Array<{category: string, amount: number}>} expenses
   * @returns {{ [category: string]: number }}
   */
  _aggregateByCategory(expenses) {
    const totals = {};
    for (const expense of expenses) {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    }
    return totals;
  },

  /**
   * Draws a bar chart on the given canvas.
   * - Clears the canvas first.
   * - Renders "No data" centered text when expenses is empty.
   * - Draws one bar per category that has spending.
   * - Draws a horizontal budget reference line for categories with a budget set.
   * - Includes x-axis category labels and y-axis amount labels.
   * Requirements: 5.1, 5.4, 5.5
   *
   * @param {HTMLCanvasElement} canvas
   * @param {Array<{category: string, amount: number}>} expenses
   * @param {{ [category: string]: number }} budgets
   */
  drawBarChart(canvas, expenses, budgets) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Clear the full canvas
    ctx.clearRect(0, 0, W, H);

    // No data case
    if (!expenses || expenses.length === 0) {
      ctx.save();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No data', W / 2, H / 2);
      ctx.restore();
      return;
    }

    const spending = this._aggregateByCategory(expenses);
    const categories = Object.keys(spending);

    if (categories.length === 0) {
      ctx.save();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No data', W / 2, H / 2);
      ctx.restore();
      return;
    }

    // Layout padding
    const paddingLeft   = 60;
    const paddingRight  = 20;
    const paddingTop    = 20;
    const paddingBottom = 50;

    const chartW = W - paddingLeft - paddingRight;
    const chartH = H - paddingTop - paddingBottom;

    // Determine the max value across spending and budgets (for y-axis scale)
    let maxValue = 0;
    for (const cat of categories) {
      maxValue = Math.max(maxValue, spending[cat]);
      if (budgets[cat] !== undefined) {
        maxValue = Math.max(maxValue, budgets[cat]);
      }
    }
    if (maxValue === 0) maxValue = 1; // avoid division by zero

    // Bar dimensions
    const barGroupWidth = chartW / categories.length;
    const barPadding    = barGroupWidth * 0.2;
    const barWidth      = barGroupWidth - barPadding * 2;

    // Draw y-axis gridlines and labels
    const yTickCount = 5;
    ctx.save();
    ctx.strokeStyle = '#f1f5f9';
    ctx.fillStyle   = '#94a3b8';
    ctx.font        = '11px Inter, sans-serif';
    ctx.textAlign   = 'right';
    ctx.textBaseline = 'middle';
    ctx.lineWidth   = 1;

    for (let i = 0; i <= yTickCount; i++) {
      const value = (maxValue / yTickCount) * i;
      const y     = paddingTop + chartH - (value / maxValue) * chartH;

      // Gridline
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(paddingLeft + chartW, y);
      ctx.stroke();

      // Label
      ctx.fillText(
        value >= 1000
          ? `$${(value / 1000).toFixed(1)}k`
          : `$${value.toFixed(0)}`,
        paddingLeft - 6,
        y
      );
    }
    ctx.restore();

    // Draw x-axis baseline
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop + chartH);
    ctx.lineTo(paddingLeft + chartW, paddingTop + chartH);
    ctx.stroke();
    ctx.restore();

    // Draw bars, budget lines, and x-axis labels
    for (let i = 0; i < categories.length; i++) {
      const cat    = categories[i];
      const amount = spending[cat];
      const color  = this._colorFor(i);

      const x      = paddingLeft + i * barGroupWidth + barPadding;
      const barH   = (amount / maxValue) * chartH;
      const y      = paddingTop + chartH - barH;

      // Bar — rounded top via clip trick
      ctx.save();
      ctx.fillStyle = color;
      // Draw bar with slight opacity for a modern look
      ctx.globalAlpha = 0.9;
      ctx.fillRect(x, y, barWidth, barH);
      ctx.globalAlpha = 1;
      ctx.restore();

      // Budget reference line (if budget is set for this category)
      if (budgets[cat] !== undefined) {
        const budgetY = paddingTop + chartH - (budgets[cat] / maxValue) * chartH;
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth   = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(x - barPadding / 2, budgetY);
        ctx.lineTo(x + barWidth + barPadding / 2, budgetY);
        ctx.stroke();
        ctx.restore();
      }

      // X-axis category label
      ctx.save();
      ctx.fillStyle    = '#64748b';
      ctx.font         = '11px Inter, sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      // Truncate long labels
      const label = cat.length > 10 ? cat.slice(0, 9) + '…' : cat;
      ctx.fillText(label, x + barWidth / 2, paddingTop + chartH + 8);
      ctx.restore();
    }
  },

  /**
   * Draws a pie chart on the given canvas.
   * - Clears the canvas first.
   * - Renders "No data" centered text when expenses is empty.
   * - Draws one arc per category with non-zero spending, proportional to total.
   * - Assigns colors from the fixed palette.
   * - Draws a legend showing category name and color.
   * Requirements: 5.2, 5.5
   *
   * @param {HTMLCanvasElement} canvas
   * @param {Array<{category: string, amount: number}>} expenses
   */
  drawPieChart(canvas, expenses) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Clear the full canvas
    ctx.clearRect(0, 0, W, H);

    // No data case
    if (!expenses || expenses.length === 0) {
      ctx.save();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No data', W / 2, H / 2);
      ctx.restore();
      return;
    }

    const spending = this._aggregateByCategory(expenses);

    // Filter out categories with zero spending
    const categories = Object.keys(spending).filter(cat => spending[cat] > 0);

    if (categories.length === 0) {
      ctx.save();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No data', W / 2, H / 2);
      ctx.restore();
      return;
    }

    const total = categories.reduce((sum, cat) => sum + spending[cat], 0);

    // Legend dimensions
    const legendItemH  = 18;
    const legendPadTop = 10;
    const legendH      = legendPadTop + categories.length * legendItemH + 10;

    // Pie circle area (leave room for legend at the bottom)
    const pieAreaH = H - legendH;
    const cx       = W / 2;
    const cy       = pieAreaH / 2;
    const radius   = Math.min(W / 2, pieAreaH / 2) * 0.85;

    // Draw pie slices
    let startAngle = -Math.PI / 2; // start at 12 o'clock

    for (let i = 0; i < categories.length; i++) {
      const cat        = categories[i];
      const sliceAngle = (spending[cat] / total) * 2 * Math.PI;
      const endAngle   = startAngle + sliceAngle;
      const color      = this._colorFor(i);

      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Thin white separator between slices
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.restore();

      startAngle = endAngle;
    }

    // Draw legend
    const legendStartY = pieAreaH + legendPadTop;
    const swatchSize   = 12;
    const legendX      = 16;

    for (let i = 0; i < categories.length; i++) {
      const cat   = categories[i];
      const color = this._colorFor(i);
      const y     = legendStartY + i * legendItemH;

      // Color swatch
      ctx.save();
      ctx.fillStyle = color;
      ctx.fillRect(legendX, y, swatchSize, swatchSize);
      ctx.restore();

      // Category name
      ctx.save();
      ctx.fillStyle    = '#475569';
      ctx.font         = '11px Inter, sans-serif';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(cat, legendX + swatchSize + 6, y);
      ctx.restore();
    }
  },
};

// ---------------------------------------------------------------------------
// Subsequent modules (event handlers, init) will be appended below.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Event Handlers and init()
// ---------------------------------------------------------------------------

/**
 * Add-expense form submit handler.
 * Reads form fields, validates, and on success creates an Expense object,
 * pushes to state, saves, resets the form, and refreshes the UI.
 * Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */
function handleExpenseFormSubmit(event) {
  event.preventDefault();

  const form        = document.getElementById('expense-form');
  const amount      = document.getElementById('expense-amount').value;
  const category    = document.getElementById('expense-category').value;
  const description = document.getElementById('expense-description').value;
  const date        = document.getElementById('expense-date').value;

  RenderModule.clearValidationErrors('expense-form');

  const formData = { amount, category, description, date };
  const { valid, errors } = ValidationModule.validateExpense(formData);

  if (!valid) {
    RenderModule.renderValidationErrors(errors, 'expense-form');
    return;
  }

  const expense = {
    id: `${Date.now()}-${Math.random()}`,
    amount: parseFloat(amount),
    category,
    description,
    date,
  };

  state.expenses.push(expense);
  StorageModule.save();
  form.reset();
  RenderModule.refresh();
}

/**
 * Delete-expense handler (event-delegated on #expense-list).
 * Listens for click events on the list and removes the targeted expense.
 * Requirements: 3.2, 3.3
 */
function handleExpenseListClick(event) {
  if (!event.target.classList.contains('btn-delete')) return;

  const id = event.target.dataset.id;
  if (!id) return;

  state.expenses = state.expenses.filter(e => e.id !== id);
  StorageModule.save();
  RenderModule.refresh();
}

/**
 * Set-budget form submit handler.
 * Reads form fields, validates, and on success sets the budget for the
 * selected category, saves, and refreshes the UI.
 * Requirements: 4.2, 4.3, 4.4, 4.5
 */
function handleBudgetFormSubmit(event) {
  event.preventDefault();

  const category = document.getElementById('budget-category').value;
  const amount   = document.getElementById('budget-amount').value;

  RenderModule.clearValidationErrors('budget-form');

  const formData = { category, amount };
  const { valid, errors } = ValidationModule.validateBudget(formData);

  if (!valid) {
    RenderModule.renderValidationErrors(errors, 'budget-form');
    return;
  }

  state.budgets[category] = parseFloat(amount);
  StorageModule.save();
  RenderModule.refresh();
}

/**
 * Filter controls change handler.
 * Listens for change events on the three filter fields and updates
 * state.filters, then refreshes the UI.
 * Requirements: 7.1, 7.2
 */
function handleFilterChange() {
  const startDate = document.getElementById('filter-start-date').value;
  const endDate   = document.getElementById('filter-end-date').value;
  const category  = document.getElementById('filter-category').value;

  state.filters.startDate = startDate || null;
  state.filters.endDate   = endDate   || null;
  state.filters.category  = category  || null;

  RenderModule.refresh();
}

/**
 * Clear-filters button handler.
 * Resets filter state and DOM fields, then refreshes the UI.
 * Requirements: 7.3
 */
function handleClearFilters() {
  FilterModule.clear();

  document.getElementById('filter-start-date').value = '';
  document.getElementById('filter-end-date').value   = '';
  document.getElementById('filter-category').value   = '';

  RenderModule.refresh();
}

/**
 * Clear-all-data button handler.
 * Prompts for confirmation; on confirm clears all state and refreshes.
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */
function handleClearAll() {
  const confirmed = window.confirm(
    'Are you sure you want to clear all data? This cannot be undone.'
  );

  if (!confirmed) return;

  StorageModule.clear();
  FilterModule.clear();

  document.getElementById('filter-start-date').value = '';
  document.getElementById('filter-end-date').value   = '';
  document.getElementById('filter-category').value   = '';

  RenderModule.refresh();
}

/**
 * Initialises the application:
 * - Populates category <select> dropdowns from CATEGORIES
 * - Attaches all event listeners
 * - Loads persisted data from localStorage
 * - Renders the initial UI
 * Requirements: 1.1, 4.1, 8.2
 */
function init() {
  // Populate category selects
  const expenseCategorySelect = document.getElementById('expense-category');
  const budgetCategorySelect  = document.getElementById('budget-category');
  const filterCategorySelect  = document.getElementById('filter-category');

  for (const cat of CATEGORIES) {
    const option = `<option value="${cat}">${cat}</option>`;
    expenseCategorySelect.insertAdjacentHTML('beforeend', option);
    budgetCategorySelect.insertAdjacentHTML('beforeend', option);
    filterCategorySelect.insertAdjacentHTML('beforeend', option);
  }

  // Attach event listeners
  document.getElementById('expense-form')
    .addEventListener('submit', handleExpenseFormSubmit);

  document.getElementById('expense-list')
    .addEventListener('click', handleExpenseListClick);

  document.getElementById('budget-form')
    .addEventListener('submit', handleBudgetFormSubmit);

  document.getElementById('filter-start-date')
    .addEventListener('change', handleFilterChange);
  document.getElementById('filter-end-date')
    .addEventListener('change', handleFilterChange);
  document.getElementById('filter-category')
    .addEventListener('change', handleFilterChange);

  document.getElementById('clear-filters-btn')
    .addEventListener('click', handleClearFilters);

  document.getElementById('clear-all-btn')
    .addEventListener('click', handleClearAll);

  // Load persisted data and render
  StorageModule.load();
  RenderModule.refresh();
}

// Wire init to DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);
