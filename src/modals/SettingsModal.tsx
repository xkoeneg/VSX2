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
import { ModalBackdrop } from '../components/shared/ModalBackdrop';
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

export function SettingsModal() {
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
    exportBackup, importBackup, exportTradesOnly, importTradesOnly, handleFullSystemReset,
  } = useAppContext();

    const [tradesExportFormat, setTradesExportFormat] = useState<'csv' | 'json'>('csv');
    const [isExportingTrades, setIsExportingTrades] = useState(false);

    const handleExportTradesOnly = async () => {
      setIsExportingTrades(true);
      try {
        await exportTradesOnly(tradesExportFormat);
      } finally {
        setIsExportingTrades(false);
      }
    };

    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [resetConfirmText, setResetConfirmText] = useState('');
    const [isResettingSystem, setIsResettingSystem] = useState(false);
    const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);

    const handleConfirmReset = async () => {
      if (resetConfirmText !== 'CONFIRM' || isResettingSystem) return;
      setResetErrorMessage(null);
      setIsResettingSystem(true);
      try {
        // Delegates to useAppState's handleFullSystemReset, which deletes
        // every Supabase table (trades, accounts, journal_data,
        // preferences) scoped to this user, clears localStorage, and
        // resets every feature's React state (Trades, Accounts, Rules
        // Playbook, Strategies, Wiki, Life Discipline Hub, Daily Creed,
        // saved presets). Critically, this is AWAITED: the previous
        // version called it without awaiting and reloaded immediately
        // after, which killed the in-flight Supabase delete requests
        // before they ever completed — nothing was actually removed from
        // the server, so the old data just came right back on refresh.
        await handleFullSystemReset();
        // Only reload once the server-side deletes are confirmed done —
        // this is what guarantees the dashboard comes back truly empty
        // instead of momentarily-empty-then-repopulated.
        window.location.reload();
      } catch (err) {
        console.error('Full system reset failed:', err);
        setIsResettingSystem(false);
        setResetErrorMessage(
          err instanceof Error
            ? err.message
            : 'Reset failed — some data may not have been deleted from the server. Check your connection and try again.'
        );
      }
    };

    if (!isSettingsModalOpen) return null;

    const themeLabel = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'Minecraft';
    const nextThemeLabel = theme === 'dark' ? 'Light' : theme === 'light' ? 'Minecraft' : 'Dark';

    return (
      <>
      <ModalBackdrop
        onClose={() => setIsSettingsModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Settings className="w-4 h-4 text-zinc-300" />
              </div>
              <h2 className="text-base font-semibold text-white">Settings</h2>
            </div>
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-5 p-1 rounded-xl bg-zinc-800/60 border border-zinc-800">
            <button
              onClick={() => setSettingsModalTab('appearance')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                settingsModalTab === 'appearance'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <Sun className="w-3.5 h-3.5" />
              Appearance & Privacy
            </button>
            <button
              onClick={() => setSettingsModalTab('backup')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                settingsModalTab === 'backup'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <HardDrive className="w-3.5 h-3.5" />
              Data Backup
            </button>
          </div>

          {/* TAB 1: Appearance & Privacy */}
          {settingsModalTab === 'appearance' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-zinc-800/50 border border-zinc-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    {theme === 'dark' ? <Moon className="w-4 h-4 text-zinc-300" /> : theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Box className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">Theme</p>
                    <p className="text-xs text-zinc-500 truncate">Currently {themeLabel} — switch to {nextThemeLabel}</p>
                  </div>
                </div>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'minecraft' : 'dark')}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-700 text-white hover:bg-zinc-600 transition-all"
                >
                  {nextThemeLabel}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-zinc-800/50 border border-zinc-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    {privacyMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-zinc-300" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">Privacy Mode</p>
                    <p className="text-xs text-zinc-500 truncate">Blur sensitive figures across the journal</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={privacyMode}
                  onClick={() => setPrivacyMode(!privacyMode)}
                  className={cn(
                    'relative flex-shrink-0 w-10 h-6 rounded-full transition-colors',
                    privacyMode ? 'bg-amber-500' : 'bg-zinc-700'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                    privacyMode && 'translate-x-4'
                  )} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Data Backup */}
          {settingsModalTab === 'backup' && (
            <div className="flex flex-col gap-3">
              {/* OPTION 1 (default/primary): Full System Backup & Restore */}
              <div className="px-4 py-3.5 rounded-xl bg-zinc-800/50 border border-zinc-700/80">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">Recommended</p>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <HardDrive className="w-4 h-4 text-zinc-300" />
                  </div>
                  <p className="text-sm font-medium text-white">Full System Backup &amp; Restore</p>
                </div>
                <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                  A complete JSON snapshot of everything — accounts, trades, your rules playbook, and the full Life Discipline Hub (active challenge config, daily logs, and history). Restoring overwrites your current data 1:1, so make sure it's the file you intend to load.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExportConfirmOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-zinc-700 text-white hover:bg-zinc-600 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export Backup
                  </button>
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-zinc-700 text-white hover:bg-zinc-600 transition-all cursor-pointer">
                    <FolderSync className="w-4 h-4" />
                    Import &amp; Restore
                    <input type="file" accept=".json,application/json" className="hidden" onChange={importBackup} />
                  </label>
                </div>
              </div>

              {/* OPTION 2: Trades Only Export/Import */}
              <div className="px-4 py-3.5 rounded-xl bg-zinc-800/50 border border-zinc-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-zinc-300" />
                  </div>
                  <p className="text-sm font-medium text-white">Trades Only Export</p>
                </div>
                <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                  Export just your trades (no rules, notices, wiki, or Discipline Tracker data). <span className="text-zinc-400">.json is a full 1:1 backup</span> — screenshots, notes, setups, everything — restorable exactly. <span className="text-zinc-400">.csv</span> is a simplified spreadsheet view (Date, Account, Pair, Entry, Exit, R:R, PnL, Status) for Excel/Sheets; re-importing a .csv can only rebuild basic trade records.
                </p>
                <div className="flex items-center gap-1 mb-3 p-1 rounded-lg bg-zinc-900/60 border border-zinc-800 w-fit">
                  <button
                    onClick={() => setTradesExportFormat('csv')}
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-medium transition-all',
                      tradesExportFormat === 'csv' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    .csv
                  </button>
                  <button
                    onClick={() => setTradesExportFormat('json')}
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-medium transition-all',
                      tradesExportFormat === 'json' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    .json
                  </button>
                </div>
                <button
                  onClick={handleExportTradesOnly}
                  disabled={isExportingTrades || trades.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-zinc-700 text-white hover:bg-zinc-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-700"
                >
                  <Download className="w-4 h-4" />
                  {isExportingTrades ? 'Exporting…' : `Export Trades (.${tradesExportFormat})`}
                </button>

                {/* Import counterpart — a full-fidelity .json (scope:
                    'trades-only') restores trades+accounts exactly, by id,
                    safe to re-import. A .csv or an older flat-row .json
                    can only rebuild basic trades, since that format never
                    captured the deep fields to begin with. */}
                <label className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700 transition-all cursor-pointer">
                  <FolderSync className="w-4 h-4" />
                  Import Trades (.csv / .json)
                  <input type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={importTradesOnly} />
                </label>
                <p className="mt-2 text-[11px] text-zinc-600 leading-relaxed">
                  Importing a .json exported here restores trades exactly, screenshots and all. Importing a .csv (or an older trades .json) can only rebuild the basics — Date, Account, Pair, Entry, Exit, R:R, PnL, Status — since that's all a spreadsheet format can hold.
                </p>
              </div>
            </div>

          )}

          {/* Danger Zone — always visible at the bottom, regardless of tab */}
          <div className="mt-5 pt-4 border-t border-zinc-800">
            <div className="px-4 py-3.5 rounded-xl bg-rose-950/10 border border-rose-900/40">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-rose-950/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-sm font-medium text-rose-300">Danger Zone</p>
              </div>
              <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                Permanently erase every trade, account, discipline log, and wiki entry from this device. This cannot be undone — export a backup first if you want to keep a copy.
              </p>
              <button
                onClick={() => { setResetConfirmText(''); setShowResetConfirm(true); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-transparent border border-rose-800/60 text-rose-400 hover:bg-rose-950/30 hover:border-rose-700 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Reset All Journal Data
              </button>
            </div>
          </div>
        </div>
      </ModalBackdrop>

      {showResetConfirm && (
        <ModalBackdrop
          onClose={() => setShowResetConfirm(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <div
            className="bg-zinc-900 border border-rose-900/50 rounded-2xl p-6 shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-950/40 border border-rose-900/50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <h2 className="text-base font-semibold text-white">Reset All Journal Data</h2>
            </div>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              This permanently deletes every trade, account, discipline log, and wiki entry on this device and cannot be undone. Type <span className="font-mono text-rose-400">CONFIRM</span> below to proceed.
            </p>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Type CONFIRM"
              autoFocus
              disabled={isResettingSystem}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-600/60 mb-4 disabled:opacity-50"
            />
            {resetErrorMessage && (
              <p className="text-xs text-rose-400 mb-4 leading-relaxed">
                {resetErrorMessage}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={isResettingSystem}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={resetConfirmText !== 'CONFIRM' || isResettingSystem}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-rose-600 text-white hover:bg-rose-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isResettingSystem ? 'Resetting…' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}
    </>
    );
}

