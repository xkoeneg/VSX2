import type React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Plus,
  X,
  Edit2,
  Trash2,
  Check,
  ChevronsUpDown,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertCircle,
  Lightbulb,
  Filter,
  Grid,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Brain,
  Percent,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Save,
  Upload,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Link,
  Download,
  HardDrive,
  FolderSync,
  ToggleLeft,
  ToggleRight,
  Wallet,
  LineChart,
  Clock,
  CalendarDays,
  Calculator,
  CornerDownLeft,
  GripVertical,
  Expand,
  SlidersHorizontal,
  ArrowUpDown,
  Sun,
  Moon,
  PanelLeft,
  Flame,
  ClipboardPaste,
  ZoomIn,
  Send,
  ImagePlus,
  StickyNote,
  Box,
  Search,
  ArrowLeft,
  Database,
  Settings,
  Scale,
  Layers,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Star,
  Flag,
  Bookmark,
  Lock,
  Crosshair,
  Rocket,
  Award,
  Bell,
  Gem,
  Anchor,
  Compass,
  Swords,
  Smile,
  Palette,
  Quote,
  RefreshCw,
  ListChecks,
  Dumbbell,
  Coffee,
  Heart,
  type LucideIcon,
} from 'lucide-react';
import { calculateAccountMetrics } from '../utils/accountMetrics';
import { formatCurrency, formatCurrencyAbsolute, formatDate } from '../utils/format';
import { PageHeader } from '../components/shared/PageHeader';
import { NotificationBell } from '../components/shared/NotificationBell';
import type {
  Account,
AccountMetrics,
CalculatorProps,
ChallengeConfig,
ChallengePreset,
ChallengePresetCategory,
ChatMessage,
Confluence,
CustomPillar,
DateInputProps,
EconomicEvent,
EditableTagInputProps,
EmotionTag,
GalleryView,
MTColumnRole,
MarketEffect,
MarketNotice,
MarketSessionDef,
Mistake,
MultiSelectDropdownProps,
NoticeType,
NotificationReadState,
NumericInputProps,
PHTWindow,
ParsedMTTrade,
PillarsPerRow,
RoutineCategory,
RoutineIconColor,
RoutineIconKind,
RoutineItem,
Rule,
RuleAccentColor,
RuleAccentStyle,
RuleBulletStyle,
RuleIconKind,
RuleItemType,
RulePillar,
RuleSeverity,
RuleTextSize,
SessionOption,
SetupType,
SortOrder,
StoredData,
Strategy,
StrategyStep,
TagColor,
TagColorPickerProps,
TagColorStyle,
TagSelectDropdownProps,
TimeInputProps,
TimeframeChart,
TimeframeChartInputProps,
Trade,
TradeFilter,
TradeImage,
TradeSortField,
TradingAccountType,
ViewType,
WeekDay,
WikiCandle,
WikiCategory,
WikiEntry
} from '../types';
import { cn } from '../utils/format';
import { useAppContext } from '../context/AppContext';
import { renderStatCard, renderAccountFilter, renderAccountTypeBadge, renderTradingAccountTypeBadge } from '../components/shared/RenderHelpers';

