import type React from 'react';
import { useMemo, useState } from 'react';
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
import { WIKI_CATEGORIES } from '../types/index';
import { WIKI_CATEGORY_FALLBACK_STYLE, getWikiCategoryStyle } from '../constants/wiki';
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
    handleWikiImagePick, addWikiKeyRule, updateWikiKeyRule, removeWikiKeyRule, handleDeleteSetupType,
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
    const totalConcepts = wikiEntries.length;
    const presentCategoryNames = useMemo(
      () => WIKI_CATEGORIES.filter(cat => wikiEntries.some(e => e.category === cat)),
      [wikiEntries]
    );
    const primarySessionInfo = useMemo(() => {
      const counts: Record<string, number> = {};
      wikiEntries.forEach(e => { if (e.bestSession) counts[e.bestSession] = (counts[e.bestSession] || 0) + 1; });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return sorted.length > 0 ? { label: sorted[0][0], count: sorted[0][1] } : { label: '—', count: 0 };
    }, [wikiEntries]);

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

    // Grouped by category (fixed order) so the whole library reads top to
    // bottom on one page. Any entry with a category outside the 4 fixed
    // ones still shows up under an "Other" section instead of getting
    // hidden. When a specific category pill is active, "Other" drops out
    // naturally since it's excluded from the categories being grouped.
    const groupedWikiSections = useMemo(() => {
      const cats: (WikiCategory | 'Other')[] = activeCategory === 'All' ? [...WIKI_CATEGORIES, 'Other'] : [activeCategory];
      return cats.map(cat => ({
        category: cat,
        entries: cat === 'Other'
          ? categoryFilteredEntries.filter(e => !WIKI_CATEGORIES.includes(e.category as WikiCategory))
          : categoryFilteredEntries.filter(e => e.category === cat),
      })).filter(section => section.entries.length > 0);
    }, [categoryFilteredEntries, activeCategory]);

    const isFiltering = activeCategory !== 'All' || wikiSearch.trim().length > 0;

    const renderWikiCard = (entry: WikiEntry) => {
      const style = getWikiCategoryStyle(entry.category);
      const visibleRules = entry.keyRules.slice(0, 4);
      const extraRuleCount = entry.keyRules.length - visibleRules.length;
      const code = entryCodes.get(entry.id) || '';
      return (
        <div
          key={entry.id}
          onClick={() => setViewWikiId(entry.id)}
          className={cn(
            'group min-w-0 bg-[#111113] border rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all hover:-translate-y-0.5',
            'border-zinc-800/80 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40'
          )}
        >
          {/* Header — concept title + category badge + catalog code */}
          <div className="px-4 pt-4 pb-2.5 flex items-start justify-between gap-3">
            <h3 className="font-bold text-white text-[15px] leading-snug min-w-0">{entry.title}</h3>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {entry.category && (
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap', style.badge, style.glow)}>
                  {entry.category}
                </span>
              )}
              {code && <span className="font-mono text-[9px] text-zinc-600 tracking-wider">{code}</span>}
            </div>
          </div>

          {entry.content && (
            <p className="px-4 pb-3 text-xs text-zinc-500 leading-relaxed line-clamp-2">{entry.content}</p>
          )}

          {/* Diagram window — mini chart-terminal chrome + preview + zoom */}
          <div className="mx-4 rounded-lg overflow-hidden border border-zinc-800/70 bg-zinc-950 relative flex-shrink-0">
            <div className="h-6 flex items-center justify-between px-2 bg-zinc-900/80 border-b border-zinc-800/70">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', style.dot)} />
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 truncate">{entry.category || 'Concept'}</span>
              </span>
              {/* Edit / Delete — visible on hover (or tap, on touch devices) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenEditWiki(entry); }}
                  className="p-0.5 text-zinc-500 hover:text-white transition-colors"
                  title="Edit entry"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteWiki(entry.id); }}
                  className="p-0.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="relative aspect-[2/1] w-full">
              {entry.imageUrl ? (
                <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-zinc-700">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[11px]">No diagram yet</span>
                </div>
              )}
              {entry.imageUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxImage(entry.imageUrl); }}
                  className="absolute bottom-2 right-2 p-1.5 rounded-md bg-black/60 backdrop-blur-sm text-zinc-300 hover:text-white opacity-70 group-hover:opacity-100 transition-opacity"
                  title="Zoom diagram"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Protocol box — entry criteria, boxed off from the rest of the card */}
          <div className="mx-4 mt-3 rounded-lg bg-black/30 border border-zinc-800/60 p-3 min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-2">Entry Criteria</p>
            {visibleRules.length > 0 ? (
              <ul className="space-y-1.5">
                {visibleRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400 leading-snug">
                    <CheckCircle2 className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', style.icon)} />
                    <span className="line-clamp-1">{rule}</span>
                  </li>
                ))}
                {extraRuleCount > 0 && (
                  <li className="text-[11px] text-zinc-600 pl-[22px]">+{extraRuleCount} more rule{extraRuleCount === 1 ? '' : 's'}</li>
                )}
              </ul>
            ) : (
              <p className="text-[11px] text-zinc-600 italic">No criteria logged yet</p>
            )}
          </div>

          {/* Footer badges — timeframe & ideal session */}
          <div className="p-4 pt-3 mt-auto flex flex-wrap items-center gap-1.5">
            {entry.timeframe && (
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
                <Clock className="w-3 h-3 text-zinc-500" />
                {entry.timeframe}
              </span>
            )}
            {entry.bestSession && (
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
                <Compass className="w-3 h-3 text-zinc-500" />
                {entry.bestSession}
              </span>
            )}
            {!entry.timeframe && !entry.bestSession && (
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-zinc-900/60 border border-zinc-800/60 text-zinc-600 italic">
                No execution context set
              </span>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6 min-w-0">
        <PageHeader
          title="Knowledge Wiki"
          description="Visual reference for PD Arrays & trading concepts"
          actions={
            <button onClick={handleOpenAddWiki} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors flex-shrink-0">
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>
          }
        />

        {/* Summary widgets bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-4 flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold">Total Core Models</p>
              <p className="text-xl font-bold text-white leading-tight">{totalConcepts}</p>
            </div>
          </div>

          <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-4 flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold">Primary Categories</p>
              <p className="text-xl font-bold text-white leading-tight">
                {presentCategoryNames.length}<span className="text-zinc-600 text-sm font-medium"> / {WIKI_CATEGORIES.length}</span>
              </p>
              {presentCategoryNames.length > 0 && (
                <p className="text-[10px] text-zinc-600 truncate mt-0.5">{presentCategoryNames.join(' · ')}</p>
              )}
            </div>
          </div>

          <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-4 flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold">Primary Session</p>
              <p className="text-xl font-bold text-white leading-tight truncate">{primarySessionInfo.label}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                {primarySessionInfo.count > 0 ? `${primarySessionInfo.count} of ${totalConcepts} concepts` : 'No session data yet'}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddWiki}
            className="bg-[#111113] border border-dashed border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl p-4 flex items-center gap-3 transition-colors text-left group min-w-0"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold">Quick Add</p>
              <p className="text-sm font-bold text-white leading-tight">New Concept</p>
            </div>
          </button>
        </div>

        {/* Category filter pills + search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              const count = cat === 'All' ? wikiEntries.length : wikiEntries.filter(e => e.category === cat).length;
              const style = cat === 'All' ? null : getWikiCategoryStyle(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    isActive
                      ? (style ? style.active : 'bg-white/10 text-white border-white/20')
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  )}
                >
                  {style && <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />}
                  <span>{cat}</span>
                  <span className={isActive ? 'opacity-70' : 'text-zinc-600'}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
            <input
              type="text"
              value={wikiSearch}
              onChange={(e) => setWikiSearch(e.target.value)}
              placeholder="Search concepts, rules, sessions..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>

        {/* Library — grouped by category as plain section labels (not
            tabs), so nothing needs to be clicked to bring the rest of a
            filtered result set into view; just scroll. */}
        {wikiEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Lightbulb className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No wiki entries yet</h3>
            <p className="text-zinc-500 mb-4">Build your personal trading knowledge base</p>
            <button onClick={handleOpenAddWiki} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        ) : groupedWikiSections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No concepts match</h3>
            <p className="text-zinc-500 mb-4">Try a different search term or category filter</p>
            <button
              onClick={() => { setActiveCategory('All'); setWikiSearch(''); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedWikiSections.map(section => {
              const style = section.category === 'Other' ? WIKI_CATEGORY_FALLBACK_STYLE : getWikiCategoryStyle(section.category);
              return (
                <div key={section.category} className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className={cn('w-2 h-2 rounded-full', style.dot)} />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">{section.category}</h2>
                    <span className="text-xs text-zinc-600">{section.entries.length}</span>
                    <div className="flex-1 h-px bg-zinc-800/80" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {section.entries.map(renderWikiCard)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
}
