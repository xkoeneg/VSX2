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
      complete: 'bg-emerald-500 border-emerald-400 text-white',
      grace: 'bg-cyan-500/80 border-cyan-400 text-white',
      failed: 'bg-rose-500/90 border-rose-400 text-white cursor-pointer hover:brightness-110',
      pending: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
      upcoming: theme !== 'light' ? 'bg-zinc-800/50 border-zinc-800 text-zinc-600' : 'bg-zinc-100 border-zinc-200 text-zinc-400',
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
              className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700"
            >
              <Settings className="w-4 h-4" />
              Configure Challenge
            </button>
          }
        />

        {/* ACTIVE CHALLENGE BANNER — the Challenge Title + Identity/Vision
            Motto from the Configure Challenge modal live here, not in the
            static page header above. */}
        <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900/40 to-zinc-900/40 border border-amber-500/20 rounded-2xl px-5 py-4 min-w-0">
          <p className="text-base sm:text-lg font-bold text-white truncate flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-amber-400">ACTIVE CHALLENGE:</span>
            <span className="truncate">{challengeConfig.title}</span>
          </p>
          {challengeConfig.motto && (
            <p className="mt-1.5 text-sm italic text-zinc-400 truncate">
              <span aria-hidden="true">💬</span> "{challengeConfig.motto}"
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {renderStatCard('Today\'s Progress', `${checkedItems}/${totalItems}`, <CheckCircle2 className="w-4 h-4" />, todayComplete ? 'text-emerald-400' : 'text-amber-400')}
          {renderStatCard('Days Completed', completedCount, <Flame className="w-4 h-4" />, 'text-emerald-400')}
          {renderStatCard('Days Failed', failedCount, <XCircle className="w-4 h-4" />, 'text-rose-400')}
          {renderStatCard('Re-check Tokens', `${lifeDisciplineTokensRemaining}/${challengeConfig.recheckTokens}`, <RefreshCw className="w-4 h-4" />, 'text-cyan-400')}
        </div>

        {/* DAILY CHECKLIST SECTION */}
        <div className="relative bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 select-none">
              <Shield className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span className="truncate">Daily Checklist — {formatDate(todayKey)}</span>
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasActiveChallengeProgress && (
                <button
                  onClick={() => openChallengeConfigModal('edit')}
                  title="Edit Challenge"
                  aria-label="Edit Challenge"
                  className="flex items-center justify-center p-2 rounded-lg transition-all bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => completeAllLifeDisciplineToday(todayKey)}
                disabled={todayComplete || totalItems === 0}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all select-none',
                  todayComplete || totalItems === 0
                    ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                    : 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer'
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
              style={{ animation: 'lifeDisciplineToastIn 0.25s ease-out' }}
              className="absolute top-3 right-5 z-10 px-3.5 py-2 rounded-lg bg-emerald-500 text-black text-xs font-semibold shadow-lg select-none"
            >
              {lifeDisciplineToast}
            </div>
          )}
          <style>{`
            @keyframes lifeDisciplineToastIn {
              from { opacity: 0; transform: translateY(-6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {routineGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-zinc-800/60 border border-zinc-800 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-400 max-w-xs">
                No routine categories added yet. Click "+ Add Category" to start.
              </p>
              <button
                onClick={() => openChallengeConfigModal(hasActiveChallengeProgress ? 'edit' : 'configure')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          ) : dailyOnlyGroups.length === 0 ? (
            <p className="text-sm text-zinc-500 italic py-2 select-none">
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
                    'rounded-xl border p-4 transition-colors',
                    groupComplete ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-800/30 border-zinc-800/70'
                  )}
                >
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800/60 select-none">
                    {renderCategoryIcon(group, 'w-4 h-4', groupComplete ? 'text-emerald-400' : undefined)}
                    <span className="text-sm font-semibold text-white truncate">{group.label}</span>
                    <span
                      className={cn(
                        'ml-auto flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap',
                        groupComplete
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      )}
                    >
                      {groupCheckedCount}/{dailyItemsWithIndex.length}{groupComplete ? ' Ready' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dailyItemsWithIndex.length === 0 && (
                      <p className="text-xs text-zinc-500 italic select-none">
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
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200 ease-out',
                              checked
                                ? 'bg-emerald-500 border-emerald-400 scale-100'
                                : 'border-zinc-600 group-hover:border-zinc-400 group-active:scale-90'
                            )}
                          >
                            {checked && <Check className="w-3.5 h-3.5 text-white" />}
                          </span>
                          <span className={cn('text-sm select-none transition-colors', checked ? 'text-zinc-300 line-through decoration-zinc-600' : 'text-zinc-300')}>
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
                'mt-4 rounded-xl border p-4 transition-colors',
                weeklyTargetsComplete ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-800/30 border-zinc-800/70'
              )}>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800/60 select-none">
                  <CalendarDays className={cn('w-4 h-4 flex-shrink-0', weeklyTargetsComplete ? 'text-emerald-400' : 'text-zinc-400')} strokeWidth={2} />
                  <span className="text-sm font-semibold text-white truncate">
                    {WEEKDAY_FULL_NAME[todayWeekday]} Specifics
                  </span>
                  <span
                    className={cn(
                      'ml-auto flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap',
                      weeklyTargetsComplete
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
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
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200 ease-out',
                            checked
                              ? 'bg-emerald-500 border-emerald-400 scale-100'
                              : 'border-zinc-600 group-hover:border-zinc-400 group-active:scale-90'
                          )}
                        >
                          {checked && <Check className="w-3.5 h-3.5 text-white" />}
                        </span>
                        <span className={cn('text-sm select-none transition-colors truncate', checked ? 'text-zinc-300 line-through decoration-zinc-600' : 'text-zinc-300')}>
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
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 select-none">
              <Target className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span className="truncate">{challengeConfig.durationDays}-Day Challenge Progress</span>
            </h3>
            <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Complete</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/80" /> Re-checked</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/90" /> Failed</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-amber-500/50" /> Today</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-zinc-800 border border-zinc-700" /> Upcoming</span>
            </div>
          </div>

          {/* TOP STATUS BAR: Challenge Timeline + Days Remaining + streak +
              discipline score (re-check tokens already shown in the stat
              card above) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 select-none">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 flex-shrink-0">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {formatDate(lifeDisciplineStartDate)} <span className="text-zinc-500 font-normal">→</span> {formatDate(endDateKey)}
                </p>
                <p className="text-[11px] text-zinc-500">Challenge timeline</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{daysRemaining} Days Remaining</p>
                <p className="text-[11px] text-zinc-500">Until target end date</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{activeStreak}-Day Streak</p>
                <p className="text-[11px] text-zinc-500">Active streak</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={cn('text-sm font-bold truncate', disciplineScore >= 80 ? 'text-emerald-400' : disciplineScore >= 50 ? 'text-amber-400' : 'text-rose-400')}>
                  {disciplineScore}% Discipline Score
                </p>
                <p className="text-[11px] text-zinc-500">Execution rate</p>
              </div>
            </div>
          </div>

          {challengeConfig.recheckTokens > 0 ? (
            <p className="text-xs text-zinc-500 mb-3 select-none">
              Click any past day to view its details, spend a re-check token, or edit a logged reason. {lifeDisciplineTokensRemaining} of {challengeConfig.recheckTokens} tokens remaining.
            </p>
          ) : (
            <p className="text-xs text-zinc-500 mb-3 select-none">
              Zero-cheating mode: no re-check tokens remaining. Click any past day to view its details or log why it was missed.
            </p>
          )}

          <div className="grid grid-cols-10 sm:grid-cols-10 md:grid-cols-[repeat(20,minmax(0,1fr))] gap-1.5">
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
                    'relative aspect-square rounded-md border flex items-center justify-center text-[10px] font-mono font-medium transition-colors select-none',
                    statusStyles[status],
                    isClickable && 'cursor-pointer hover:brightness-110'
                  )}
                >
                  {day}
                  {loggedReason && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-zinc-950 border border-white/70 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-white/90" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
}