export function DashboardScreen() {
  const {
    view, setView, privacyMode, setPrivacyMode, theme, setTheme, mainScrollRef, isExportConfirmOpen,
    setIsExportConfirmOpen, sidebarCollapsed, setSidebarCollapsed, isSettingsModalOpen,
    setIsSettingsModalOpen, settingsModalTab, setSettingsModalTab, isMobileSidebarOpen,
    setIsMobileSidebarOpen, galleryView, setGalleryView, tradeSubView, setTradeSubView, dbSearch, setDbSearch,
    dbAccountFilter, setDbAccountFilter, dbSessionFilter, setDbSessionFilter, dbOutcomeFilter,
    setDbOutcomeFilter, dbRulesFilter, setDbRulesFilter, dbPage, setDbPage, dbViewMode, setDbViewMode,
    DB_PAGE_SIZE, tradeFilter, setTradeFilter, tradeSortField, setTradeSortField, tradeSortOrder,
    setTradeSortOrder, viewportWidth, equityChartContainerRef, equityChartWidth, setEquityChartWidth,
    selectedAccounts, setSelectedAccounts, showAccountDropdown, setShowAccountDropdown, calculatorState,
    setCalculatorState, activeInputRef, resetCalculator, handleNumberInputFocus, handleCalculatorChange,
    updateFieldFromCalculator, handleCalculatorEnter, closeCalculator, accounts, setAccounts, trades,
    setTrades, rules, setRules, strategies, setStrategies, notices, setNotices, wikiEntries, setWikiEntries,
    setupTypes, setSetupTypes, confluences, setConfluences, mistakesList, setMistakesList, emotionsList,
    setEmotionsList, customSymbols, setCustomSymbols, customPillars, setCustomPillars, tradeImportInputRef,
    isImportingTrades, setIsImportingTrades, tradeImportToast, setTradeImportToast,
    tradeImportToastTimeoutRef, showTradeImportToast, pillarsPerRow, setPillarsPerRow, DEFAULT_CREED_QUOTES,
    customCreedQuotes, setCustomCreedQuotes, customCreedQuotesLoaded, setCustomCreedQuotesLoaded,
    allCreedQuotes, creedIndex, setCreedIndex, isEditingCreed, setIsEditingCreed, creedDraftText,
    setCreedDraftText, creedDraftTag, setCreedDraftTag, currentCreedQuote, isCurrentCreedCustom,
    shuffleDailyCreed, openCreedEditor, saveCreedEdit, deleteCurrentCreedQuote, CREED_EMPHASIS_WORDS,
    renderCreedQuoteText, PRE_SESSION_CHECKLIST_ITEMS, preSessionChecklist, setPreSessionChecklist,
    togglePreSessionItem, resetPreSessionChecklist, preSessionCompletedCount, showAddAccount,
    setShowAddAccount, showEditAccount, setShowEditAccount, showAddTrade, setShowAddTrade, showEditTrade,
    setShowEditTrade, showTradeDetail, setShowTradeDetail, detailNotesDraft, setDetailNotesDraft,
    detailRulesFollowedDraft, setDetailRulesFollowedDraft, showDisciplineReview, setShowDisciplineReview,
    disciplineReviewDraft, setDisciplineReviewDraft, showRuleReviewModal, setShowRuleReviewModal,
    isEditingRuleReview, setIsEditingRuleReview, showAddRule, setShowAddRule, showManageRulesModal,
    setShowManageRulesModal, showAddStrategy, setShowAddStrategy, viewStrategyId, setViewStrategyId,
    newStrategy, setNewStrategy, editingStrategyId, setEditingStrategyId, strategyPendingDelete,
    setStrategyPendingDelete, stepPendingDeleteId, setStepPendingDeleteId, draggingStepImageId,
    setDraggingStepImageId, dragOverStepImageId, setDragOverStepImageId, draggingCoverImageId,
    setDraggingCoverImageId, dragOverCoverImageId, setDragOverCoverImageId, draggingStrategyId,
    setDraggingStrategyId, dragOverStrategyId, setDragOverStrategyId, strategyCoverIndex,
    setStrategyCoverIndex, strategyImageInputRef, strategyCarouselRef, canScrollLeftStrategy,
    setCanScrollLeftStrategy, canScrollRightStrategy, setCanScrollRightStrategy, updateStrategyScrollState,
    scrollStrategyCarousel, strategyStepImageInputRefs, showAddNotice, setShowAddNotice, editingNoticeId,
    setEditingNoticeId, showAddWiki, setShowAddWiki, editingTrade, setEditingTrade, lightboxImage,
    setLightboxImage, showExpandGallery, setShowExpandGallery, executionImageIndex, setExecutionImageIndex,
    timeframeImageIndices, setTimeframeImageIndices, showTradeTimeFields, setShowTradeTimeFields,
    showTradePriceLevels, setShowTradePriceLevels, rulesAdherenceError, setRulesAdherenceError,
    showAccountTypeDropdown, setShowAccountTypeDropdown, showTradingAccountTypeDropdown,
    setShowTradingAccountTypeDropdown, showSymbolDropdown, setShowSymbolDropdown, symbolCustomInput,
    setSymbolCustomInput, showSessionDropdown, setShowSessionDropdown, showTradeControlsPanel,
    setShowTradeControlsPanel, tradeSelectMode, setTradeSelectMode, selectedTradeIds, setSelectedTradeIds,
    showDeleteSelectedConfirm, setShowDeleteSelectedConfirm, accountPendingDelete, setAccountPendingDelete,
    tradePendingDelete, setTradePendingDelete, noticeImageInputRef, accountDropdownRef,
    tradingAccountTypeDropdownRef, accountTypeDropdownRef, symbolDropdownRef, sessionDropdownRef,
    tradeControlsPanelRef, calendarMonth, setCalendarMonth, streakGridWindow, setStreakGridWindow,
    disciplineCalendarMonth, setDisciplineCalendarMonth, openDisciplineDay, setOpenDisciplineDay,
    disciplineCalendarGridRef, emotionsTimeframe, setEmotionsTimeframe, mistakesTimeframe,
    setMistakesTimeframe, disciplineAnalyticsTimeframeOptions, newAccount, setNewAccount, editingAccount,
    setEditingAccount, initializeEmptyTimeframes, newTrade, setNewTrade, priceInputs, setPriceInputs, newRule,
    setNewRule, editingRuleId, setEditingRuleId, showRuleIconPicker, setShowRuleIconPicker, ruleIconPickerTab,
    setRuleIconPickerTab, emptyNoticeDraft, newNotice, setNewNotice, newWiki, setNewWiki, editingWikiId,
    setEditingWikiId, viewWikiId, setViewWikiId, wikiImageInputRef, selectedTimeframeTab,
    setSelectedTimeframeTab, calculatedRR, lifeDisciplineStartDate, setLifeDisciplineStartDate,
    lifeDisciplineChecks, setLifeDisciplineChecks, lifeDisciplineGraceDays, setLifeDisciplineGraceDays,
    lifeDisciplineRecheckNotes, setLifeDisciplineRecheckNotes, lifeDisciplineMissedReasons,
    setLifeDisciplineMissedReasons, challengeConfig, setChallengeConfig, hasStartedChallenge,
    setHasStartedChallenge, hasActiveChallengeProgress, dayDetailsModal, setDayDetailsModal,
    isEditingDayReason, setIsEditingDayReason, dayReasonDraftText, setDayReasonDraftText,
    isRecheckTokenPromptOpen, setIsRecheckTokenPromptOpen, recheckTokenReasonDraft,
    setRecheckTokenReasonDraft, dayDetailsHonestyGuardrail, setDayDetailsHonestyGuardrail,
    isEditingDayChecklist, setIsEditingDayChecklist, isChallengeConfigOpen, setIsChallengeConfigOpen,
    challengeModalMode, setChallengeModalMode, isResetChallengeConfirmOpen, setIsResetChallengeConfirmOpen,
    challengeConfigDraft, setChallengeConfigDraft, isCustomDuration, setIsCustomDuration, newRoutineItemText,
    setNewRoutineItemText, editingRoutineItem, setEditingRoutineItem, editingRoutineItemText,
    setEditingRoutineItemText, iconPickerOpenFor, setIconPickerOpenFor, iconPickerTab, setIconPickerTab,
    iconPickerPos, setIconPickerPos, iconPickerPopoverRef, iconPickerTriggerRefs, ICON_PICKER_WIDTH,
    ICON_PICKER_EST_HEIGHT, GAP, computeIconPickerPos, toggleIconPicker, categoryPendingDelete,
    setCategoryPendingDelete, itemPendingDelete, setItemPendingDelete, userChallengePresets,
    setUserChallengePresets, isLoadPresetMenuOpen, setIsLoadPresetMenuOpen, isSavingPresetDraft,
    setIsSavingPresetDraft, savePresetNameDraft, setSavePresetNameDraft, isManagePresetsOpen,
    setIsManagePresetsOpen, presetPendingDelete, setPresetPendingDelete, loadPresetMenuRef, loadedPresetId,
    setLoadedPresetId, isPresetSaveChoiceOpen, setIsPresetSaveChoiceOpen, presetSaveChoiceRef,
    lifeDisciplineToast, setLifeDisciplineToast, lifeDisciplineToastTimeoutRef, showLifeDisciplineToast,
    emptyLifeDisciplineChecks, toggleLifeDisciplineItem, completeAllLifeDisciplineToday,
    isLifeDisciplineDayComplete, lifeDisciplineTokensUsed, lifeDisciplineTokensRemaining,
    toggleLifeDisciplineGraceDay, openDayDetailsModal, startEditDayChecklist, saveDayChecklistEdits,
    toggleDayDetailsFailedItem, startEditDayReason, saveDayDetailsReason, openRecheckTokenPrompt,
    confirmUseRecheckToken, undoRecheckDay, handleLifeDisciplineTileClick, findMatchingUserPreset,
    handleSaveCurrentAsPresetClick, overwriteExistingUserPreset, chooseSaveAsNewPreset,
    openChallengeConfigModal, applyChallengePreset, saveDraftAsPreset, requestDeleteUserChallengePreset,
    confirmDeleteUserChallengePreset, addDraftRoutineItem, addDraftWeeklyItem, requestDeleteDraftRoutineItem,
    confirmDeleteDraftRoutineItem, startEditDraftRoutineItem, commitEditDraftRoutineItem,
    toggleWeeklyRoutinesEnabled, toggleDraftItemDay, addDraftCategory, renameDraftCategory,
    setDraftCategoryIcon, setDraftCategoryIconColor, requestDeleteDraftCategory, confirmDeleteDraftCategory,
    cleanChallengeConfigDraft, saveChallengeConfigUpdate, resetChallengeProgress, saveChallengeConfig,
    tradeNumberAccountRef, accountFilteredTrades, filteredTrades, dbFilteredTrades, dbPageCount,
    dbPagedTrades, getDisplayTradeNumber, stats, equityData, ruleViolationCounts, calendarDays,
    handleAddAccount, handleUpdateAccount, handleDeleteAccount, confirmDeleteAccount, handleImportTradesFile,
    handleAddTrade, openEditTrade, handleSaveEditedTrade, handleDeleteTrade, confirmDeleteTrade,
    handleSaveDetailNotes, handleSaveDisciplineReview, handleCancelRuleReviewEdit, closeRuleReviewModal,
    toggleTradeSelectMode, toggleTradeSelected, toggleSelectAllTrades, handleDeleteSelectedTrades,
    confirmDeleteSelectedTrades, getTodayLocalDate, tc, resetTradeForm, handleSaveRule, openAddRuleModal,
    openEditRuleModal, closeRuleModal, handleDeleteRule, handleAddDivider, handleUpdateDividerLabel,
    showAddPillarModal, setShowAddPillarModal, newPillar, setNewPillar, pillarPendingDelete,
    setPillarPendingDelete, openAddPillarModal, closeAddPillarModal, handleAddPillar, handleDeletePillar,
    moveStrategy, handleStrategyImagesPick, removeStrategyImage, moveStrategyImage, openAddStrategyModal,
    openEditStrategyModal, closeStrategyModal, addStrategyStep, updateStrategyStep, requestRemoveStrategyStep,
    removeStrategyStep, confirmRemoveStrategyStep, handleStrategyStepImagesPick, removeStrategyStepImage,
    moveStrategyStepImage, handleSaveStrategy, handleDeleteStrategy, confirmDeleteStrategy,
    handleNoticeImagePick, handleAddNotice, handleOpenAddNotice, handleEditNotice, handleDeleteNotice,
    WIKI_FORM_DEFAULT, handleAddWiki, handleOpenAddWiki, handleOpenEditWiki, handleDeleteWiki,
    handleWikiImagePick, addWikiKeyRule, updateWikiKeyRule, removeWikiKeyRule, handleDeleteSetupType,
    handleDeleteConfluence, handleDeleteMistakeType, handleChangeSetupTypeColor, handleChangeConfluenceColor,
    handleChangeMistakeColor, handleDeleteEmotion, handleChangeEmotionColor, colorForEmotion, colorForMistake,
    handleFileUpload, handleAddImageUrl, handleRemoveImage, handleReorderImages, updateTimeframeNotes,
    exportBackup, importBackup,
  } = useAppContext();

  // Converts a series of [x,y] points into a smooth cubic-Bezier SVG path
  // using Catmull-Rom-to-Bezier interpolation (tension = 1/6, the standard
  // conversion factor). This keeps the rounded, "smooth curve" look without
  // the wide overshoot that naive/high-tension smoothing produces — the
  // curve dips only slightly past each point's true Y value, so the domain
  // padding below (~12%) is enough to keep it from ever clipping.
  const buildSmoothPath = (points: readonly (readonly [number, number])[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
    if (points.length === 2) return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;

    let path = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    return path;
  };

  const renderEquityChart = () => {
    if (equityData.length === 0) {
      return <div className={cn("h-48 flex items-center justify-center text-sm", tc.textMuted)}>No trade data to display yet</div>;
    }

    const dataMin = Math.min(...equityData);
    const dataMax = Math.max(...equityData);
    const dataRange = dataMax - dataMin || 1;
    const height = 180;
    const chartWidth = Math.max(equityChartWidth, 200);
    const isPositive = stats.totalPnL >= 0;
    const strokeColor = isPositive ? '#10b981' : '#ef4444';
    const gradientId = `equityFill-${isPositive ? 'up' : 'down'}`;

    // Y-axis domain padding: a small percentage of the data range, just
    // enough headroom for the smoothed curve's minor overshoot between
    // points to stay clear of the top/bottom edges. Previously this was an
    // oversized ~50%-of-height fixed margin, which pushed the whole curve
    // and its baseline down into a thin band in the middle of the chart —
    // this keeps the curve spanning the full container height instead.
    const PADDING_RATIO = 0.12;
    const padding = dataRange * PADDING_RATIO;
    const domainMin = dataMin - padding;
    const domainMax = dataMax + padding;
    const domainRange = domainMax - domainMin || 1;

    const step = chartWidth / Math.max(equityData.length - 1, 1);
    const coords = equityData.map((val, i) => {
      const x = equityData.length === 1 ? chartWidth / 2 : i * step;
      const y = height - ((val - domainMin) / domainRange) * height;
      return [x, y] as const;
    });

    const linePath = buildSmoothPath(coords);
    const areaPath = `${linePath} L ${coords[coords.length - 1][0]} ${height} L ${coords[0][0]} ${height} Z`;

    const midpoint = dataMin + dataRange / 2;
    const midY = height - ((midpoint - domainMin) / domainRange) * height;

    return (
      <div className="w-full relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          width="100%"
          height={height}
          className="w-full block"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1={midY} x2={chartWidth} y2={midY} stroke="#3f3f46" strokeWidth="1" strokeDasharray="4" vectorEffect="non-scaling-stroke" />
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* Data-point dots are rendered as plain HTML circles positioned by
            percentage, not as SVG <circle> elements inside the chart's own
            viewBox. The viewBox above intentionally scales X and Y
            independently (preserveAspectRatio="none", so the line/fill
            always fill the container edge-to-edge) — an SVG <circle> caught
            in that same non-uniform scale would get stretched into an
            ellipse. Plain divs sized in real pixels are immune to that
            scaling and stay perfectly round regardless. */}
        <div className="absolute inset-0 pointer-events-none">
          {coords.map(([x, y], i) => (
            <div
              key={i}
              className="absolute w-[5px] h-[5px] rounded-full"
              style={{
                left: `${(x / chartWidth) * 100}%`,
                top: `${(y / height) * 100}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: strokeColor,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderProgressBar = (account: Account) => {
    const hasProfitTarget = account.hasProfitTarget && account.profitTarget && account.profitTarget > 0;
    const tradingType = account.tradingAccountType || 'LIVE';

    const hasDrawdown = tradingType === 'LIVE' ||
      (account.maxDrawdownAllowance && account.maxDrawdownAllowance > 0) ||
      (tradingType === 'CFD' && account.fixedMinBalance && account.fixedMinBalance > 0);

    if (!hasProfitTarget && !hasDrawdown) return null;

    const accountTrades = trades.filter(t => t.accountId === account.id);
    const metrics = calculateAccountMetrics(account, accountTrades);
    const netProfit = metrics.currentBalance - account.startingBalance;

    const showProfitBar = netProfit >= 0 && hasProfitTarget;
    const showDrawdownBar = netProfit < 0 && hasDrawdown;

    return (
      <div className="mt-3">
        {showProfitBar && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Target className="w-3 h-3 text-emerald-400" />
                Progress to Target
              </span>
              <span className={cn('text-xs font-medium', metrics.profitProgress >= 90 ? 'text-emerald-400' : 'text-zinc-400')}>
                {privacyMode ? '****' : `${metrics.profitProgress.toFixed(1)}%`}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 bg-emerald-500',
                  metrics.profitProgress >= 90 && 'shadow-[0_0_10px_2px_rgba(16,185,129,0.75)]'
                )}
                style={{ width: `${Math.max(metrics.profitProgress, 0)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-zinc-600">Current: {privacyMode ? '****' : formatCurrencyAbsolute(metrics.currentBalance)}</span>
              <span className="text-[10px] text-zinc-600">Target: {privacyMode ? '****' : formatCurrencyAbsolute(account.profitTarget!)}</span>
            </div>
          </div>
        )}

        {showDrawdownBar && (
          <div>
            {(metrics.isLocked || metrics.isBreached) && (
              <div className="flex items-center gap-2 mb-2">
                {metrics.isLocked && (
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">Locked</span>
                )}
                {metrics.isBreached && (
                  <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Breached
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                <TrendingDown className="w-3 h-3 text-red-500" />
                {tradingType === 'FUTURES' ? 'Trailing Drawdown' :
                 tradingType === 'LIVE' ? 'Drawdown from Capital' : 'Drawdown Usage'}
              </span>
              <span className={cn('text-xs font-medium', metrics.drawdownProgress > 70 ? 'text-red-500' : 'text-zinc-400')}>
                {privacyMode ? '****' : `${metrics.drawdownProgress.toFixed(1)}%`}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative">
              <div className="absolute right-[30%] top-0 bottom-0 w-px bg-amber-500/30" />
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 bg-red-600',
                  metrics.drawdownProgress > 70 && 'shadow-[0_0_10px_2px_rgba(239,68,68,0.8)]'
                )}
                style={{ width: `${metrics.drawdownProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-zinc-600">
                Current: {privacyMode ? '****' : formatCurrencyAbsolute(metrics.currentBalance)}
              </span>
              <span className="text-[10px] text-zinc-600">
                {tradingType === 'LIVE' ? 'Floor: $0.00' : `Liquidation Level: ${privacyMode ? '****' : formatCurrencyAbsolute(metrics.threshold)}`}
              </span>
            </div>
          </div>
        )}

        {!showProfitBar && !showDrawdownBar && hasProfitTarget && hasDrawdown && (
          <div className="text-xs text-zinc-500 italic">
            Add trades to see progress
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Dashboard"
        description="Account performance & equity analytics"
        actions={
          <>
            <NotificationBell onViewAll={() => setView('notices')} />
            {renderAccountFilter()}

            <button
              onClick={() => { resetCalculator(); setShowAddAccount(true); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors flex-shrink-0",
                theme !== 'light'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
              )}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Account</span>
            </button>
          </>
        }
      />

      {/* Hero overview: Total P&L, with the Discipline Tracker as a slim status banner beneath it */}
      <div className="flex flex-col gap-4">
        {/* Total P&L */}
        <div className={cn(
          "relative overflow-hidden border rounded-2xl p-4 sm:p-6 transition-colors duration-300 min-w-0",
          theme !== 'light'
            ? 'bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-900/60 border-zinc-800'
            : 'bg-gradient-to-br from-white via-zinc-50 to-zinc-100 border-zinc-200'
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] via-transparent to-emerald-500/[0.05] pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
            <div className="min-w-0">
              <p className={cn("text-xs uppercase tracking-wider font-medium mb-2", tc.textMuted)}>Total Profit &amp; Loss</p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className={cn('text-3xl sm:text-4xl font-bold tracking-tight tabular-nums', stats.totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                  {formatCurrency(stats.totalPnL, privacyMode)}
                </span>
                <span className={cn('flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-lg flex-shrink-0', stats.growth >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500')}>
                  {stats.growth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {stats.growth >= 0 ? '+' : ''}{stats.growth.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <div className={cn("px-3 py-2 rounded-xl min-w-[84px]", theme !== 'light' ? 'bg-zinc-800/50' : 'bg-zinc-100')}>
                <p className={cn("text-[10px] uppercase tracking-wider", tc.textMuted)}>Trades</p>
                <p className={cn("text-sm font-semibold tabular-nums", tc.text)}>{stats.totalTrades}</p>
              </div>
              <div className={cn("px-3 py-2 rounded-xl min-w-[84px]", theme !== 'light' ? 'bg-zinc-800/50' : 'bg-zinc-100')}>
                <p className={cn("text-[10px] uppercase tracking-wider", tc.textMuted)}>Win Rate</p>
                <p className={cn("text-sm font-semibold tabular-nums", tc.text)}>{stats.winRate.toFixed(1)}%</p>
              </div>
              <div className={cn("px-3 py-2 rounded-xl min-w-[84px]", theme !== 'light' ? 'bg-zinc-800/50' : 'bg-zinc-100')}>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Profit Factor</p>
                <p className="text-sm font-semibold text-white tabular-nums">{isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : 'N/A'}</p>
              </div>
            </div>
          </div>
          <div ref={equityChartContainerRef} className="relative">
            {renderEquityChart()}
          </div>
        </div>

        {/* Discipline Tracker — slim, high-contrast status banner. Discipline is the most
            critical behavioral metric, so it gets a glowing accent treatment rather than
            competing for space as a tall card. */}
        {(() => {
          const followed = filteredTrades.filter(t => t.rulesFollowed === 'followed').length;
          const broken = filteredTrades.filter(t => t.rulesFollowed === 'broken').length;
          const totalTrades = filteredTrades.length;
          const pending = Math.max(0, totalTrades - followed - broken);
          // Honest follow rate: unreviewed trades count against the score, not toward it —
          // 1 followed out of 10 total shows 10%, not 100%.
          const followRate = totalTrades > 0 ? (followed / totalTrades) * 100 : 0;
          // 5-tier status scale:
          //   0–30   -> red, glowing   (critical, emphasized)
          //   30–50  -> red            (critical)
          //   50–60  -> yellow         (warning)
          //   60–80  -> green          (healthy)
          //   80–100 -> green, glowing (healthy, emphasized)
          const isCriticalGlow = totalTrades > 0 && followRate < 30;
          const isCritical = totalTrades > 0 && followRate >= 30 && followRate < 50;
          const isWarning = totalTrades > 0 && followRate >= 50 && followRate < 60;
          const isHealthy = totalTrades > 0 && followRate >= 60 && followRate < 80;
          const isHealthyGlow = totalTrades > 0 && followRate >= 80;
          const isRed = isCriticalGlow || isCritical;
          const isGreen = isHealthy || isHealthyGlow;
          return (
            <div
              className={cn(
                'relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-l-4 bg-zinc-900/40 border-zinc-800/80 p-4 sm:px-5 sm:py-3.5 min-w-0 transition-all duration-300',
                isRed && 'border-l-rose-500',
                isWarning && 'border-l-amber-500',
                isGreen && 'border-l-emerald-500',
                isCriticalGlow && 'shadow-[0_0_22px_rgba(244,63,94,0.22)]',
                isHealthyGlow && 'shadow-[0_0_22px_rgba(16,185,129,0.22)]'
              )}
            >
              {/* Left: label + headline follow rate — its own flex-wrap group so the
                  percentage/label/progress-bar cluster wraps onto a second line
                  instead of overflowing into the badges on narrow screens. */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0 w-full sm:w-auto sm:flex-1">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Brain className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-white tracking-tight truncate">Discipline</h3>
                </div>

                <div className="flex items-baseline gap-1.5 flex-shrink-0">
                  <span className={cn('text-2xl font-bold tabular-nums leading-none', isGreen ? 'text-emerald-400' : isRed ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-white')}>
                    {followRate.toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider whitespace-nowrap">follow rate</span>
                </div>

                {/* Thin inline progress bar fills remaining space on wider screens — single
                    fill proportional to the honest follow rate, colored by status tier so a
                    low rate reads as a short red bar rather than a full segmented bar. */}
                <div className="hidden sm:block flex-1 max-w-[220px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isRed && 'bg-rose-500',
                      isWarning && 'bg-amber-500',
                      isGreen && 'bg-emerald-500'
                    )}
                    style={{ width: `${followRate}%` }}
                  />
                </div>
              </div>

              {/* Right: minimal status pills + Full button */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-semibold tabular-nums">{followed}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400">
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-semibold tabular-nums">{broken}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-semibold tabular-nums">{pending}</span>
                </div>
                <button
                  onClick={() => setView('discipline')}
                  className="group flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors flex-shrink-0 pl-2.5 pr-2 py-1 rounded-full ml-1"
                >
                  <span>Full</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {renderStatCard('Avg Win', formatCurrency(stats.avgWin, privacyMode), <TrendingUp className="w-4 h-4" />, 'text-emerald-400')}
        {renderStatCard('Avg Loss', formatCurrency(-stats.avgLoss, privacyMode), <TrendingDown className="w-4 h-4" />, 'text-rose-400')}

        {/* Win / Loss Ratio — replaces the redundant Total Trades count with
            an actionable breakdown of wins vs. losses, dual-color coded. */}
        <div className={cn(
          "group rounded-2xl p-4 flex items-center gap-3 min-w-0 transition-all duration-200",
          theme !== 'light'
            ? 'bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70'
            : 'bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
        )}>
          <div className={cn('p-2.5 rounded-xl flex-shrink-0', theme !== 'light' ? 'bg-zinc-800/60' : 'bg-zinc-100')}>
            <Scale className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("text-[11px] uppercase tracking-wider truncate font-medium", tc.textMuted)}>Win / Loss Ratio</p>
            <p className="text-lg font-semibold truncate tabular-nums flex items-baseline gap-1.5">
              <span>
                <span className="text-emerald-500">{stats.wins}W</span>
                <span className={cn("mx-1", tc.textMuted)}>-</span>
                <span className="text-rose-500">{stats.losses}L</span>
              </span>
              <span className={cn("text-[10px] font-normal truncate", tc.textMuted)}>
                ({stats.totalTrades} · {stats.winRate.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>

        {/* Rules Streak — replaces Win Rate (already shown in the Equity
            Chart summary badges above) with the current run of 100%
            rule-compliant trades, the more actionable discipline signal. */}
        <div className={cn(
          "group rounded-2xl p-4 flex items-center gap-3 min-w-0 transition-all duration-200",
          theme !== 'light'
            ? 'bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70'
            : 'bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
        )}>
          <div className={cn(
            'p-2.5 rounded-xl flex-shrink-0',
            stats.disciplineStreak > 0
              ? 'bg-amber-500/10 text-amber-400'
              : theme !== 'light' ? 'bg-zinc-800/60 text-zinc-400' : 'bg-zinc-100 text-zinc-400'
          )}>
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("text-[11px] uppercase tracking-wider truncate font-medium", tc.textMuted)}>Rules Streak</p>
            <div className="flex items-center gap-1.5 min-w-0">
              <p className={cn('text-lg font-semibold truncate tabular-nums', tc.text)}>
                {stats.disciplineStreak} {stats.disciplineStreak === 1 ? 'Trade' : 'Trades'}
              </p>
              {stats.disciplineStreak > 0 && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accounts */}
      <div>
        <h3 className={cn("text-xs font-semibold uppercase tracking-wider mb-3", tc.textMuted)}>Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(account => {
            const accountTrades = trades.filter(t => t.accountId === account.id);
            const accountPnL = accountTrades.reduce((s, t) => s + t.profitLoss, 0);
            const isPositive = accountPnL >= 0;
            const metrics = calculateAccountMetrics(account, accountTrades);

            return (
              <div key={account.id} className={cn(
                'group relative rounded-2xl p-4 min-w-0 overflow-hidden transition-all duration-200',
                theme !== 'light'
                  ? 'bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70'
                  : 'bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
                metrics.isBreached && 'border-rose-500/30'
              )}>
                <div className={cn('absolute left-0 top-0 bottom-0 w-1', metrics.isBreached ? 'bg-rose-500' : isPositive ? 'bg-emerald-500/60' : 'bg-rose-500/60')} />
                <div className="pl-2">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className={cn("font-semibold truncate mb-1", tc.text)}>{account.name}</h3>
                      <p className={cn("text-xs truncate", tc.textMuted)}>{account.propFirm || 'No prop firm'}</p>
                      <div className="mt-1.5">
                        {renderTradingAccountTypeBadge(account)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingAccount(account);
                          resetCalculator();
                          setShowEditAccount(account.id);
                        }}
                        className={cn("p-1 opacity-0 group-hover:opacity-100 transition-opacity", theme !== 'light' ? 'text-zinc-600 hover:text-white' : 'text-zinc-400 hover:text-zinc-900')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-1 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {renderAccountTypeBadge(account)}
                    </div>
                  </div>

                  {renderProgressBar(account)}

                  <div className="mb-3 mt-3">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className={cn("text-xs", tc.textMuted)}>P&amp;L</span>
                      <span className={cn('text-sm font-semibold tabular-nums', isPositive ? 'text-emerald-500' : 'text-rose-500')}>
                        {formatCurrency(accountPnL, privacyMode)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider truncate">Starting</p>
                      <p className="text-xs text-zinc-300 truncate tabular-nums">{privacyMode ? '****' : `$${account.startingBalance.toLocaleString()}`}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider truncate">Current</p>
                      <p className="text-xs text-zinc-300 truncate tabular-nums">{privacyMode ? '****' : `$${metrics.currentBalance.toLocaleString()}`}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider truncate">Trades</p>
                      <p className="text-xs text-zinc-300 truncate tabular-nums">{accountTrades.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {accounts.length === 0 && (
            <div className="col-span-full text-center text-zinc-600 py-8 border border-dashed border-zinc-800 rounded-2xl">
              No accounts yet. Add your first account to get started.
            </div>
          )}
        </div>
      </div>

      {/* Recent trades */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-white tracking-tight">Recent Trades</h3>
          <button onClick={() => { resetTradeForm(); resetCalculator(); setShowAddTrade(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Trade</span>
          </button>
        </div>
        <div className="space-y-2">
          {filteredTrades.slice(0, 5).map(trade => {
            const account = accounts.find(a => a.id === trade.accountId);
            const isWin = trade.profitLoss >= 0;
            return (
              <div key={trade.id} onClick={() => { setShowTradeDetail(trade.id); setShowExpandGallery(false); }} className="relative flex items-center justify-between p-3 pl-4 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/60 cursor-pointer transition-colors min-w-0 overflow-hidden">
                <div className={cn('absolute left-0 top-0 bottom-0 w-0.5', isWin ? 'bg-emerald-500/60' : 'bg-rose-500/60')} />
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>
                    {isWin ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{trade.symbol}</p>
                    <p className="text-xs text-zinc-500 truncate">{account?.name} | {trade.setupTypes.join(', ') || 'No setup'}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className={cn('font-mono font-medium tabular-nums', isWin ? 'text-emerald-400' : 'text-rose-400')}>
                    {formatCurrency(trade.profitLoss, privacyMode)}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDate(trade.date)}</p>
                </div>
              </div>
            );
          })}
          {filteredTrades.length === 0 && (
            <p className="text-center text-zinc-600 py-8">No trades yet. Add your first trade to get started.</p>
          )}
        </div>
        {filteredTrades.length > 5 && (
          <button onClick={() => setView('trades')} className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 text-sm text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 rounded-xl transition-colors">
            <span>View All Trades ({filteredTrades.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
