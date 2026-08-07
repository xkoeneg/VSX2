import type React from 'react';
import { useState } from 'react';
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
import { formatCurrency, formatCurrencyAbsolute, formatDate } from '../utils/format';
import { TrackingBadge } from '../components/shared/TrackingBadge';
import { SessionBadge } from '../components/shared/SessionBadge';
import { PageHeader } from '../components/shared/PageHeader';
import { SESSION_OPTIONS, SESSION_SHORT_LABEL } from '../constants/trading';
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

export function TradesScreen() {
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


  const SORT_FIELD_LABELS = { date: 'Date', pnl: 'P&L', rr: 'R:R' } as const;
  type GallerySize = 'small' | 'medium' | 'large';
  const GALLERY_SIZE_LABELS: Record<GallerySize, string> = { small: 'Small', medium: 'Medium', large: 'Large' };
  const GALLERY_SIZE_COLUMNS: Record<GallerySize, { base: number; sm: number; md: number; lg: number; xl: number }> = {
    small: { base: 2, sm: 3, md: 4, lg: 4, xl: 6 },
    medium: { base: 1, sm: 1, md: 2, lg: 3, xl: 4 },
    large: { base: 1, sm: 1, md: 2, lg: 3, xl: 3 },
  };
  const [gallerySize, setGallerySize] = useState<GallerySize>('small');
  const galleryColumnCount = (() => {
    const cols = GALLERY_SIZE_COLUMNS[gallerySize];
    if (viewportWidth >= 1280) return cols.xl;
    if (viewportWidth >= 1024) return cols.lg;
    if (viewportWidth >= 768) return cols.md;
    if (viewportWidth >= 640) return cols.sm;
    return cols.base;
  })();
  const activeTradeFilterCount = (selectedAccounts.includes('all') ? 0 : 1) + (tradeFilter !== 'all' ? 1 : 0);
  const resetTradeControls = () => {
    setSelectedAccounts(['all']);
    setTradeFilter('all');
    setTradeSortField('date');
    setTradeSortOrder('desc');
  };

  // ---- Notion-style Trade History ----
  // Two sub-views share the same sidebar entry (no new menu items):
  // 1. "overview" — a lightweight inline page: a 6-card featured gallery on
  //    top, then a 5-row "RECENT ENTRIES" preview with an "Open Full Database"
  //    button that swaps to the database sub-view.
  // 2. "database" — a full-width Notion-spreadsheet view with breadcrumbs, a
  //    filter bar (search / account / session / outcome / rules), a dense
  //    table of all trades, and pagination.

  const recentTrades = filteredTrades;
  const recentPreviewTrades = filteredTrades.slice(0, 10);


  const renderFeaturedCard = (trade: Trade) => {
    const account = accounts.find(a => a.id === trade.accountId);
    const coverImage = trade.executionImages[0]?.url || trade.timeframes.flatMap(tf => tf.images)[0]?.url;
    const isWin = trade.profitLoss >= 0;
    const isBreakeven = Math.abs(trade.profitLoss) < 10;
    const isSelected = selectedTradeIds.includes(trade.id);
    const outcomeCardClass = isBreakeven
      ? 'bg-zinc-800/50 group-hover:bg-zinc-800/70'
      : isWin
        ? 'bg-emerald-900 border-t-0 shadow-none group-hover:bg-emerald-800'
        : 'bg-rose-900 border-t-0 shadow-none group-hover:bg-rose-800';
    // Dynamic outcome border — same exact color as the fill so the border
    // line and the card body read as one solid color, strengthening on hover.
    const outcomeBorderClass = isBreakeven
      ? 'border-zinc-700 hover:border-zinc-500'
      : isWin
        ? 'border-emerald-800 hover:border-emerald-600'
        : 'border-rose-800 hover:border-rose-600';

    // CRITICAL: while in select mode, a click anywhere on the card (including the
    // checkbox overlay) must ONLY toggle selection — it must never open the Trade
    // Details modal. Trade Details can only open when select mode is OFF.
    const handleCardClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (tradeSelectMode) {
        toggleTradeSelected(trade.id);
        return;
      }
      setShowTradeDetail(trade.id);
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleTradeSelected(trade.id);
    };

    return (
      <div
        key={trade.id}
        onClick={handleCardClick}
        className={cn(
          "group h-full flex flex-col border rounded-xl overflow-hidden cursor-pointer bg-[#16181e] transition-all duration-200 ease-out min-w-0 shadow-[0_10px_30px_rgba(0,0,0,0.8)]",
          tradeSelectMode
            ? isSelected
              ? 'border-indigo-400/80 ring-2 ring-indigo-400/40'
              : 'border-zinc-800/70 hover:border-zinc-600'
            : cn(outcomeBorderClass, 'hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.9)]')
        )}
      >
        <div className="aspect-video bg-zinc-800 flex items-center justify-center relative overflow-hidden flex-shrink-0">
          <span className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded bg-black/60 text-[10px] font-mono font-bold text-zinc-300 border border-white/10 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            {getDisplayTradeNumber(trade)}
          </span>
          {tradeSelectMode && (
            <button
              type="button"
              onClick={handleCheckboxClick}
              className={cn(
                'absolute top-2 right-2 z-20 flex items-center justify-center w-5 h-5 rounded-md border transition-colors',
                isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-black/50 border-white/40 text-transparent hover:border-white/70'
              )}
              aria-label={isSelected ? 'Unselect trade' : 'Select trade'}
            >
              <Check className="w-3 h-3" />
            </button>
          )}
          {coverImage ? (
            <img src={coverImage} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-zinc-600">
              <ImageIcon className="w-7 h-7" />
              <span className="text-[10px]">No image</span>
            </div>
          )}
          {/* Badge row at the bottom of the thumbnail */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-end gap-1.5 px-2.5 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
            <span className={cn('flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold', trade.rulesFollowed === 'followed' ? 'bg-emerald-500 text-emerald-950' : 'bg-rose-500 text-rose-950')}>
              {trade.rulesFollowed === 'followed' ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
            </span>
          </div>
          {tradeSelectMode && isSelected && (
            <div className="absolute inset-0 bg-indigo-500/10 z-[5] pointer-events-none" />
          )}
        </div>
        <div className={cn('p-3.5 min-w-0 flex-1 flex flex-col transition-colors duration-200', outcomeCardClass)}>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold truncate tracking-tight text-sm min-w-0 text-white">{trade.symbol}</h4>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={cn('text-sm font-mono font-bold tracking-tight whitespace-nowrap', isBreakeven ? 'text-zinc-300' : isWin ? 'text-green-300' : 'text-red-300')}>
                {formatCurrency(trade.profitLoss, privacyMode)}
              </span>
              {trade.trackingNumber && <TrackingBadge value={trade.trackingNumber} size="sm" />}
            </div>
          </div>
          <p className="text-xs text-zinc-300 truncate mt-0.5">{account?.name}</p>
          {/* Fixed-height row so cards without a session still take up the same
              vertical space as cards that have one — keeps every card (and every
              grid row) the exact same height. */}
          <div className="flex items-center mt-2 min-h-[20px]">
            {trade.session && <SessionBadge value={trade.session} size="sm" />}
          </div>
          {/* Fixed-height footer row so cards without setup badges still match
              the height of cards that have them. */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-2 min-h-[26px] min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              {trade.setupTypes.slice(0, 1).map(s => (
                <span key={s} className="px-1.5 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded text-[10px] text-zinc-300 whitespace-nowrap">{s}</span>
              ))}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap flex-shrink-0">{formatDate(trade.date)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewView = () => (
    <div className="space-y-6 min-w-0">
      {/* Page header */}
      <PageHeader
        title="Trade History"
        description="Analyze trade execution history & trade logs"
        actions={
          <>
            {renderAccountFilter()}

            <button
              type="button"
              onClick={toggleTradeSelectMode}
              className={cn(
                'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors border',
                tradeSelectMode
                  ? 'bg-white text-black border-white hover:bg-zinc-200'
                  : theme !== 'light'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
              )}
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">{tradeSelectMode ? 'Cancel' : 'Select'}</span>
            </button>
            <button
              type="button"
              disabled={isImportingTrades}
              onClick={() => tradeImportInputRef.current?.click()}
              title={isImportingTrades ? 'Importing…' : 'Import MT4/MT5'}
              aria-label={isImportingTrades ? 'Importing…' : 'Import MT4/MT5'}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-colors border flex-shrink-0',
                theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200',
                isImportingTrades && 'opacity-60 cursor-not-allowed'
              )}
            >
              <Upload className={cn('w-4 h-4', isImportingTrades && 'animate-pulse')} />
            </button>
            <button onClick={() => { resetTradeForm(); resetCalculator(); setShowAddTrade(true); }} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Trade</span>
            </button>
          </>
        }
      />

      {tradeSelectMode && (
        <div className={cn(
          'flex items-center justify-between flex-wrap gap-3 px-4 py-3 rounded-xl border sticky top-0 z-20',
          theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        )}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAllTrades}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
              )}
            >
              {selectedTradeIds.length === filteredTrades.length && filteredTrades.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            <span className={cn('text-sm', tc.textMuted)}>{selectedTradeIds.length} selected</span>
          </div>
          <button
            type="button"
            onClick={handleDeleteSelectedTrades}
            disabled={selectedTradeIds.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 bg-rose-500/90 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedTradeIds.length})
          </button>
        </div>
      )}

      {/* METRICS INDICATOR BAR — compact summary stats, directly above the gallery.
          WINS / LOSSES / BE are clickable and toggle `tradeFilter` to narrow the
          gallery + table below to just that outcome; clicking the active one again
          clears it back to 'all'. TOTAL is informational only, not clickable. */}
      <div className={cn(
        "flex items-center justify-between bg-zinc-900/40 border border-zinc-800/80 rounded-xl px-5 py-3 mb-4",
        theme === 'light' && 'bg-white border-zinc-200'
      )}>
        <span className="text-xs font-medium tracking-wide">
          <span className="text-zinc-500">TOTAL:</span>{' '}
          <span className={cn("font-semibold tabular-nums", tc.text)}>{accountFilteredTrades.length}</span>
        </span>
        <button
          type="button"
          onClick={() => setTradeFilter(prev => prev === 'profit' ? 'all' : 'profit')}
          className={cn(
            "text-xs font-medium tracking-wide px-2 py-1 -my-1 rounded-lg transition-colors",
            tradeFilter === 'profit' ? 'bg-emerald-500/10 ring-1 ring-emerald-500/40' : 'hover:bg-white/5'
          )}
        >
          <span className="text-zinc-500">WINS:</span>{' '}
          <span className="text-emerald-400 font-semibold tabular-nums">{accountFilteredTrades.filter(t => t.profitLoss >= 10).length}</span>
        </button>
        <button
          type="button"
          onClick={() => setTradeFilter(prev => prev === 'loss' ? 'all' : 'loss')}
          className={cn(
            "text-xs font-medium tracking-wide px-2 py-1 -my-1 rounded-lg transition-colors",
            tradeFilter === 'loss' ? 'bg-rose-500/10 ring-1 ring-rose-500/40' : 'hover:bg-white/5'
          )}
        >
          <span className="text-zinc-500">LOSSES:</span>{' '}
          <span className="text-rose-400 font-semibold tabular-nums">{accountFilteredTrades.filter(t => t.profitLoss <= -10).length}</span>
        </button>
        <button
          type="button"
          onClick={() => setTradeFilter(prev => prev === 'breakeven' ? 'all' : 'breakeven')}
          className={cn(
            "text-xs font-medium tracking-wide px-2 py-1 -my-1 rounded-lg transition-colors",
            tradeFilter === 'breakeven' ? 'bg-amber-500/10 ring-1 ring-amber-500/40' : 'hover:bg-white/5'
          )}
        >
          <span className="text-zinc-500">BE:</span>{' '}
          <span className="text-amber-400 font-semibold tabular-nums">{accountFilteredTrades.filter(t => Math.abs(t.profitLoss) < 10).length}</span>
        </button>
        <span className="text-xs font-medium tracking-wide">
          <span className="text-zinc-500">WIN RATE:</span>{' '}
          <span className={cn("font-semibold tabular-nums", tc.text)}>
            {(() => {
              const wins = accountFilteredTrades.filter(t => t.profitLoss >= 10).length;
              const losses = accountFilteredTrades.filter(t => t.profitLoss <= -10).length;
              const decided = wins + losses;
              return decided > 0 ? `${((wins / decided) * 100).toFixed(1)}%` : '—';
            })()}
          </span>
        </span>
      </div>
      {tradeFilter !== 'all' && (
        <div className="flex items-center gap-2 -mt-2 mb-4">
          <span className="text-xs text-zinc-500">
            Showing only {tradeFilter === 'profit' ? 'wins' : tradeFilter === 'loss' ? 'losses' : 'breakeven trades'}
          </span>
          <button
            type="button"
            onClick={() => setTradeFilter('all')}
            className="text-xs text-zinc-400 hover:text-white underline underline-offset-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* TOP SECTION — Featured Gallery Grid (scrollable frame, all trades) */}
      {recentTrades.length > 0 && (
        <div>
          {/* Frame — matches the Discipline Tracker card tone/border exactly. The frame IS the
              scroll container: cards scroll edge-to-edge against its inner walls, no nested wrapper. */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl max-h-[520px] overflow-y-auto overscroll-contain scroll-smooth p-5 shadow-[0_20px_45px_rgba(0,0,0,0.5),inset_0_2px_12px_rgba(0,0,0,0.25)] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {recentTrades.map(renderFeaturedCard)}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION — Recent Entry Log Preview */}
      <div className="!mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Entries</h3>
          <button
            type="button"
            onClick={() => setTradeSubView('database')}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Expand className="w-3.5 h-3.5" />
            Open Full Database
          </button>
        </div>

        <div className={cn(
          "rounded-xl overflow-hidden",
          theme !== 'light' ? 'bg-zinc-900/40 border border-zinc-800/80' : 'bg-white border border-zinc-200'
        )}>
          {recentPreviewTrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">#</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Date</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Account</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Symbol</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Side</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Session</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Setups</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium text-right">R-Multiple</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium text-right">P&amp;L</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPreviewTrades.map(trade => {
                    const account = accounts.find(a => a.id === trade.accountId);
                    const isWin = trade.profitLoss >= 0;
                    const rowRR = trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : null;
                    const side = trade.profitLoss >= 0 ? 'LONG' : 'SHORT';
                    const isRowSelected = selectedTradeIds.includes(trade.id);

                    // CRITICAL: while in select mode, clicking the row (or its checkbox)
                    // must ONLY toggle selection and must never open Trade Details.
                    const handleRowClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (tradeSelectMode) {
                        toggleTradeSelected(trade.id);
                        return;
                      }
                      setShowTradeDetail(trade.id);
                    };

                    return (
                      <tr
                        key={trade.id}
                        onClick={handleRowClick}
                        className={cn(
                          "border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors",
                          tradeSelectMode && isRowSelected && "bg-indigo-500/10"
                        )}
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {tradeSelectMode && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleTradeSelected(trade.id); }}
                                className={cn(
                                  'flex items-center justify-center w-4 h-4 rounded border transition-colors flex-shrink-0',
                                  isRowSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-zinc-600 text-transparent hover:border-zinc-400'
                                )}
                                aria-label={isRowSelected ? 'Unselect trade' : 'Select trade'}
                              >
                                <Check className="w-2.5 h-2.5" />
                              </button>
                            )}
                            <span className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50 text-[11px] font-mono font-semibold text-zinc-300">
                              {getDisplayTradeNumber(trade)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-zinc-400 whitespace-nowrap">{formatDate(trade.date)}</td>
                        <td className="px-3 py-2.5 text-sm text-zinc-400 whitespace-nowrap truncate max-w-[160px]">
                          {account ? account.name : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-white font-semibold truncate max-w-[100px]">{trade.symbol}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide',
                            isWin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-500'
                          )}>
                            {side}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-zinc-500 whitespace-nowrap">
                          {trade.session ? (SESSION_SHORT_LABEL[trade.session] || trade.session.toLowerCase()) : '-'}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-[220px]">
                            {trade.setupTypes.length > 0 ? trade.setupTypes.slice(0, 2).map(s => (
                              <span key={s} className="px-1.5 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded text-[10px] text-zinc-300 whitespace-nowrap">{s}</span>
                            )) : <span className="text-xs text-zinc-600">-</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs font-medium text-right whitespace-nowrap">
                          {rowRR !== null ? (
                            <span className={cn('px-1.5 py-0.5 rounded border', rowRR >= 1 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : rowRR >= 0 ? 'text-zinc-300 border-zinc-700 bg-zinc-800/60' : 'text-rose-500 border-rose-500/30 bg-rose-500/10')}>
                              {rowRR >= 1 ? '+' : ''}{rowRR.toFixed(2)}R
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-mono text-right font-bold whitespace-nowrap">
                          <span className={isWin ? 'text-emerald-400' : 'text-rose-500'}>{formatCurrency(trade.profitLoss, privacyMode)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {!tradeSelectMode && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); openEditTrade(trade); }}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                              title="Edit trade"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                <TrendingUp className="w-7 h-7 text-zinc-600" />
              </div>
              <h3 className="text-base font-medium text-white mb-1.5">No trades yet</h3>
              <p className="text-zinc-500 mb-3 text-sm">Add your first trade to get started</p>
              <button onClick={() => { resetTradeForm(); setShowAddTrade(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
                <Plus className="w-4 h-4" />
                Add Trade
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDatabaseView = () => {
    const activeDbFilterCount =
      (dbSearch.trim() ? 1 : 0) +
      (dbAccountFilter !== 'all' ? 1 : 0) +
      (dbSessionFilter !== 'all' ? 1 : 0) +
      (dbOutcomeFilter !== 'all' ? 1 : 0) +
      (dbRulesFilter !== 'all' ? 1 : 0);

    const resetDbFilters = () => {
      setDbSearch('');
      setDbAccountFilter('all');
      setDbSessionFilter('all');
      setDbOutcomeFilter('all');
      setDbRulesFilter('all');
      setDbPage(0);
    };

    return (
      <div className="space-y-5 min-w-0">
        {/* Breadcrumbs + back button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <button
              type="button"
              onClick={() => setTradeSubView('overview')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white transition-all text-xs font-medium cursor-pointer flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Overview</span>
            </button>
            <span className="text-zinc-700">/</span>
            <span className="text-white font-medium truncate">All Trades Database</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* All Accounts — same global account filter used on the Dashboard,
                exposed here too since it already drives dbFilteredTrades via
                filteredTrades -> accountFilteredTrades. */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              >
                <Filter className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate max-w-[120px]">{selectedAccounts.includes('all') ? 'All Accounts' : `${selectedAccounts.length} Selected`}</span>
                <ChevronsUpDown className="w-4 h-4 flex-shrink-0" />
              </button>

              {showAccountDropdown && (
                <div className="absolute right-0 sm:left-0 mt-2 min-w-[200px] w-64 rounded-lg shadow-xl z-50 p-2 bg-zinc-900 border border-zinc-800">
                  <button
                    onClick={() => setSelectedAccounts(['all'])}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded text-sm truncate transition-colors',
                      selectedAccounts.includes('all') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800'
                    )}
                  >
                    All Accounts
                  </button>
                  <div className="my-2 border-t border-zinc-800" />
                  {accounts.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        if (selectedAccounts.includes('all')) {
                          setSelectedAccounts([acc.id]);
                        } else if (selectedAccounts.includes(acc.id)) {
                          const newSelection = selectedAccounts.filter(a => a !== acc.id);
                          setSelectedAccounts(newSelection.length === 0 ? ['all'] : newSelection);
                        } else {
                          setSelectedAccounts([...selectedAccounts, acc.id]);
                        }
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-colors',
                        selectedAccounts.includes(acc.id) ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800'
                      )}
                    >
                      <span className="truncate flex-1 mr-2">{acc.name}</span>
                      {renderAccountTypeBadge(acc)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Table / Gallery view toggle */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-zinc-800 border border-zinc-700 flex-shrink-0">
              <button
                type="button"
                onClick={() => setDbViewMode('table')}
                title="Table view"
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
                  dbViewMode === 'table' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDbViewMode('gallery')}
                title="Gallery view"
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
                  dbViewMode === 'gallery' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              disabled={isImportingTrades}
              onClick={() => tradeImportInputRef.current?.click()}
              title={isImportingTrades ? 'Importing…' : 'Import MT4/MT5'}
              aria-label={isImportingTrades ? 'Importing…' : 'Import MT4/MT5'}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-colors border flex-shrink-0',
                theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200',
                isImportingTrades && 'opacity-60 cursor-not-allowed'
              )}
            >
              <Upload className={cn('w-4 h-4', isImportingTrades && 'animate-pulse')} />
            </button>
            <button onClick={() => { resetTradeForm(); resetCalculator(); setShowAddTrade(true); }} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors flex-shrink-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Trade</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={dbSearch}
              onChange={(e) => { setDbSearch(e.target.value); setDbPage(0); }}
              placeholder="Search trades..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <select
            value={dbAccountFilter}
            onChange={(e) => { setDbAccountFilter(e.target.value); setDbPage(0); }}
            className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
          >
            <option value="all">All Accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={dbSessionFilter}
            onChange={(e) => { setDbSessionFilter(e.target.value); setDbPage(0); }}
            className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
          >
            <option value="all">All Sessions</option>
            {SESSION_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={dbOutcomeFilter}
            onChange={(e) => { setDbOutcomeFilter(e.target.value as TradeFilter); setDbPage(0); }}
            className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
          >
            <option value="all">All Outcomes</option>
            <option value="profit">Profit</option>
            <option value="loss">Loss</option>
            <option value="breakeven">Breakeven</option>
          </select>
          <select
            value={dbRulesFilter}
            onChange={(e) => { setDbRulesFilter(e.target.value as 'all' | 'followed' | 'broken'); setDbPage(0); }}
            className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
          >
            <option value="all">All Rules</option>
            <option value="followed">Rules Followed</option>
            <option value="broken">Rules Broken</option>
          </select>
          {activeDbFilterCount > 0 && (
            <button
              type="button"
              onClick={resetDbFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Clear ({activeDbFilterCount})
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-zinc-500">
            {dbFilteredTrades.length} {dbFilteredTrades.length === 1 ? 'trade' : 'trades'}
          </p>
        </div>

        {/* Full-page table / gallery */}
        {dbPagedTrades.length > 0 ? (
          dbViewMode === 'gallery' ? (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dbPagedTrades.map(trade => renderFeaturedCard(trade))}
              </div>

              {/* Pagination */}
              {dbPageCount > 1 && (
                <div className="flex items-center justify-between px-1 pt-4 mt-4 border-t border-white/10 flex-wrap gap-2">
                  <p className="text-xs text-zinc-500">
                    Page {dbPage + 1} of {dbPageCount} · {dbFilteredTrades.length} total
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDbPage(p => Math.max(0, p - 1))}
                      disabled={dbPage === 0}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>
                    <span className="text-xs text-zinc-500 px-2">{dbPage + 1} / {dbPageCount}</span>
                    <button
                      type="button"
                      onClick={() => setDbPage(p => Math.min(dbPageCount - 1, p + 1))}
                      disabled={dbPage >= dbPageCount - 1}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-zinc-800/70 text-left bg-white/[0.02]">
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Outcome</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Date</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Trade #</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Session</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Position</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium text-right">Net P&L</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium text-right">R Multiple</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium text-right">Risk ($)</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Symbol</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Strategy</th>
                    <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Account</th>
                  </tr>
                </thead>
                <tbody>
                  {dbPagedTrades.map(trade => {
                    const account = accounts.find(a => a.id === trade.accountId);
                    const isWin = trade.profitLoss >= 0;
                    const isBreakeven = Math.abs(trade.profitLoss) < 10;
                    const rowRR = trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : null;
                    const position = trade.profitLoss >= 0 ? 'Long' : 'Short';
                    return (
                      <tr
                        key={trade.id}
                        onClick={() => setShowTradeDetail(trade.id)}
                        className="border-b border-zinc-800/70 hover:bg-white/[0.02] cursor-pointer transition-colors"
                      >
                        <td className="px-3 py-2.5">
                          <span className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide',
                            isBreakeven ? 'bg-zinc-700/40 text-zinc-300' : isWin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/10 text-rose-500'
                          )}>
                            {isBreakeven ? 'B/E' : isWin ? 'Win' : 'Loss'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-zinc-400 whitespace-nowrap">{formatDate(trade.date)}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm text-zinc-500 font-mono flex-shrink-0">{getDisplayTradeNumber(trade)}</span>
                            {trade.trackingNumber && <TrackingBadge value={trade.trackingNumber} size="sm" />}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-zinc-400">
                          {trade.session ? (SESSION_SHORT_LABEL[trade.session] || trade.session.toLowerCase()) : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-zinc-400">{position}</td>
                        <td className="px-3 py-2.5 text-sm font-mono text-right font-bold whitespace-nowrap">
                          <span className={isWin ? 'text-emerald-400' : 'text-rose-500'}>{formatCurrency(trade.profitLoss, privacyMode)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-xs font-medium text-right whitespace-nowrap">
                          {rowRR !== null ? (
                            <span className={cn('px-1.5 py-0.5 rounded border', rowRR >= 1 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : rowRR >= 0 ? 'text-zinc-300 border-zinc-700 bg-zinc-800/60' : 'text-rose-500 border-rose-500/30 bg-rose-500/10')}>
                              {rowRR >= 1 ? '+' : ''}{rowRR.toFixed(2)}R
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-zinc-400 text-right whitespace-nowrap">
                          {trade.riskAmount > 0 ? formatCurrencyAbsolute(trade.riskAmount, privacyMode) : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-white font-semibold truncate max-w-[100px]">{trade.symbol}</td>
                        <td className="px-3 py-2.5 text-sm text-zinc-400 truncate max-w-[120px]">{trade.setupTypes.join(', ') || '-'}</td>
                        <td className="px-3 py-2.5 text-sm text-zinc-400 truncate max-w-[120px]">{account?.name || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {dbPageCount > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 flex-wrap gap-2">
                <p className="text-xs text-zinc-500">
                  Page {dbPage + 1} of {dbPageCount} · {dbFilteredTrades.length} total
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDbPage(p => Math.max(0, p - 1))}
                    disabled={dbPage === 0}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <span className="text-xs text-zinc-500 px-2">{dbPage + 1} / {dbPageCount}</span>
                  <button
                    type="button"
                    onClick={() => setDbPage(p => Math.min(dbPageCount - 1, p + 1))}
                    disabled={dbPage >= dbPageCount - 1}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          )
        ) : (
          <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <Database className="w-7 h-7 text-zinc-600" />
            </div>
            <h3 className="text-base font-medium text-white mb-1.5">No trades match your filters</h3>
            <p className="text-zinc-500 mb-3 text-sm">Try adjusting or clearing your filters</p>
            <button onClick={resetDbFilters} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Hidden file input for MT4/MT5 import — shared by the trigger button(s)
          in both the Overview and Database sub-views below (only one of
          which is ever mounted at a time). */}
      <input
        ref={tradeImportInputRef}
        type="file"
        accept=".csv,.html,.htm,text/csv,text/html"
        hidden
        className="hidden"
        onChange={handleImportTradesFile}
      />
      {tradeSubView === 'overview' ? renderOverviewView() : renderDatabaseView()}

      {/* Import feedback toast */}
      {tradeImportToast && (
        <div
          key={tradeImportToast.message}
          style={{ animation: 'tradeImportToastIn 0.25s ease-out' }}
          className={cn(
            'fixed bottom-6 right-6 z-[60] max-w-sm px-4 py-3 rounded-lg text-sm font-medium shadow-2xl select-none',
            tradeImportToast.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
          )}
        >
          {tradeImportToast.message}
        </div>
      )}
      <style>{`
        @keyframes tradeImportToastIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
