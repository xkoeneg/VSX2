import type React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
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
import { WEEKDAY_FULL_NAME, WEEKLY_CATEGORY_ID, getLocalDateKey, getWeekdayForDateKey, renderCategoryIcon } from '../constants/lifeDiscipline';
import { PageHeader } from '../components/shared/PageHeader';
import { formatDate } from '../utils/format';
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

// Picks a track-list for the Challenge Progress Grid so the boxes scale to
// the challenge's actual duration instead of always assuming a 20-column
// grid. Short challenges (21/30 days) get fewer, larger columns that fill
// the row; long/custom durations (beyond 365 days) fall back to CSS
// auto-fill so boxes keep a sane minimum size and simply wrap instead of
// stretching paper-thin or leaving empty trailing cells. `isMobile` gets
// its own (smaller) column cap so boxes never shrink below a tappable
// size on narrow viewports, even for durations that go wide on desktop.
function getChallengeGridTemplate(totalDays: number, isMobile: boolean): string {
  if (totalDays > 365) {
    return `repeat(auto-fill, minmax(${isMobile ? 28 : 40}px, 1fr))`;
  }
  const desktopCols =
    totalDays <= 21 ? 7 :
    totalDays <= 30 ? 10 :
    totalDays <= 45 ? 12 :
    totalDays <= 60 ? 13 :
    totalDays <= 75 ? 15 :
    totalDays <= 100 ? 20 :
    totalDays <= 150 ? 20 :
    totalDays <= 200 ? 25 :
    totalDays <= 300 ? 28 :
    30; // 301-365 days
  const cols = isMobile ? Math.min(desktopCols, 10) : desktopCols;
  return `repeat(${cols}, minmax(0, 1fr))`;
}

