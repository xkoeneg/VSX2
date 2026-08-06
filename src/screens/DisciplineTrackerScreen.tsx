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
import { getTagColorStyle } from '../constants/tagColors';
import { PageHeader } from '../components/shared/PageHeader';
import { formatCurrency, formatDate } from '../utils/format';
import { FunkyBear } from '../components/shared/FunkyBear';
import { formatTimeDisplay } from '../utils/tradeDuration';
import { TrackingBadge } from '../components/shared/TrackingBadge';
import { SessionBadge } from '../components/shared/SessionBadge';
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

// Matches the local type of the same name declared inside useAppState() —
// duplicated here since that one is scoped to the hook's function body and
// can't be imported directly.
type DisciplineAnalyticsTimeframe = 'week' | 'month' | 'lastMonth' | '3months' | 'all';

export function DisciplineScreen() {
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

    const followedTrades = filteredTrades.filter(t => t.rulesFollowed === 'followed');
    const brokenTrades = filteredTrades.filter(t => t.rulesFollowed === 'broken');

    // Psychology analytics: for each Emotion tag logged within the selected
    // timeframe, tally how often it shows up, the aggregate P&L tied to
    // trades carrying that tag (the "financial damage/gain" of that state of
    // mind), and the win rate of trades tagged with it. Mistakes get the same
    // P&L-impact treatment, filtered by its own independent timeframe.
    // "This Month" and "Last Month" are true calendar-month boundaries (not a
    // rolling 30-day window), so on the 1st of the month "This Month" only
    // shows that day's trades instead of still pulling in the prior month.
    const filterTradesByTimeframe = (trades: Trade[], timeframe: DisciplineAnalyticsTimeframe): Trade[] => {
      if (timeframe === 'all') return trades;
      const now = new Date();
      if (timeframe === 'week') {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 7);
        return trades.filter(t => new Date(t.date) >= cutoff);
      }
      if (timeframe === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return trades.filter(t => new Date(t.date) >= monthStart);
      }
      if (timeframe === 'lastMonth') {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return trades.filter(t => {
          const d = new Date(t.date);
          return d >= lastMonthStart && d < thisMonthStart;
        });
      }
      // 3months: rolling 90-day-ish window (3 calendar months back from today)
      const cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 3);
      return trades.filter(t => new Date(t.date) >= cutoff);
    };
    const emotionsTimeframeTrades = filterTradesByTimeframe(filteredTrades, emotionsTimeframe);
    const mistakesTimeframeTrades = filterTradesByTimeframe(filteredTrades, mistakesTimeframe);

    const emotionStatsMap: Record<string, { count: number; pnl: number; wins: number }> = {};
    emotionsTimeframeTrades.forEach(t => (t.emotions || []).forEach(e => {
      if (!emotionStatsMap[e]) emotionStatsMap[e] = { count: 0, pnl: 0, wins: 0 };
      emotionStatsMap[e].count += 1;
      emotionStatsMap[e].pnl += t.profitLoss;
      if (t.profitLoss > 0) emotionStatsMap[e].wins += 1;
    }));
    const topEmotions = Object.entries(emotionStatsMap)
      .map(([emotion, s]) => ({ emotion, count: s.count, pnl: s.pnl, winRate: s.count > 0 ? (s.wins / s.count) * 100 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    const maxEmotionCount = topEmotions[0]?.count || 1;

    const mistakeStatsMap: Record<string, { count: number; pnl: number }> = {};
    mistakesTimeframeTrades.forEach(t => (t.mistakes || []).forEach(m => {
      if (!mistakeStatsMap[m]) mistakeStatsMap[m] = { count: 0, pnl: 0 };
      mistakeStatsMap[m].count += 1;
      mistakeStatsMap[m].pnl += t.profitLoss;
    }));
    const topMistakes = Object.entries(mistakeStatsMap)
      .map(([mistake, s]) => ({ mistake, count: s.count, pnl: s.pnl }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    const maxMistakeCount = topMistakes[0]?.count || 1;

    // Global Timeframe dropdown counts as "active" (i.e. reflects both cards)
    // only when the two cards already agree — the moment either card is
    // changed independently, the master dropdown just shows its own value
    // without silently overriding the other card.
    const globalAnalyticsTimeframe = emotionsTimeframe === mistakesTimeframe ? emotionsTimeframe : null;
    const setGlobalAnalyticsTimeframe = (tf: DisciplineAnalyticsTimeframe) => {
      setEmotionsTimeframe(tf);
      setMistakesTimeframe(tf);
    };

    // Trades Needing Review — recent trades with no emotion or mistake tags
    // logged yet, newest first, so the discipline queue surfaces what's left
    // to tag before it gets buried in history.
    const pendingReviewTrades = [...filteredTrades]
      .filter(t => (!t.emotions || t.emotions.length === 0) && (!t.mistakes || t.mistakes.length === 0))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);

    // Current Discipline Streak — based on actual TRADING DAYS, not individual
    // trades, so a rest day (weekend, no trades logged) never breaks the chain.
    // A trading day only counts as "Compliant" when every trade logged that
    // date followed the rules; one broken-rule trade makes the whole day break
    // the streak. Days are ordered chronologically by calendar date, and only
    // dates with at least one logged trade are considered "trading days" —
    // gaps between them (weekends, days off) are simply skipped over.
    const tradingDaysMap: Record<string, Trade[]> = {};
    filteredTrades.forEach(t => {
      (tradingDaysMap[t.date] = tradingDaysMap[t.date] || []).push(t);
    });
    const tradingDayCompliance = Object.entries(tradingDaysMap)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, dayTrades]) => ({
        date,
        compliant: dayTrades.every(t => t.rulesFollowed === 'followed'),
      }));

    let disciplineStreak = 0;
    for (let i = tradingDayCompliance.length - 1; i >= 0; i--) {
      if (tradingDayCompliance[i].compliant) disciplineStreak++;
      else break;
    }

    // Best Streak: the longest run of consecutive compliant trading days
    // anywhere in the filtered history, not just the current active run.
    let bestStreak = 0;
    {
      let run = 0;
      tradingDayCompliance.forEach(d => {
        if (d.compliant) {
          run++;
          bestStreak = Math.max(bestStreak, run);
        } else {
          run = 0;
        }
      });
    }
    const totalCompliantDays = tradingDayCompliance.filter(d => d.compliant).length;

    // Streak Progress — milestone tier the current streak of compliant
    // trading days has unlocked, shown in the card's bottom stats footer.
    const streakTiers: Array<{ days: number; label: string }> = [
      { days: 7, label: 'Novice' },
      { days: 30, label: 'Consistent' },
      { days: 60, label: 'Master' },
      { days: 90, label: 'Elite Fund Manager' },
    ];
    const activeStreakTier = [...streakTiers].reverse().find(t => disciplineStreak >= t.days);

    // Streak Progress pill grid — column count and gap scale with the selected
    // window so 30/60/90 each lay out as a clean, evenly-divided grid (3, 5,
    // and 6 full rows respectively) that stretches to fill the card with no
    // leftover empty space and no overflow.
    const streakPillGridConfig: Record<30 | 60 | 90, { cols: number; gap: string }> = {
      30: { cols: 10, gap: 'gap-2' },
      60: { cols: 12, gap: 'gap-1.5' },
      90: { cols: 15, gap: 'gap-1' },
    };
    const { cols: streakPillCols, gap: streakPillGap } = streakPillGridConfig[streakGridWindow];
    const streakPillRows = Math.ceil(streakGridWindow / streakPillCols);

    // Mini Discipline Calendar — its own month browser (independent of the
    // Performance Calendar page), laid out Monday-first. Each day cell reflects
    // whether every trade logged that day followed the rules, any trade broke a
    // rule, or nothing was logged at all.
    const miniMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const { year: miniYear, month: miniMonth } = disciplineCalendarMonth;
    const miniFirstDayJs = new Date(miniYear, miniMonth, 1).getDay(); // 0 = Sun
    const miniFirstDay = (miniFirstDayJs + 6) % 7; // 0 = Mon ... 6 = Sun
    const miniDaysInMonth = new Date(miniYear, miniMonth + 1, 0).getDate();
    const miniCalendarDays: Array<{ day: number | null; date: string | null; trades: Trade[] }> = [];
    for (let i = 0; i < miniFirstDay; i++) miniCalendarDays.push({ day: null, date: null, trades: [] });
    for (let d = 1; d <= miniDaysInMonth; d++) {
      const dateStr = `${miniYear}-${String(miniMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      miniCalendarDays.push({ day: d, date: dateStr, trades: filteredTrades.filter(t => t.date === dateStr) });
    }

    // Win Rate on Compliant Days — the win rate of trades logged on days where
    // every single trade that day followed the rules (a "clean" day), across
    // all filtered history (not limited to the mini-calendar's visible month).
    const tradesByDate: Record<string, Trade[]> = {};
    filteredTrades.forEach(t => {
      (tradesByDate[t.date] = tradesByDate[t.date] || []).push(t);
    });
    const compliantDayTrades: Trade[] = Object.values(tradesByDate)
      .filter(dayTrades => dayTrades.every(t => t.rulesFollowed === 'followed'))
      .flat();
    const compliantDayWinRate = compliantDayTrades.length > 0
      ? (compliantDayTrades.filter(t => t.profitLoss > 0).length / compliantDayTrades.length) * 100
      : 0;

    // Popover account label — shows just the clean base name (e.g. "Main")
    // when no other account shares that prefix, and falls back to the full
    // "Base - Identifier" name whenever two or more accounts share a prefix
    // (e.g. "Main - 101" vs "Main - 202") so they stay distinguishable.
    const formatAccountName = (account: Account | undefined): string => {
      if (!account) return '';
      const baseOf = (name: string) => (name.includes(' - ') ? name.split(' - ')[0].trim() : name.trim());
      const base = baseOf(account.name);
      const sharedPrefixCount = accounts.filter(a => baseOf(a.name) === base).length;
      return sharedPrefixCount > 1 ? account.name : base;
    };

    // Small pill row shown under a trade's P&L in the log: every logged emotion
    // then every mistake — all of them, not just the first couple, wrapping onto
    // as many lines as needed since each trade row now has the full row width to
    // itself. Each badge is tinted with that tag's own saved color (same
    // dictionary as the Discipline & Psychology Review modal's dropdowns) instead
    // of a uniform violet/red fallback.
    const renderPsychBadges = (trade: Trade) => {
      const emotions = trade.emotions || [];
      const mistakes = trade.mistakes || [];
      if (emotions.length === 0 && mistakes.length === 0) return null;
      return (
        <div className="flex flex-wrap gap-1.5 justify-end">
          {emotions.map(e => (
            <span key={`e-${e}`} className={cn('px-2 py-0.5 rounded-full text-xs font-medium leading-normal', getTagColorStyle(colorForEmotion(e)).chip)}>
              {e}
            </span>
          ))}
          {mistakes.map(m => (
            <span key={`m-${m}`} className={cn('px-2 py-0.5 rounded-full text-xs font-medium leading-normal', getTagColorStyle(colorForMistake(m)).chip)}>
              {m}
            </span>
          ))}
        </div>
      );
    };

    return (
      <div className="space-y-6 min-w-0">
        <PageHeader
          title="Discipline Tracker"
          description="Monitor execution rules, emotions, and habit adherence"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderStatCard('Rules Followed', followedTrades.length, <CheckCircle2 className="w-4 h-4" />, 'text-emerald-400')}
          {renderStatCard('Rules Broken', brokenTrades.length, <XCircle className="w-4 h-4" />, 'text-rose-400')}
          {renderStatCard('Follow Rate', `${((followedTrades.length / (followedTrades.length + brokenTrades.length)) * 100 || 0).toFixed(1)}%`, <Target className="w-4 h-4" />)}
          {renderStatCard('Avg Loss (Broken)', brokenTrades.length > 0 ? formatCurrency(brokenTrades.reduce((s, t) => s + t.profitLoss, 0) / brokenTrades.length, privacyMode) : '$0.00', <AlertCircle className="w-4 h-4" />, 'text-rose-400')}
        </div>

        {/* Discipline Analytics — Trades Needing Review + Streak Progress + Mini Discipline Calendar, unified 3-column row, equal height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch mb-6">
          {/* Trades Needing Review — thin left column, sleek compact list of unreviewed trades */}
          <div className={cn(
            "lg:col-span-3 h-full flex flex-col rounded-xl p-4 min-w-0 border",
            theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
          )}>
            <div className="flex items-center justify-between gap-2 mb-3 flex-shrink-0">
              <h3 className={cn("text-xs font-semibold flex items-center gap-1.5 truncate", tc.text)}>
                <span>⚠️</span>
                <span className="truncate">Pending Review</span>
                {pendingReviewTrades.length > 0 && (
                  // Subtle, static bear glyph — a quiet "waiting" cue while
                  // there's real work to do. It only animates once the card
                  // flips into the all-clear celebration state below.
                  <span className="text-[11px] opacity-30 select-none" aria-hidden="true">🐻</span>
                )}
              </h3>
              {pendingReviewTrades.length > 0 && (
                <span className="text-[10px] font-mono font-semibold text-amber-300 flex-shrink-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30">
                  {pendingReviewTrades.length}
                </span>
              )}
            </div>

            {/* Fixed-height body: locked regardless of which state renders below,
                so the card never grows/shrinks or shifts neighboring cards when
                pendingCount flips between 0 and >0. */}
            <div className="h-[290px] max-h-[290px] flex flex-col min-h-0 overflow-hidden">
              {pendingReviewTrades.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <FunkyBear />
                  <span className={cn(
                    "text-[11px] font-medium px-3 py-1.5 rounded-full border whitespace-nowrap",
                    tc.textSecondary,
                    theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200'
                  )}>
                    🎉 0 Pending Trades — All Cleared!
                  </span>
                </div>
              ) : (
                <>
                  {/* Prominent action button — jumps straight into reviewing
                      the oldest unreviewed trade first. */}
                  <button
                    onClick={() => setShowDisciplineReview(pendingReviewTrades[0].id)}
                    className="mb-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-colors flex-shrink-0"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Review {pendingReviewTrades.length} Pending {pendingReviewTrades.length === 1 ? 'Trade' : 'Trades'}
                  </button>

                  <div
                    className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 overscroll-contain"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {pendingReviewTrades.map(trade => {
                      const account = accounts.find(a => a.id === trade.accountId);
                      const startLabel = formatTimeDisplay(trade.startTime);
                      const endLabel = formatTimeDisplay(trade.endTime);
                      const timeLabel = startLabel && endLabel
                        ? `${startLabel} – ${endLabel}`
                        : startLabel || endLabel;
                      return (
                        <div
                          key={trade.id}
                          onClick={() => { setShowTradeDetail(trade.id); setShowExpandGallery(false); }}
                          className={cn(
                            "p-2.5 rounded-lg border cursor-pointer transition-colors min-w-0",
                            theme !== 'light'
                              ? 'bg-zinc-800/30 border-zinc-700/40 hover:bg-zinc-800/50 hover:border-zinc-600/50'
                              : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'
                          )}
                        >
                          {/* Top row: trade #, symbol, PnL */}
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {trade.trackingNumber && <TrackingBadge value={trade.trackingNumber} size="sm" />}
                              <span className={cn("text-xs font-semibold truncate", tc.text)}>{trade.symbol}</span>
                            </div>
                            <span className={cn('text-xs font-mono font-semibold flex-shrink-0', trade.profitLoss > 0 ? 'text-emerald-400' : trade.profitLoss < 0 ? 'text-rose-400' : tc.textSecondary)}>
                              {formatCurrency(trade.profitLoss, privacyMode)}
                            </span>
                          </div>

                          {/* Account name */}
                          <p className={cn("text-[11px] truncate mt-1", tc.textSecondary)}>{formatAccountName(account) || account?.name || '—'}</p>

                          {/* Session + date/time row */}
                          <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
                            {trade.session && <SessionBadge value={trade.session} size="sm" />}
                            <span className={cn("text-[10px] font-mono truncate", tc.textMuted)}>
                              {formatDate(trade.date)}
                              {timeLabel && <span className={tc.textMuted}> · {timeLabel}</span>}
                            </span>
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); setShowDisciplineReview(trade.id); }}
                            className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[10px] font-medium hover:bg-violet-500/25 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            Review
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Streak Progress Grid — center column */}
          <div className={cn(
            "lg:col-span-5 rounded-xl p-5 min-w-0 h-full flex flex-col border",
            theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
          )}>
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4 flex-shrink-0">
                <h3 className={cn("text-sm font-semibold flex items-center gap-2 truncate", tc.text)}>
                  <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  STREAK PROGRESS
                </h3>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {([30, 60, 90] as const).map(w => (
                    <button
                      key={w}
                      onClick={() => setStreakGridWindow(w)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors',
                        streakGridWindow === w
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : theme !== 'light'
                            ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                <div>
                  <p className={cn("text-[11px] uppercase tracking-wider", tc.textMuted)}>Current Streak</p>
                  <p className="text-lg font-bold text-emerald-400 truncate">
                    {disciplineStreak} {disciplineStreak === 1 ? 'Day' : 'Days'} Clean
                  </p>
                </div>
                <div className={cn("w-px h-8 flex-shrink-0", theme !== 'light' ? 'bg-white/10' : 'bg-zinc-200')} />
                <div>
                  <p className={cn("text-[11px] uppercase tracking-wider", tc.textMuted)}>Best Streak</p>
                  <p className={cn("text-lg font-bold truncate", tc.textSecondary)}>
                    {bestStreak} {bestStreak === 1 ? 'Day' : 'Days'}
                  </p>
                </div>
              </div>

              {/* GitHub-style contribution pills — one per trading day within the
                  selected 30/60/90 window, laid out as a fixed-row CSS grid that
                  stretches to fill the card's remaining width and height exactly
                  (10x3 / 12x5 / 15x6), so there's never empty space below or a
                  need to scroll. Green pills fill in from the left for each
                  consecutive compliant trading day in the current streak; the
                  rest stay muted dark as the remaining target days. If the
                  streak breaks, the fill simply resets back to 0 and starts
                  filling fresh green pills from the left again — never red. */}
              <div
                className={cn('grid flex-1 min-h-0', streakPillGap)}
                style={{
                  gridTemplateColumns: `repeat(${streakPillCols}, 1fr)`,
                  gridTemplateRows: `repeat(${streakPillRows}, 1fr)`,
                }}
              >
                {Array.from({ length: streakGridWindow }, (_, i) => {
                  const filled = i < disciplineStreak;
                  return (
                    <div
                      key={i}
                      title={filled ? `Day ${i + 1}: Compliant Trading Day` : `Day ${i + 1}: Target`}
                      className={cn(
                        'w-full h-full rounded-md border transition-colors',
                        filled
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : theme !== 'light' ? 'bg-zinc-800/40 border-zinc-700/40' : 'bg-zinc-100 border-zinc-200'
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {/* Subtle stat summary row — pinned to the bottom to match the calendar's legend footer */}
            <div className={cn(
              "flex items-center gap-6 pt-3 mt-3 border-t text-xs flex-shrink-0",
              tc.textSecondary,
              theme !== 'light' ? 'border-white/5' : 'border-zinc-200'
            )}>
              <span>Total Compliant Days: <span className={cn("font-semibold", tc.text)}>{totalCompliantDays}</span></span>
              <span>Milestone Tier: <span className="text-amber-400 font-semibold">{activeStreakTier ? activeStreakTier.label : 'Unranked'}</span></span>
            </div>
          </div>

          {/* Mini Discipline Calendar — right column, compact and sleek */}
          <div className={cn(
            "lg:col-span-4 rounded-xl p-5 min-w-0 h-full flex flex-col justify-between select-none border",
            theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
          )}>
            <div className="mb-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h3 className={cn("text-sm font-semibold flex items-center gap-2 truncate", tc.text)}>
                  <Shield className={cn("w-4 h-4 flex-shrink-0", tc.textMuted)} />
                  MINI DISCIPLINE CALENDAR
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setDisciplineCalendarMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 })}
                    className={cn("p-1.5 rounded-md transition-colors", tc.btnSecondary)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className={cn("text-xs font-medium whitespace-nowrap min-w-[92px] text-center", tc.textSecondary)}>
                    {miniMonthNames[miniMonth]} {miniYear}
                  </span>
                  <button
                    onClick={() => setDisciplineCalendarMonth(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 })}
                    className={cn("p-1.5 rounded-md transition-colors", tc.btnSecondary)}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div ref={disciplineCalendarGridRef} className="grid grid-cols-7 gap-1 select-none">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={`${d}-${i}`} className={cn("text-center text-[10px] font-medium py-1", tc.textMuted)}>
                    {d}
                  </div>
                ))}
                {miniCalendarDays.map((cell, i) => {
                  if (cell.day === null || cell.date === null) return <div key={`empty-${i}`} className="h-9 select-none" />;
                  const cellDate = cell.date;
                  const hasTrades = cell.trades.length > 0;
                  const followedCount = cell.trades.filter(t => t.rulesFollowed === 'followed').length;
                  const brokenCount = cell.trades.length - followedCount;
                  const anyBroken = hasTrades && brokenCount > 0;
                  const allFollowed = hasTrades && brokenCount === 0;
                  const tooltip = hasTrades
                    ? `${miniMonthNames[miniMonth].slice(0, 3)} ${cell.day}: ${cell.trades.length} Trade${cell.trades.length !== 1 ? 's' : ''}${anyBroken ? `, ${brokenCount} Rule${brokenCount !== 1 ? 's' : ''} Broken` : ', All Rules Followed'}`
                    : `${miniMonthNames[miniMonth].slice(0, 3)} ${cell.day}: No Trades`;
                  const isOpen = openDisciplineDay === cellDate;
                  const alignRight = i % 7 >= 4; // Fri/Sat/Sun columns — flip the flyout so it doesn't overflow the card's right edge
                  return (
                    <div key={i} className="relative">
                      <div
                        title={tooltip}
                        onClick={() => hasTrades && setOpenDisciplineDay(prev => prev === cellDate ? null : cellDate)}
                        className={cn(
                          'w-full aspect-square select-none h-9 flex flex-col items-center justify-center gap-0.5 rounded-md border transition-colors',
                          hasTrades ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-default',
                          allFollowed && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
                          anyBroken && 'bg-rose-500/10 border-rose-500/30 text-rose-300',
                          !hasTrades && (theme !== 'light'
                            ? 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-zinc-500'
                            : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-400')
                        )}
                      >
                        <span className="text-xs font-medium">{cell.day}</span>
                        {hasTrades && (
                          <span className={cn('w-1 h-1 rounded-full', anyBroken ? 'bg-rose-400' : 'bg-emerald-400')} />
                        )}
                      </div>

                      {isOpen && (
                        <div
                          className={cn(
                            'absolute z-50 top-full mt-1.5 w-72 max-w-[calc(100vw-2rem)] border rounded-xl p-3.5 shadow-2xl',
                            theme !== 'light' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200',
                            alignRight ? 'right-0' : 'left-0'
                          )}
                        >
                          {/* Header — date + rule adherence badge */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={cn("text-sm font-semibold truncate", tc.text)}>
                              {miniMonthNames[miniMonth]} {cell.day}, {miniYear}
                            </span>
                            <span
                              className={cn(
                                'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap flex-shrink-0',
                                anyBroken ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300' : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                              )}
                            >
                              <span className={cn('w-1.5 h-1.5 rounded-full', anyBroken ? 'bg-rose-400' : 'bg-emerald-400')} />
                              {anyBroken ? `${brokenCount} Rule${brokenCount !== 1 ? 's' : ''} Broken` : '100% Compliant'}
                            </span>
                          </div>
                          <p className={cn("text-[11px] mb-3", tc.textMuted)}>
                            {cell.trades.length} Trade{cell.trades.length !== 1 ? 's' : ''} logged
                          </p>

                          {/* Daily trades list */}
                          <div className={cn("border-t pt-3 mt-2 max-h-56 overflow-y-auto overscroll-contain", tc.border)}>
                            {cell.trades.map(t => {
                              const tradeAccount = accounts.find(a => a.id === t.accountId);
                              return (
                                <div key={t.id} className={cn(
                                  "rounded-xl p-3 pb-3 mb-2.5 border",
                                  theme !== 'light' ? 'bg-zinc-800/60 border-white/10' : 'bg-zinc-50 border-zinc-200'
                                )}>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className={cn("text-xs font-semibold truncate", tc.text)}>
                                      {t.symbol}
                                      {t.session && <span className={cn("font-normal", tc.textMuted)}> · {t.session}</span>}
                                      {tradeAccount && (
                                        <>
                                          <span className={cn("mx-1.5", tc.textMuted)}>|</span>
                                          <span className="text-sky-400 font-medium text-xs">
                                            {formatAccountName(tradeAccount)}
                                          </span>
                                        </>
                                      )}
                                    </span>
                                    <span className={cn('text-xs font-bold font-mono flex-shrink-0', t.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                                      {formatCurrency(t.profitLoss, privacyMode)}
                                    </span>
                                  </div>
                                  {((t.mistakes && t.mistakes.length > 0) || (t.emotions && t.emotions.length > 0)) && (
                                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                                      {(t.emotions || []).map(e => (
                                        <span key={`e-${e}`} className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium', getTagColorStyle(colorForEmotion(e)).chip)}>
                                          {e}
                                        </span>
                                      ))}
                                      {(t.mistakes || []).map(m => (
                                        <span key={`m-${m}`} className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium', getTagColorStyle(colorForMistake(m)).chip)}>
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer action — jump to this day's trades in Trade History */}
                          <button
                            onClick={() => {
                              setView('trades');
                              setTradeSubView('database');
                              setDbSearch(cellDate);
                              setDbPage(0);
                              setOpenDisciplineDay(null);
                            }}
                            className={cn(
                              "w-full flex items-center justify-center gap-1.5 mt-2 pt-3 border-t text-xs font-medium transition-colors",
                              tc.border, tc.textMuted, theme !== 'light' ? 'hover:text-white' : 'hover:text-zinc-900'
                            )}
                          >
                            View in Trade History
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend footer — aligned horizontally with the Streak card's bottom stat row */}
            <div className={cn("flex items-center justify-between pt-3 mt-auto border-t text-xs", tc.border, tc.textMuted)}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                100% Followed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                Rule Broken
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0" />
                No Trades
              </span>
            </div>
          </div>
        </div>

        {/* Psychology & Behavioral Analytics — now positioned above the log, full width, two columns */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 truncate">
              <Brain className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <span className="truncate">Psychology & Behavioral Analytics</span>
            </h3>
            <select
              value={globalAnalyticsTimeframe ?? ''}
              onChange={(e) => setGlobalAnalyticsTimeframe(e.target.value as DisciplineAnalyticsTimeframe)}
              title="Global Timeframe — updates both cards at once"
              className="px-2.5 py-1 bg-zinc-900 border border-white/10 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer flex-shrink-0"
            >
              {globalAnalyticsTimeframe === null && <option value="" disabled>Mixed</option>}
              {disciplineAnalyticsTimeframeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 mb-5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-zinc-400 uppercase tracking-wider truncate">Current Discipline Streak</p>
              <p className="text-lg font-bold text-white truncate">{disciplineStreak} trade{disciplineStreak !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-zinc-800/20 border border-zinc-800/60 rounded-xl p-4 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-semibold text-violet-400 flex items-center gap-1.5 min-w-0">
                  <Brain className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Top Emotions & State Breakdown</span>
                </h4>
                <select
                  value={emotionsTimeframe}
                  onChange={(e) => setEmotionsTimeframe(e.target.value as DisciplineAnalyticsTimeframe)}
                  className="px-2.5 py-1 bg-zinc-900 border border-white/10 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer flex-shrink-0"
                >
                  {disciplineAnalyticsTimeframeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {topEmotions.length === 0 ? (
                <p className="text-sm text-zinc-500 py-1">No emotions logged in this timeframe</p>
              ) : (
                <div className="space-y-3">
                  {topEmotions.map(({ emotion, count, pnl, winRate }) => {
                    const isProfit = pnl >= 0;
                    return (
                      <div key={emotion} className="min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium truncate', getTagColorStyle(colorForEmotion(emotion)).chip)}>
                            {emotion}
                          </span>
                          <span className={cn('text-sm font-mono font-medium flex-shrink-0', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                            {formatCurrency(pnl, privacyMode)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', isProfit ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-orange-400')}
                              style={{ width: `${(count / maxEmotionCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500 font-mono flex-shrink-0">{count}x · {winRate.toFixed(0)}% WR</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-zinc-800/20 border border-zinc-800/60 rounded-xl p-4 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-semibold text-rose-400 flex items-center gap-1.5 min-w-0">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Top Mistakes Committed</span>
                </h4>
                <select
                  value={mistakesTimeframe}
                  onChange={(e) => setMistakesTimeframe(e.target.value as DisciplineAnalyticsTimeframe)}
                  className="px-2.5 py-1 bg-zinc-900 border border-white/10 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer flex-shrink-0"
                >
                  {disciplineAnalyticsTimeframeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {topMistakes.length === 0 ? (
                <p className="text-sm text-zinc-500 py-1">No mistakes logged in this timeframe</p>
              ) : (
                <div className="space-y-3">
                  {topMistakes.map(({ mistake, count, pnl }) => (
                    <div key={mistake} className="min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium truncate', getTagColorStyle(colorForMistake(mistake)).chip)}>
                          {mistake}
                        </span>
                        <span className="text-sm font-mono font-medium text-rose-400 flex-shrink-0">
                          {formatCurrency(pnl, privacyMode)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-600 to-orange-400"
                            style={{ width: `${(count / maxMistakeCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 font-mono flex-shrink-0">{count}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rule Adherence Log — full width so trades have room to show every emotion/mistake tag, not just the first couple */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 min-w-0">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span className="truncate">Rule Adherence Log</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col w-full min-w-0">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800/70 flex-shrink-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400 truncate">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Followed
                </span>
                <span className="text-xs font-mono text-zinc-400 flex-shrink-0 px-2 py-0.5 rounded bg-zinc-800/60">{followedTrades.length}</span>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px] pr-1 overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                {followedTrades.map(trade => {
                  const account = accounts.find(a => a.id === trade.accountId);
                  return (
                    <div key={trade.id} onClick={() => { setShowRuleReviewModal(trade.id); setIsEditingRuleReview(false); }} className="p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors min-w-0 border-l-2 border-emerald-500/70">
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <TrackingBadge value={trade.trackingNumber} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{trade.symbol}</p>
                            <p className="text-xs text-zinc-400 truncate">{account?.name} | {formatDate(trade.date)}</p>
                          </div>
                        </div>
                        <p className={cn('font-mono font-medium text-sm flex-shrink-0', trade.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                          {formatCurrency(trade.profitLoss, privacyMode)}
                        </p>
                      </div>
                      {(trade.emotions?.length || trade.mistakes?.length) ? (
                        <div className="mt-2 pt-2 border-t border-zinc-800/60">
                          {renderPsychBadges(trade)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                {followedTrades.length === 0 && (
                  <div className="h-full min-h-[280px] flex flex-col items-center justify-center gap-2 text-center">
                    <CheckCircle2 className="w-7 h-7 text-zinc-700" />
                    <p className="text-sm text-zinc-600">No trades with rules followed</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col w-full min-w-0">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800/70 flex-shrink-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-rose-400 truncate">
                  <XCircle className="w-4 h-4 flex-shrink-0" /> Broken
                </span>
                <span className="text-xs font-mono text-zinc-400 flex-shrink-0 px-2 py-0.5 rounded bg-zinc-800/60">{brokenTrades.length}</span>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px] pr-1 overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                {brokenTrades.map(trade => {
                  const account = accounts.find(a => a.id === trade.accountId);
                  return (
                    <div key={trade.id} onClick={() => { setShowRuleReviewModal(trade.id); setIsEditingRuleReview(false); }} className="p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors min-w-0 border-l-2 border-rose-500/70">
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <TrackingBadge value={trade.trackingNumber} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{trade.symbol}</p>
                            <p className="text-xs text-zinc-400 truncate">{account?.name} | {formatDate(trade.date)}</p>
                          </div>
                        </div>
                        <p className={cn('font-mono font-medium text-sm flex-shrink-0', trade.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                          {formatCurrency(trade.profitLoss, privacyMode)}
                        </p>
                      </div>
                      {(trade.emotions?.length || trade.mistakes?.length) ? (
                        <div className="mt-2 pt-2 border-t border-zinc-800/60">
                          {renderPsychBadges(trade)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                {brokenTrades.length === 0 && (
                  <div className="h-full min-h-[280px] flex flex-col items-center justify-center gap-2 text-center">
                    <XCircle className="w-7 h-7 text-zinc-700" />
                    <p className="text-sm text-zinc-600">No trades with rules broken</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
