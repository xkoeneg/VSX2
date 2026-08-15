import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { WIKI_CATEGORIES } from '../types/index';
import { getWikiCategoryStyle } from '../constants/wiki';
import { PageHeader } from '../components/shared/PageHeader';
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

export function WikiScreen() {
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
    handleWikiImagePick, addWikiKeyRule, updateWikiKeyRule, removeWikiKeyRule,
    missingStandardConcepts, allStandardConceptsImported, handleImportStandardConcepts,
    handleDeleteSetupType,
    handleDeleteConfluence, handleDeleteMistakeType, handleChangeSetupTypeColor, handleChangeConfluenceColor,
    handleChangeMistakeColor, handleDeleteEmotion, handleChangeEmotionColor, colorForEmotion, colorForMistake,
    handleFileUpload, handleAddImageUrl, handleRemoveImage, handleReorderImages, updateTimeframeNotes,
    exportBackup, importBackup,
  } = useAppContext();

    // ---- Local UI state: category filter + search --------------------
    // Scoped to this screen only (not app-wide persisted state) — filtering
    // the library is a transient viewing preference, not data.
    const [activeCategory, setActiveCategory] = useState<'All' | WikiCategory>('All');
    const [wikiSearch, setWikiSearch] = useState('');
    const FILTER_CATEGORIES: ('All' | WikiCategory)[] = ['All', ...WIKI_CATEGORIES];

    // ---- Category pill strip: single row, wheel-scrollable -------------
    // Keeps the row clean and straight (no wrap) while still being easy to
    // navigate with a plain mouse wheel — vertical wheel motion is
    // redirected to horizontal scroll on this element only.
    const categoryStripRef = useRef<HTMLDivElement>(null);
    const handleCategoryStripWheel = (e: React.WheelEvent<HTMLDivElement>) => {
      const el = categoryStripRef.current;
      if (!el || el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // already horizontal (trackpad) — let it pass through
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    // ---- Master-detail selection (split-pane) ---------------------------
    // Which concept is open in the right-hand workbench, and which sub-tab
    // of its detail is active. Both are transient viewing state, not data.
    const [selectedWikiId, setSelectedWikiId] = useState<string | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'criteria' | 'confluence'>('overview');

    const DETAIL_TABS: { id: 'overview' | 'criteria' | 'confluence'; label: string; icon: LucideIcon }[] = [
      { id: 'overview', label: 'Overview & Description', icon: BookOpen },
      { id: 'criteria', label: 'Entry Criteria Checklist', icon: ListChecks },
      { id: 'confluence', label: 'Session & Timeframe Confluence', icon: Compass },
    ];

    // ---- Catalog codes (e.g. "PD·01") ----------------------------------
    // A stable per-category reference number for every entry, computed off
    // the full unfiltered library so a code never shifts when a filter or
    // search is applied — it's the concept's fixed "shelf location" in the
    // playbook, the same way rules/strategies get numbered elsewhere in
    // the app.
    const CATEGORY_CODE: Record<string, string> = { 'PD Arrays': 'PD', 'Market Structure': 'MS', 'Terminology': 'TM', 'Execution Models': 'EM' };
    const entryCodes = useMemo(() => {
      const counters: Record<string, number> = {};
      const map = new Map<string, string>();
      wikiEntries.forEach(e => {
        const abbr = CATEGORY_CODE[e.category] || 'GN';
        counters[abbr] = (counters[abbr] || 0) + 1;
        map.set(e.id, `${abbr}·${String(counters[abbr]).padStart(2, '0')}`);
      });
      return map;
    }, [wikiEntries]);

    // ---- Summary widgets -----------------------------------------------
    const presentCategoryNames = useMemo(
      () => WIKI_CATEGORIES.filter(cat => wikiEntries.some(e => e.category === cat)),
      [wikiEntries]
    );

    // ---- Filtering: search first, then category -------------------------
    const searchedEntries = useMemo(() => {
      const q = wikiSearch.trim().toLowerCase();
      if (!q) return wikiEntries;
      return wikiEntries.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.bestSession.toLowerCase().includes(q) ||
        e.timeframe.toLowerCase().includes(q) ||
        e.keyRules.some(r => r.toLowerCase().includes(q))
      );
    }, [wikiEntries, wikiSearch]);

    const categoryFilteredEntries = useMemo(
      () => activeCategory === 'All' ? searchedEntries : searchedEntries.filter(e => e.category === activeCategory),
      [searchedEntries, activeCategory]
    );

    const isFiltering = activeCategory !== 'All' || wikiSearch.trim().length > 0;

    // ---- Auto-select: the workbench always shows *something* when the
    // filtered list is non-empty, and clears itself when it isn't (e.g. a
    // search narrows the list past the currently open concept). -----------
    useEffect(() => {
      if (categoryFilteredEntries.length === 0) {
        if (selectedWikiId !== null) setSelectedWikiId(null);
        return;
      }
      if (!selectedWikiId || !categoryFilteredEntries.some(e => e.id === selectedWikiId)) {
        setSelectedWikiId(categoryFilteredEntries[0].id);
      }
    }, [categoryFilteredEntries, selectedWikiId]);

    const selectedEntry = categoryFilteredEntries.find(e => e.id === selectedWikiId) || null;

    // ---- Standard Trading Concepts import ---------------------------------
    // Populates the library with the pre-written ICT / Price Action seed set
    // (FVG, Order Block, MSS, killzones, etc.). Deduped in useAppState by
    // title, so this is safe to click repeatedly — it only ever adds what's
    // still missing, then jumps the workbench to the first newly-added entry.
    const handleClickImportStandardConcepts = () => {
      const added = handleImportStandardConcepts();
      if (added && added.length > 0) {
        setActiveCategory('All');
        setWikiSearch('');
        setSelectedWikiId(added[0].id);
        setActiveDetailTab('overview');
      }
    };

    const handleSelectWikiEntry = (id: string) => {
      setSelectedWikiId(id);
      setActiveDetailTab('overview');
    };

    // ---- Left sidebar: compact list item ---------------------------------
    const renderWikiListItem = (entry: WikiEntry) => {
      const style = getWikiCategoryStyle(entry.category);
      const isActive = entry.id === selectedWikiId;
      const code = entryCodes.get(entry.id) || '';
      return (
        <button
          key={entry.id}
          onClick={() => handleSelectWikiEntry(entry.id)}
          className={cn(
            'relative w-full text-left rounded-lg pl-3.5 pr-3 py-2.5 border transition-all',
            isActive
              ? cn(
                  theme !== 'light' ? 'bg-white/[0.06] border-zinc-700/80' : 'bg-sky-50/60 border-zinc-200',
                  style.glow
                )
              : (theme !== 'light'
                  ? 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-zinc-800'
                  : 'bg-transparent border-transparent hover:bg-zinc-50 hover:border-zinc-200')
          )}
        >
          {isActive && (
            <span className={cn('absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full', style.dot, style.glow)} />
          )}
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'text-[13px] font-semibold leading-snug line-clamp-1 min-w-0',
              isActive
                ? (theme !== 'light' ? 'text-white' : 'text-zinc-900')
                : (theme !== 'light' ? 'text-zinc-300' : 'text-zinc-600')
            )}>
              {entry.title}
            </h4>
            {code && <span className="font-mono text-[9px] text-zinc-500 flex-shrink-0 mt-0.5">{code}</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {entry.category && (
              <span className={cn('inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap', style.badge)}>
                <span className={cn('w-1 h-1 rounded-full', style.dot)} />
                {entry.category}
              </span>
            )}
            {entry.timeframe && (
              <span className={cn(
                'inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md border font-mono whitespace-nowrap',
                theme !== 'light' ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-zinc-100 border-zinc-200 text-zinc-500'
              )}>
                <Clock className="w-2.5 h-2.5" />
                {entry.timeframe}
              </span>
            )}
          </div>
        </button>
      );
    };

    // ---- Right panel: full detail workbench for the selected concept ----
    const renderWikiDetailPanel = () => {
      if (!selectedEntry) {
        // Search/category filter narrowed the list to zero, but the library
        // itself has entries — offer a way back rather than the generic
        // "no concept selected" placeholder below.
        if (isFiltering) {
          return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className={cn(
                'w-14 h-14 rounded-full border flex items-center justify-center mb-3',
                theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              )}>
                <Search className={cn('w-6 h-6', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-400')} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-400">No concepts match</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">Try a different search term or category filter.</p>
            </div>
          );
        }

        // Nothing selected — either the library is genuinely empty, or
        // nothing has been picked from the left panel yet. The 2-column
        // layout stays put either way; only this inner card changes.
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className={cn(
              'w-14 h-14 rounded-full border flex items-center justify-center mb-3',
              theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            )}>
              <BookOpen className={cn('w-6 h-6', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-400')} />
            </div>
            <h3 className={cn('text-sm font-semibold', theme !== 'light' ? 'text-zinc-300' : 'text-zinc-600')}>No concept selected</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[280px]">
              Select a concept from the left panel or create a new entry to get started.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
              <button onClick={handleOpenAddWiki} className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors',
                theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-white'
              )}>
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
              {!allStandardConceptsImported && (
                <button
                  onClick={handleClickImportStandardConcepts}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors border',
                    theme !== 'light'
                      ? 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30'
                      : 'bg-sky-50 hover:bg-sky-100 text-sky-600 border-sky-200'
                  )}
                >
                  <Download className="w-4 h-4" />
                  📥 Import Standard Concepts
                </button>
              )}
            </div>
          </div>
        );
      }

      const entry = selectedEntry;
      const style = getWikiCategoryStyle(entry.category);
      const code = entryCodes.get(entry.id) || '';

      return (
        <div className="flex flex-col h-full min-h-0">
          {/* Header — title, category tag, ideal session badge, actions */}
          <div className={cn(
            'flex items-start justify-between gap-3 px-5 py-4 border-b flex-shrink-0',
            theme !== 'light' ? 'border-zinc-800/80' : 'border-zinc-200'
          )}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {entry.category && (
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap', style.badge, style.glow)}>
                    {entry.category}
                  </span>
                )}
                {entry.bestSession && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold whitespace-nowrap">
                    <Compass className="w-2.5 h-2.5" />
                    {entry.bestSession} session
                  </span>
                )}
                {code && <span className="font-mono text-[10px] text-zinc-500 tracking-wider">{code}</span>}
              </div>
              <h2 className={cn('text-lg font-bold leading-tight truncate', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{entry.title}</h2>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {entry.imageUrl && (
                <button
                  onClick={() => setLightboxImage(entry.imageUrl)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    theme !== 'light' ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  )}
                  title="Zoom diagram"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleOpenEditWiki(entry)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  theme !== 'light' ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                )}
                title="Edit entry"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteWiki(entry.id)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  theme !== 'light' ? 'text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10' : 'text-zinc-500 hover:text-rose-500 hover:bg-rose-50'
                )}
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable workbench body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Chart viewport */}
            <div className="p-5 pb-0">
              <div className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="aspect-[16/7] w-full relative">
                  {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenEditWiki(entry, true)}
                      title="Add a diagram image (click to upload, or paste/drop one right here)"
                      className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-700 hover:text-zinc-500 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">No chart diagram uploaded</span>
                      <span className="text-[10px] text-zinc-600">Click to add — or paste (Ctrl+V) an image here</span>
                    </button>
                  )}
                  {entry.imageUrl && (
                    <button
                      onClick={() => setLightboxImage(entry.imageUrl)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-medium border border-white/10">
                        <ZoomIn className="w-3.5 h-3.5" />
                        Full-screen preview
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive detail tabs */}
            <div className={cn(
              'px-5 mt-5 flex items-center gap-1 border-b flex-shrink-0 overflow-x-auto',
              theme !== 'light' ? 'border-zinc-800/80' : 'border-zinc-200'
            )}>
              {DETAIL_TABS.map(tab => {
                const TabIcon = tab.icon;
                const isActiveTab = activeDetailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors',
                      isActiveTab
                        ? (theme !== 'light' ? 'text-white border-sky-400' : 'text-zinc-900 border-sky-500')
                        : (theme !== 'light' ? 'text-zinc-500 border-transparent hover:text-zinc-300' : 'text-zinc-500 border-transparent hover:text-zinc-800')
                    )}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {activeDetailTab === 'overview' && (
                <div className="space-y-4">
                  {entry.content ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-2">Core Definition</p>
                      <div className={cn(
                        'rounded-lg border p-4',
                        theme !== 'light' ? 'bg-zinc-900/60 border-zinc-800/70' : 'bg-zinc-50 border-zinc-200'
                      )}>
                        <p className={cn('text-[13px] leading-relaxed whitespace-pre-line', theme !== 'light' ? 'text-zinc-300' : 'text-zinc-700')}>{entry.content}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No description logged yet.</p>
                  )}
                  {entry.contextNotes ? (
                    <div className={cn(
                      'flex items-start gap-2.5 rounded-lg border p-3.5',
                      theme !== 'light' ? 'bg-sky-500/[0.06] border-sky-500/20' : 'bg-sky-50 border-sky-200'
                    )}>
                      <Lightbulb className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                      <p className={cn('text-[12px] leading-relaxed whitespace-pre-line', theme !== 'light' ? 'text-sky-200/90' : 'text-sky-800')}>{entry.contextNotes}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No additional context notes yet.</p>
                  )}
                </div>
              )}

              {activeDetailTab === 'criteria' && (
                entry.keyRules.length > 0 ? (
                  <ul className="space-y-2.5">
                    {entry.keyRules.map((rule, idx) => (
                      <li key={idx} className={cn(
                        'flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5',
                        theme !== 'light' ? 'bg-zinc-900/50 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200'
                      )}>
                        <CheckCircle2 className={cn('w-4 h-4 flex-shrink-0 mt-0.5', style.icon)} />
                        <span className={cn('text-[13px] leading-relaxed', theme !== 'light' ? 'text-zinc-300' : 'text-zinc-700')}>{rule}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No entry criteria logged yet.</p>
                )
              )}

              {activeDetailTab === 'confluence' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={cn(
                    'rounded-lg border p-4',
                    theme !== 'light' ? 'bg-zinc-900/50 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200'
                  )}>
                    <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-2">
                      <Clock className="w-3 h-3" />
                      Ideal Timeframe
                    </p>
                    <p className={cn('text-sm font-mono', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{entry.timeframe || '—'}</p>
                  </div>
                  <div className={cn(
                    'rounded-lg border p-4',
                    theme !== 'light' ? 'bg-zinc-900/50 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200'
                  )}>
                    <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-2">
                      <Compass className="w-3 h-3" />
                      Ideal Session
                    </p>
                    <p className={cn('text-sm font-mono', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{entry.bestSession || '—'}</p>
                  </div>
                  {!entry.timeframe && !entry.bestSession && (
                    <p className="sm:col-span-2 text-xs text-zinc-500 italic">No session or timeframe confluence set for this concept.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6 min-w-0">
        <PageHeader
          title="Knowledge Wiki"
          description="Visual reference for PD Arrays & trading concepts"
        />

        {/* Top stats bar — 4 mini cards, Discipline Tracker-style. Replaces
            the loose header buttons/badges: counts, active filter, and
            actions (Add Entry + compact Import trigger) all live here now. */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Card 1 — Total Concepts */}
          <div className={cn(
            'rounded-xl border p-4 flex items-center gap-3',
            theme !== 'light' ? 'bg-[#111113] border-zinc-800/80' : 'bg-white border-zinc-200'
          )}>
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              theme !== 'light' ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-50 text-sky-600'
            )}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold">Total Concepts</p>
              <p className={cn('text-xl font-bold leading-tight', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                {wikiEntries.length}
              </p>
            </div>
          </div>

          {/* Card 2 — Categories */}
          <div className={cn(
            'rounded-xl border p-4 flex items-center gap-3',
            theme !== 'light' ? 'bg-[#111113] border-zinc-800/80' : 'bg-white border-zinc-200'
          )}>
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              theme !== 'light' ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600'
            )}>
              <Grid className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold">Categories</p>
              <p className={cn('text-xl font-bold leading-tight', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                {presentCategoryNames.length}
              </p>
            </div>
          </div>

          {/* Card 3 — Active Filter / Coverage */}
          <div className={cn(
            'rounded-xl border p-4 flex items-center gap-3',
            theme !== 'light' ? 'bg-[#111113] border-zinc-800/80' : 'bg-white border-zinc-200'
          )}>
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              theme !== 'light' ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'
            )}>
              <Filter className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold">Active Filter</p>
              <p className={cn('text-xl font-bold leading-tight truncate', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                {activeCategory}
              </p>
            </div>
          </div>

          {/* Card 4 — Quick Actions & Import */}
          <div className={cn(
            'rounded-xl border p-4 flex items-center justify-between gap-2',
            theme !== 'light' ? 'bg-[#111113] border-zinc-800/80' : 'bg-white border-zinc-200'
          )}>
            <button
              onClick={handleOpenAddWiki}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 min-w-0',
                theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-white'
              )}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Add Entry</span>
            </button>
            {!allStandardConceptsImported && (
              <button
                onClick={handleClickImportStandardConcepts}
                className={cn(
                  'relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors flex-shrink-0 border',
                  theme !== 'light'
                    ? 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-600 border-sky-200'
                )}
                title={`Import Standard Concepts (${missingStandardConcepts.length} available)`}
              >
                <Download className="w-4 h-4" />
                <span className={cn(
                  'absolute -top-1.5 -right-1.5 text-[9px] font-semibold w-4 h-4 flex items-center justify-center rounded-full',
                  theme !== 'light' ? 'bg-sky-500 text-white' : 'bg-sky-600 text-white'
                )}>
                  {missingStandardConcepts.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Split-pane workbench — category list on the left, full
            detail workbench for the selected concept on the right.
            Always rendered, even with zero entries — the right panel's own
            placeholder (see renderWikiDetailPanel) handles the empty case,
            so the page layout never flips to a different full-screen view. */}
        <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-220px)] min-h-[520px]">
          {/* Left sidebar — nav list (~35%) */}
          <div className={cn(
            'lg:w-[35%] lg:min-w-[300px] lg:max-w-[420px] flex flex-col border rounded-xl overflow-hidden lg:h-full',
            theme !== 'light' ? 'bg-[#111113] border-zinc-800/80' : 'bg-white border-zinc-200'
          )}>
            {/* Search — scoped to the concept list it filters */}
            <div className={cn('p-3 border-b flex-shrink-0', theme !== 'light' ? 'border-zinc-800/80' : 'border-zinc-200')}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={wikiSearch}
                  onChange={(e) => setWikiSearch(e.target.value)}
                  placeholder="Search concepts, rules, sessions..."
                  className={cn(
                    'w-full rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-sky-500/50 border',
                    theme !== 'light'
                      ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
                  )}
                />
              </div>
            </div>

            {/* Category pill filters — single straight row. Scrolls
                horizontally if it overflows, but a normal mouse wheel works
                too (see handleCategoryStripWheel), so it's not trackpad-only.
                Flat chip style (no glow/shadow) keeps pills crisp; only
                fill + border color shifts to match the active category. */}
            <div className={cn('p-3 border-b flex-shrink-0', theme !== 'light' ? 'border-zinc-800/80' : 'border-zinc-200')}>
              <div
                ref={categoryStripRef}
                onWheel={handleCategoryStripWheel}
                className="flex items-center gap-1.5 w-full overflow-x-auto no-scrollbar"
              >
                {FILTER_CATEGORIES.map(cat => {
                  const isActive = activeCategory === cat;
                  const count = cat === 'All' ? wikiEntries.length : wikiEntries.filter(e => e.category === cat).length;
                  const style = cat === 'All' ? null : getWikiCategoryStyle(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors flex-shrink-0',
                        isActive
                          ? (style
                              ? style.active
                              : (theme !== 'light'
                                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                                  : 'bg-sky-100 text-sky-700 border-sky-300'))
                          : (theme !== 'light'
                              ? 'bg-white/[0.04] border-white/[0.06] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200'
                              : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-700')
                      )}
                    >
                      {/* Every pill gets a leading dot slot — even 'All' — so
                          the label + count always start at the same offset
                          and pills line up symmetrically regardless of word
                          length. Count is fused to the label as one text
                          run (not a separate flex item) so its spacing
                          doesn't stretch differently per pill. */}
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full flex-shrink-0',
                        style ? style.dot : (theme !== 'light' ? 'bg-zinc-500' : 'bg-zinc-400')
                      )} />
                      <span className="whitespace-nowrap">
                        {cat} <span className={isActive ? 'opacity-70' : 'opacity-50'}>({count})</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable concept list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[240px]">
              {categoryFilteredEntries.length > 0 ? (
                categoryFilteredEntries.map(renderWikiListItem)
              ) : (
                <div className="text-center py-10 px-4">
                  <Search className={cn('w-6 h-6 mx-auto mb-2', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')} />
                  <p className="text-xs text-zinc-500">{wikiEntries.length === 0 ? 'No concepts yet' : 'No concepts match'}</p>
                  {isFiltering && (
                    <button
                      onClick={() => { setActiveCategory('All'); setWikiSearch(''); }}
                      className="mt-2 text-[11px] text-sky-500 hover:text-sky-600 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right main panel — detail workbench (~65%) */}
          <div className={cn(
            'flex-1 min-w-0 flex flex-col border rounded-xl overflow-hidden lg:h-full',
            theme !== 'light' ? 'bg-[#111113] border-zinc-800/80' : 'bg-white border-zinc-200'
          )}>
            {renderWikiDetailPanel()}
          </div>
        </div>
      </div>
    );
}