export function LifeDisciplineScreen() {
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

    const todayKey = getLocalDateKey();
    const todayChecks = lifeDisciplineChecks[todayKey] || emptyLifeDisciplineChecks(challengeConfig);
    const todayWeekday = getWeekdayForDateKey(todayKey);
    const weeklyRoutinesEnabled = !!challengeConfig.weeklyRoutinesEnabled;

    // Live routine categories: fully user-configured — however many the
    // user has added (could be 0, 1, 4, or more), in whatever order they
    // were created, each with its own dynamic item list. `routineGroups`
    // keeps the FULL array (including the single fixed Weekly category, if
    // present) so gI stays a stable index into challengeConfig.categories
    // for toggleLifeDisciplineItem / todayChecks lookups everywhere below.
    const routineGroups = challengeConfig.categories;

    // STRICT DATA SEPARATION: the Daily Checklist grid only ever renders
    // categories OTHER than the single fixed Weekly card — matched by its
    // reserved id, not by inspecting item contents. This guarantees a daily
    // category's items (e.g. everything inside "haynako") can never end up
    // rendered as part of the Weekly card, and that the Weekly card itself
    // never renders as one of the Daily Checklist cards (which used to leak
    // through for any weekly item that hadn't had a day assigned yet).
    const dailyOnlyGroups = routineGroups
      .map((group, gI) => ({ group, gI }))
      .filter(({ group }) => group.id !== WEEKLY_CATEGORY_ID);

    // Today's Weekly Targets: items from the single fixed Weekly category
    // ONLY — sourced strictly by category id, never by scanning every
    // category for stray frequency/day flags — that are scheduled for
    // today's weekday. Kept out of the Daily Checklist cards above and
    // surfaced in their own section instead, so the everyday view stays
    // uncluttered on days those items don't apply, and items assigned to
    // other days (e.g. a Sunday-only item) stay hidden today.
    const weeklyGroupEntry = routineGroups
      .map((group, gI) => ({ group, gI }))
      .find(({ group }) => group.id === WEEKLY_CATEGORY_ID);
    const weeklyTargetsToday: { group: RoutineCategory; gI: number; item: RoutineItem; iI: number }[] = [];
    if (weeklyRoutinesEnabled && weeklyGroupEntry) {
      const { group, gI } = weeklyGroupEntry;
      group.items.forEach((item, iI) => {
        if (item.frequency === 'specific' && item.days && item.days.length > 0 && item.days.includes(todayWeekday)) {
          weeklyTargetsToday.push({ group, gI, item, iI });
        }
      });
    }
    // Retained for any regular (non-weekly) category item — always false in
    // practice since only the fixed Weekly card ever assigns frequency
    // 'specific', but kept as a defensive no-op filter within daily cards.
    const isWeeklyTargetItem = (item: RoutineItem) =>
      weeklyRoutinesEnabled && item.frequency === 'specific' && !!item.days && item.days.length > 0;

    // Today's Progress / Complete All only consider items actually in
    // scope for today — every item in a genuine daily category, plus any
    // Weekly Target already resolved above for today's weekday. Sourced
    // from dailyOnlyGroups + weeklyTargetsToday (both scoped strictly by
    // category id) rather than re-scanning all categories, so an
    // unconfigured or off-day item from the Weekly card can never inflate
    // the count.
    const totalItems = dailyOnlyGroups.reduce((sum, { group }) => sum + group.items.length, 0) + weeklyTargetsToday.length;
    const checkedItems = dailyOnlyGroups.reduce(
      (sum, { group, gI }) => sum + group.items.reduce(
        (s, item, iI) => s + (todayChecks[gI]?.[iI] ? 1 : 0), 0
      ), 0
    ) + weeklyTargetsToday.reduce((sum, { gI, iI }) => sum + (todayChecks[gI]?.[iI] ? 1 : 0), 0);
    const todayComplete = totalItems > 0 && checkedItems === totalItems;

    // Build the Day 1..N grid against the stored challenge start date.
    const start = new Date(lifeDisciplineStartDate + 'T00:00:00');
    const today = new Date(todayKey + 'T00:00:00');
    const gridDays = Array.from({ length: challengeConfig.durationDays }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateKey = getLocalDateKey(d);
      const isFuture = d.getTime() > today.getTime();
      const isToday = d.getTime() === today.getTime();
      const complete = isLifeDisciplineDayComplete(dateKey);
      const graced = !!lifeDisciplineGraceDays[dateKey];
      let status: 'upcoming' | 'complete' | 'failed' | 'pending' | 'grace';
      if (isFuture) status = 'upcoming';
      else if (complete) status = 'complete';
      else if (isToday) status = 'pending';
      else if (graced) status = 'grace';
      else status = 'failed';
      return { day: i + 1, dateKey, status };
    });

    const completedCount = gridDays.filter(d => d.status === 'complete' || d.status === 'grace').length;
    const failedCount = gridDays.filter(d => d.status === 'failed').length;

    // Responsive column templates for the grid below, derived from the
    // challenge's actual duration (see getChallengeGridTemplate). Kept as
    // CSS custom properties rather than literal Tailwind grid-cols-N
    // classes because the column count is data-driven at runtime — JIT
    // can't generate a class for a number it never sees in source, but it
    // *can* statically pick up the literal `grid-cols-[var(--...)]`
    // arbitrary-value classes below and let the variables drive them.
    const challengeGridTemplateMobile = getChallengeGridTemplate(challengeConfig.durationDays, true);
    const challengeGridTemplateDesktop = getChallengeGridTemplate(challengeConfig.durationDays, false);

    // Combined Challenge Timeline card — Target End Date is Start Date +
    // durationDays (Day 1 is the start date itself, so the last day is
    // durationDays - 1 days after it). Days Remaining counts from today
    // through the end date inclusive, floored at 0 once the challenge is over.
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + challengeConfig.durationDays - 1);
    const endDateKey = getLocalDateKey(endDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysRemaining = Math.max(0, Math.round((endDate.getTime() - today.getTime()) / msPerDay));

    // Active streak: consecutive successful days counting back from today
    // (today's still-pending status doesn't break it; the first failed day
    // encountered does).
    const todayGridIndex = gridDays.findIndex(d => d.status === 'pending');
    let activeStreak = 0;
    for (let i = (todayGridIndex !== -1 ? todayGridIndex : gridDays.length - 1); i >= 0; i--) {
      const st = gridDays[i].status;
      if (st === 'complete' || st === 'grace') activeStreak++;
      else if (st === 'pending') continue;
      else break;
    }

    // Discipline Score = execution rate across all "decided" days so far
    // (complete + grace vs. failed) — excludes today (undecided) and
    // upcoming days.
    const decidedDays = completedCount + failedCount;
    const disciplineScore = decidedDays > 0 ? Math.round((completedCount / decidedDays) * 100) : 0;

    const statusStyles: Record<string, string> = {
      complete: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      grace: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
      failed: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      pending: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      upcoming: theme !== 'light'
        ? 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-zinc-500'
        : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-400',
    };

    return (
      <div className="space-y-6 min-w-0">
        {/* PAGE HEADER — static route title, never overwritten by the
            Configure Challenge modal's Challenge Title/Motto fields. Those
            live in the dedicated Active Challenge banner below instead.
            This header button always opens the modal in 'configure' mode —
            fully editable, and saving always starts a brand-new run. The
            'edit' entry point lives separately next to the Daily Checklist. */}
        <PageHeader
          title="Life Discipline Hub"
          description="Tracking daily routines, habits, and streak goals"
          actions={
            <button
              onClick={() => openChallengeConfigModal('configure')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors flex-shrink-0",
                theme !== 'light'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
              )}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configure Challenge</span>
            </button>
          }
        />

        {/* ACTIVE CHALLENGE BANNER — the Challenge Title + Identity/Vision
            Motto from the Configure Challenge modal live here, not in the
            static page header above. */}
        <div className={cn(
          "border rounded-xl px-5 py-4 min-w-0",
          theme !== 'light'
            ? 'bg-gradient-to-r from-amber-500/10 via-zinc-900/40 to-zinc-900/40 border-amber-500/20'
            : 'bg-gradient-to-r from-amber-500/10 via-white to-white border-amber-500/30'
        )}>
          <p className={cn("text-base sm:text-lg font-semibold truncate flex items-center gap-2", tc.text)}>
            <Flame className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-amber-400">ACTIVE CHALLENGE:</span>
            <span className="truncate">{challengeConfig.title}</span>
          </p>
          {challengeConfig.motto && (
            <p className={cn("mt-1.5 text-sm truncate", tc.textMuted)}>
              "{challengeConfig.motto}"
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {renderStatCard('Today\'s Progress', `${checkedItems}/${totalItems}`, <CheckCircle2 className="w-4 h-4" />, todayComplete ? 'text-emerald-400' : tc.textMuted)}
          {renderStatCard('Days Completed', completedCount, <Flame className="w-4 h-4" />, 'text-amber-400')}
          {renderStatCard('Days Failed', failedCount, <XCircle className="w-4 h-4" />, 'text-rose-400')}
          {renderStatCard('Re-check Tokens', `${lifeDisciplineTokensRemaining}/${challengeConfig.recheckTokens}`, <RefreshCw className="w-4 h-4" />, 'text-cyan-400')}
        </div>

        {/* DAILY CHECKLIST SECTION */}
        <div className={cn(
          "relative rounded-xl p-5 min-w-0 border",
          theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
        )}>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h3 className={cn("text-base font-semibold flex items-center gap-2 select-none", tc.text)}>
              <ListChecks className={cn("w-4 h-4 flex-shrink-0", tc.textMuted)} />
              <span className="truncate">Daily Checklist — {formatDate(todayKey)}</span>
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasActiveChallengeProgress && (
                <button
                  onClick={() => openChallengeConfigModal('edit')}
                  title="Edit Challenge"
                  aria-label="Edit Challenge"
                  className={cn("flex items-center justify-center p-2 rounded-lg transition-all", tc.btnSecondary)}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => completeAllLifeDisciplineToday(todayKey)}
                disabled={todayComplete || totalItems === 0}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all select-none border',
                  todayComplete || totalItems === 0
                    ? cn(theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200', tc.textMuted, 'cursor-not-allowed')
                    : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 cursor-pointer'
                )}
              >
                <Zap className="w-4 h-4" />
                {todayComplete ? 'All Complete' : 'Complete All'}
              </button>
            </div>
          </div>

          {/* Toast feedback for quick actions */}
          {lifeDisciplineToast && (
            <div
              key={lifeDisciplineToast}
              className="absolute top-3 right-5 z-10 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-xl select-none"
            >
              {lifeDisciplineToast}
            </div>
          )}

          {routineGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center select-none">
              <ListChecks className={cn("w-7 h-7", theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')} />
              <p className={cn("text-xs italic max-w-xs", tc.textMuted)}>
                No routine categories added yet. Click "+ Add Category" to start.
              </p>
              <button
                onClick={() => openChallengeConfigModal(hasActiveChallengeProgress ? 'edit' : 'configure')}
                className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all", tc.btnSecondary)}
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          ) : dailyOnlyGroups.length === 0 ? (
            <p className={cn("text-xs italic py-2 select-none", tc.textMuted)}>
              All routines live in the Weekly card — see {WEEKDAY_FULL_NAME[todayWeekday]} Specifics below.
            </p>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dailyOnlyGroups.map(({ group, gI }) => {
              // STRICT DATA SEPARATION: dailyOnlyGroups already excludes the
              // fixed Weekly category by id (see above), so every item
              // rendered in this grid is guaranteed to come from a genuine
              // daily category — never from the Weekly card. The
              // isWeeklyTargetItem filter below is now just a defensive
              // no-op for regular categories (their items never carry a
              // 'specific' frequency in the first place).
              const dailyItemsWithIndex = group.items
                .map((item, iI) => ({ item, iI }))
                .filter(({ item }) => !isWeeklyTargetItem(item));
              // A category that's 100% weekly items has nothing left to
              // show here — its items already live in Weekly Targets below,
              // so the card itself is skipped entirely rather than showing
              // an empty placeholder under whatever name it happens to have.
              // A genuinely empty category (no items at all yet) still
              // renders, so there's somewhere to see it needs items added.
              if (group.items.length > 0 && dailyItemsWithIndex.length === 0) return null;
              const groupChecks = todayChecks[gI] || group.items.map(() => false);
              const groupCheckedCount = dailyItemsWithIndex.filter(({ iI }) => !!groupChecks[iI]).length;
              const groupComplete = dailyItemsWithIndex.length > 0 && groupCheckedCount === dailyItemsWithIndex.length;
              return (
                <div
                  key={group.id}
                  className={cn(
                    'relative rounded-lg border p-3 transition-colors',
                    theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200',
                    groupComplete && 'border-l-4 border-l-emerald-500/70'
                  )}
                >
                  <div className={cn("flex items-center gap-2 mb-3 pb-3 border-b select-none", theme !== 'light' ? 'border-zinc-800/60' : 'border-zinc-200')}>
                    {renderCategoryIcon(group, 'w-4 h-4', groupComplete ? 'text-emerald-400' : undefined)}
                    <span className={cn("text-sm font-semibold truncate", tc.text)}>{group.label}</span>
                    <span
                      className={cn(
                        'ml-auto flex-shrink-0 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap',
                        groupComplete
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : cn(theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200', tc.textMuted)
                      )}
                    >
                      {groupCheckedCount}/{dailyItemsWithIndex.length}{groupComplete ? ' Ready' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dailyItemsWithIndex.length === 0 && (
                      <p className={cn("text-xs italic select-none", tc.textMuted)}>
                        No routine items — add some in Configure Challenge.
                      </p>
                    )}
                    {dailyItemsWithIndex.map(({ item, iI }) => {
                      const checked = !!groupChecks[iI];
                      return (
                        <label
                          key={item.id}
                          className="flex items-center gap-2.5 cursor-pointer group select-none"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleLifeDisciplineItem(todayKey, gI, iI)}
                            className="sr-only peer cursor-pointer"
                          />
                          <span
                            className={cn(
                              'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200 ease-out',
                              checked
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 scale-100'
                                : cn(theme !== 'light' ? 'border-zinc-700' : 'border-zinc-300', theme !== 'light' ? 'group-hover:border-zinc-400' : 'group-hover:border-zinc-500', 'group-active:scale-90')
                            )}
                          >
                            {checked && <Check className="w-3.5 h-3.5" />}
                          </span>
                          <span className={cn('text-xs select-none transition-colors', checked ? cn(tc.textMuted, 'line-through') : tc.textSecondary)}>
                            {item.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* TODAY'S WEEKLY TARGETS — Specific-Days items scheduled for
              today's weekday only. Hidden entirely when the feature is off,
              or when nothing happens to be scheduled today, so days with
              no weekly targets stay just as clean as before. Mirrors the
              daily cards' green "complete" styling once every item
              scheduled for today is checked off. */}
          {weeklyRoutinesEnabled && weeklyTargetsToday.length > 0 && (() => {
            const weeklyTargetsComplete = weeklyTargetsToday.every(({ gI, iI }) => !!todayChecks[gI]?.[iI]);
            const weeklyCheckedCount = weeklyTargetsToday.filter(({ gI, iI }) => !!todayChecks[gI]?.[iI]).length;
            return (
              <div className={cn(
                'relative mt-4 rounded-lg border p-3 transition-colors',
                theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200',
                weeklyTargetsComplete && 'border-l-4 border-l-emerald-500/70'
              )}>
                <div className={cn("flex items-center gap-2 mb-3 pb-3 border-b select-none", theme !== 'light' ? 'border-zinc-800/60' : 'border-zinc-200')}>
                  <CalendarDays className={cn('w-4 h-4 flex-shrink-0', weeklyTargetsComplete ? 'text-emerald-400' : tc.textMuted)} strokeWidth={2} />
                  <span className={cn("text-sm font-semibold truncate", tc.text)}>
                    {WEEKDAY_FULL_NAME[todayWeekday]} Specifics
                  </span>
                  <span
                    className={cn(
                      'ml-auto flex-shrink-0 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap',
                      weeklyTargetsComplete
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : cn(theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200', tc.textMuted)
                    )}
                  >
                    {weeklyCheckedCount}/{weeklyTargetsToday.length}{weeklyTargetsComplete ? ' Ready' : ' Today'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {weeklyTargetsToday.map(({ gI, item, iI }) => {
                    const checked = !!todayChecks[gI]?.[iI];
                    return (
                      <label
                        key={item.id}
                        className="flex items-center gap-2.5 cursor-pointer group select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLifeDisciplineItem(todayKey, gI, iI)}
                          className="sr-only peer cursor-pointer"
                        />
                        <span
                          className={cn(
                            'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200 ease-out',
                            checked
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 scale-100'
                              : cn(theme !== 'light' ? 'border-zinc-700' : 'border-zinc-300', theme !== 'light' ? 'group-hover:border-zinc-400' : 'group-hover:border-zinc-500', 'group-active:scale-90')
                          )}
                        >
                          {checked && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span className={cn('text-xs select-none transition-colors truncate', checked ? cn(tc.textMuted, 'line-through') : tc.textSecondary)}>
                          {item.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* DYNAMIC CHALLENGE PROGRESS GRID */}
        <div className={cn(
          "rounded-xl p-5 min-w-0 w-full border",
          theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
        )}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className={cn("text-base font-semibold flex items-center gap-2 select-none", tc.text)}>
              <Target className={cn("w-4 h-4 flex-shrink-0", tc.textMuted)} />
              <span className="truncate">{challengeConfig.durationDays}-Day Challenge Progress</span>
            </h3>
            <div className={cn("flex items-center gap-3 text-xs flex-wrap", tc.textMuted)}>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" /> Complete</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" /> Re-checked</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" /> Failed</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" /> Today</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0" /> Upcoming</span>
            </div>
          </div>

          {/* TOP STATUS BAR: Challenge Timeline + Days Remaining + streak +
              discipline score (re-check tokens already shown in the stat
              card above) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 select-none">
            <div className={cn("flex items-center gap-2.5 p-3 rounded-lg border", theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200')}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-500/20 text-violet-400">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold truncate tabular-nums", tc.text)}>
                  {formatDate(lifeDisciplineStartDate)} <span className={cn(tc.textMuted, "font-normal")}>→</span> {formatDate(endDateKey)}
                </p>
                <p className={cn("text-[11px]", tc.textMuted)}>Challenge timeline</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-2.5 p-3 rounded-lg border", theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200')}>
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                theme !== 'light' ? 'bg-zinc-800/60' : 'bg-zinc-100', tc.textMuted
              )}>
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold truncate tabular-nums", tc.text)}>{daysRemaining} Days Remaining</p>
                <p className={cn("text-[11px]", tc.textMuted)}>Until target end date</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-2.5 p-3 rounded-lg border", theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200')}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-500/20 text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold truncate tabular-nums", tc.text)}>{activeStreak}-Day Streak</p>
                <p className={cn("text-[11px]", tc.textMuted)}>Active streak</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-2.5 p-3 rounded-lg border", theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200')}>
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                disciplineScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : disciplineScore >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
              )}>
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={cn('text-sm font-semibold truncate tabular-nums', disciplineScore >= 80 ? 'text-emerald-400' : disciplineScore >= 50 ? 'text-amber-400' : 'text-rose-400')}>
                  {disciplineScore}% Discipline Score
                </p>
                <p className={cn("text-[11px]", tc.textMuted)}>Execution rate</p>
              </div>
            </div>
          </div>

          {challengeConfig.recheckTokens > 0 ? (
            <p className={cn("text-xs mb-3 select-none", tc.textMuted)}>
              Click any past day to view its details, spend a re-check token, or edit a logged reason. {lifeDisciplineTokensRemaining} of {challengeConfig.recheckTokens} tokens remaining.
            </p>
          ) : (
            <p className={cn("text-xs mb-3 select-none", tc.textMuted)}>
              Zero-cheating mode: no re-check tokens remaining. Click any past day to view its details or log why it was missed.
            </p>
          )}

          <div
            className="grid w-full gap-1.5 grid-cols-[var(--ld-grid-mobile)] md:grid-cols-[var(--ld-grid-desktop)]"
            style={{
              '--ld-grid-mobile': challengeGridTemplateMobile,
              '--ld-grid-desktop': challengeGridTemplateDesktop,
            } as React.CSSProperties}
          >
            {gridDays.map(({ day, dateKey, status }) => {
              const loggedReason = lifeDisciplineMissedReasons[dateKey];
              const isClickable = status === 'complete' || status === 'failed' || status === 'grace';
              const tooltip =
                status === 'failed'
                  ? loggedReason
                    ? `Day ${day} — missed: ${loggedReason}`
                    : lifeDisciplineTokensRemaining > 0
                    ? `Day ${day} — click to view details or spend a re-check token`
                    : `Day ${day} — missed, no tokens left. Click to log a reason.`
                  : status === 'grace'
                  ? `Day ${day} — re-checked, click for details`
                  : status === 'complete'
                  ? `Day ${day} — complete, click for details`
                  : status === 'pending'
                  ? `Day ${day} — today, in progress`
                  : `Day ${day}`;
              return (
                <div
                  key={day}
                  title={tooltip}
                  onClick={() => handleLifeDisciplineTileClick(dateKey, day, status)}
                  className={cn(
                    'w-full aspect-square flex flex-col items-center justify-center gap-0.5 rounded-md border text-xs font-medium transition-colors select-none',
                    statusStyles[status],
                    isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-default'
                  )}
                >
                  <span>{day}</span>
                  {loggedReason && <span className="w-1 h-1 rounded-full bg-amber-400" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
}
