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
import { PageHeader } from '../components/shared/PageHeader';
import { formatCurrency, formatCurrencyCompact } from '../utils/format';
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

export function CalendarScreen() {
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

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Pad the month out to full weeks so we can render a Topstep-style grid
    // with a "Week" recap column at the end of every row.
    const paddedDays = [...calendarDays];
    while (paddedDays.length % 7 !== 0) paddedDays.push({ day: null, trades: [] as Trade[], pnl: 0 } as typeof paddedDays[number]);
    const weeks: typeof paddedDays[] = [];
    for (let i = 0; i < paddedDays.length; i += 7) weeks.push(paddedDays.slice(i, i + 7));

    const { year, month } = calendarMonth;
    const monthTrades = filteredTrades.filter(t => {
      const date = new Date(`${t.date}T00:00:00`);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    const totalPnL = monthTrades.reduce((s, t) => s + t.profitLoss, 0);
    const tradingDays = calendarDays.filter(d => d.day !== null && d.trades.length > 0).length;
    const winningDays = calendarDays.filter(d => d.day !== null && d.pnl > 0).length;
    const losingDays = calendarDays.filter(d => d.day !== null && d.pnl < 0).length;
    // Win Rate here is DAY-level, not trade-level: it's the share of trading
    // days that closed green vs. red (breakeven days excluded), matching how
    // prop-firm style calendars usually frame monthly consistency.
    const winRate = (winningDays + losingDays) > 0 ? (winningDays / (winningDays + losingDays)) * 100 : 0;

    return (
      <div className="space-y-6 min-w-0">
        <PageHeader
          title="Performance Calendar"
          description="Daily P&L breakdown and calendar review"
          actions={
            <>
              {renderAccountFilter()}

              <div className="flex items-center gap-2 h-9 select-none">
                <button type="button" onClick={() => { setCalendarMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 }); }} className={cn('h-9 w-9 flex items-center justify-center flex-shrink-0 rounded-lg text-xs font-medium border select-none transition-colors active:scale-95', tc.btnSecondary, theme !== 'light' ? 'border-zinc-700/50' : 'border-zinc-200')}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className={cn('h-9 flex items-center px-3 rounded-lg border select-none', tc.btnSecondary, theme !== 'light' ? 'border-zinc-700/50' : 'border-zinc-200')}>
                  <span className="text-xs font-medium whitespace-nowrap select-none">{monthNames[calendarMonth.month]} {calendarMonth.year}</span>
                </div>
                <button type="button" onClick={() => { setCalendarMonth(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 }); }} className={cn('h-9 w-9 flex items-center justify-center flex-shrink-0 rounded-lg text-xs font-medium border select-none transition-colors active:scale-95', tc.btnSecondary, theme !== 'light' ? 'border-zinc-700/50' : 'border-zinc-200')}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          }
        />

        {/* Hero summary bar — big net P&L front and center like a prop-firm dashboard, stats trailing */}
        <div className={cn(
          'rounded-xl border p-4 sm:p-5 flex flex-wrap items-center gap-x-4 sm:gap-x-8 gap-y-4',
          theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
        )}>
          <div className={cn('flex items-center gap-3 pr-4 sm:pr-8 border-r', theme !== 'light' ? 'border-zinc-800/80' : 'border-zinc-200')}>
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', totalPnL >= 0 ? 'bg-emerald-500/15 border border-emerald-500/40' : 'bg-rose-500/15 border border-rose-500/40')}>
              <DollarSign className={cn('w-5 h-5', totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400')} />
            </div>
            <div>
              <p className={cn('text-[11px] uppercase tracking-wider', tc.textMuted)}>Net P&L This Month</p>
              <p className={cn('text-2xl font-bold font-mono tabular-nums', totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {formatCurrency(totalPnL, privacyMode)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-8 gap-y-3">
            <div>
              <p className={cn('text-[11px] uppercase tracking-wider mb-0.5', tc.textMuted)}>Trading Days</p>
              <p className={cn('text-lg font-semibold tabular-nums', tc.text)}>{tradingDays}</p>
            </div>
            <div>
              <p className={cn('text-[11px] uppercase tracking-wider mb-0.5', tc.textMuted)}>Winning Days</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-400">{winningDays}</p>
            </div>
            <div>
              <p className={cn('text-[11px] uppercase tracking-wider mb-0.5', tc.textMuted)}>Losing Days</p>
              <p className="text-lg font-semibold tabular-nums text-rose-400">{losingDays}</p>
            </div>
            <div>
              <p className={cn('text-[11px] uppercase tracking-wider mb-0.5', tc.textMuted)}>Win Rate</p>
              <p className={cn('text-lg font-semibold tabular-nums', tc.text)}>{winRate.toFixed(0)}%</p>
            </div>
            <div>
              <p className={cn('text-[11px] uppercase tracking-wider mb-0.5', tc.textMuted)}>Trades</p>
              <p className={cn('text-lg font-semibold tabular-nums', tc.text)}>{monthTrades.length}</p>
            </div>
          </div>
        </div>

        <div className={cn(
          'rounded-xl border p-3 sm:p-4',
          theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
        )}>
          {/* Desktop/tablet: original 8-column grid (7 days + Week recap column) */}
          <div className="hidden md:block">
            <div className="grid grid-cols-8 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className={cn('text-center text-xs font-medium py-2', tc.textMuted)}>{day}</div>
              ))}
              <div className={cn('text-center text-xs font-medium py-2', tc.textMuted)}>Week</div>
            </div>

            <div className="space-y-2">
              {weeks.map((week, wi) => {
                const weekRealDays = week.filter(d => d.day !== null);
                const weekPnl = weekRealDays.reduce((s, d) => s + d.pnl, 0);
                const weekTradingDays = weekRealDays.filter(d => d.trades.length > 0).length;
                const hasWeekData = weekTradingDays > 0;
                return (
                  <div key={wi} className="grid grid-cols-8 gap-2">
                    {week.map((day, di) => (
                      <div
                        key={di}
                        className={cn(
                          'rounded-lg p-2.5 min-h-[92px] flex flex-col justify-between min-w-0 transition-colors',
                          day.day === null ? 'bg-transparent' :
                          day.trades.length === 0 ? (theme !== 'light' ? 'bg-zinc-800/30 border border-zinc-800/60' : 'bg-zinc-50 border border-zinc-200') :
                          day.pnl > 0 ? 'bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer' :
                          day.pnl < 0 ? 'bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 cursor-pointer' :
                          (theme !== 'light' ? 'bg-zinc-800/40 border border-zinc-700/60' : 'bg-zinc-100 border border-zinc-200')
                        )}
                      >
                        {day.day !== null && (
                          <>
                            <span className={cn('text-xs font-medium', tc.textMuted)}>{day.day}</span>
                            {day.trades.length > 0 ? (
                              <div className="min-w-0">
                                <p className={cn('text-sm font-bold font-mono tabular-nums truncate', day.pnl > 0 ? 'text-emerald-400' : day.pnl < 0 ? 'text-rose-400' : tc.textSecondary)}>
                                  {formatCurrency(day.pnl, privacyMode)}
                                </p>
                                <p className={cn('text-[10px] mt-0.5', tc.textMuted)}>{day.trades.length} trade{day.trades.length !== 1 ? 's' : ''}</p>
                              </div>
                            ) : (
                              <span className={cn('text-xs', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')}>—</span>
                            )}
                          </>
                        )}
                      </div>
                    ))}

                    {/* Week recap cell */}
                    <div className={cn(
                      'rounded-lg p-2.5 min-h-[92px] flex flex-col items-center justify-center min-w-0 border',
                      !hasWeekData ? (theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/50' : 'bg-zinc-50 border-zinc-200') :
                      weekPnl > 0 ? 'bg-emerald-500/15 border-emerald-500/30' :
                      weekPnl < 0 ? 'bg-rose-500/15 border-rose-500/30' :
                      (theme !== 'light' ? 'bg-zinc-800/40 border-zinc-700/60' : 'bg-zinc-100 border-zinc-200')
                    )}>
                      {hasWeekData ? (
                        <>
                          <p className={cn('text-[10px] uppercase tracking-wider', tc.textMuted)}>Week {wi + 1}</p>
                          <p className={cn('text-sm font-bold font-mono tabular-nums truncate', weekPnl > 0 ? 'text-emerald-400' : weekPnl < 0 ? 'text-rose-400' : tc.textSecondary)}>
                            {formatCurrency(weekPnl, privacyMode)}
                          </p>
                          <p className={cn('text-[10px]', tc.textMuted)}>{weekTradingDays} day{weekTradingDays !== 1 ? 's' : ''}</p>
                        </>
                      ) : (
                        <span className={cn('text-xs', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')}>—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: 7-column grid sized for narrow screens. The Week recap moves
              from an 8th squeezed column into a compact summary line under each
              week's row, so day cells stay readable instead of shrinking to ~30px. */}
          <div className="md:hidden">
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className={cn('text-center text-[10px] font-medium py-1 truncate', tc.textMuted)}>{day.slice(0, 2)}</div>
              ))}
            </div>

            <div className="space-y-1 mt-1">
              {weeks.map((week, wi) => {
                const weekRealDays = week.filter(d => d.day !== null);
                const weekPnl = weekRealDays.reduce((s, d) => s + d.pnl, 0);
                const weekTradingDays = weekRealDays.filter(d => d.trades.length > 0).length;
                const hasWeekData = weekTradingDays > 0;
                return (
                  <div key={wi} className="space-y-0.5">
                    <div className="grid grid-cols-7 gap-1">
                      {week.map((day, di) => (
                        <div
                          key={di}
                          className={cn(
                            'rounded-lg p-1 min-h-[44px] flex flex-col justify-between min-w-0 transition-colors',
                            day.day === null ? 'bg-transparent' :
                            day.trades.length === 0 ? (theme !== 'light' ? 'bg-zinc-800/30 border border-zinc-800/60' : 'bg-zinc-50 border border-zinc-200') :
                            day.pnl > 0 ? 'bg-emerald-500/15 border border-emerald-500/30' :
                            day.pnl < 0 ? 'bg-rose-500/15 border border-rose-500/30' :
                            (theme !== 'light' ? 'bg-zinc-800/40 border border-zinc-700/60' : 'bg-zinc-100 border border-zinc-200')
                          )}
                        >
                          {day.day !== null && (
                            <>
                              <span className={cn('text-[10px] font-medium', tc.textMuted)}>{day.day}</span>
                              {day.trades.length > 0 ? (
                                <p className={cn('text-[10px] font-bold font-mono tabular-nums truncate leading-tight', day.pnl > 0 ? 'text-emerald-400' : day.pnl < 0 ? 'text-rose-400' : tc.textSecondary)}>
                                  {formatCurrencyCompact(day.pnl, privacyMode)}
                                </p>
                              ) : (
                                <span className={cn('text-[10px]', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')}>—</span>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {hasWeekData && (
                      <div className="flex items-center justify-between px-1 text-[10px]">
                        <span className={tc.textMuted}>Week {wi + 1} · {weekTradingDays} day{weekTradingDays !== 1 ? 's' : ''}</span>
                        <span className={cn('font-mono font-semibold tabular-nums', weekPnl > 0 ? 'text-emerald-400' : weekPnl < 0 ? 'text-rose-400' : tc.textSecondary)}>
                          {formatCurrency(weekPnl, privacyMode)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={cn('flex items-center gap-4 mt-4 pt-4 border-t flex-wrap', theme !== 'light' ? 'border-zinc-800/70' : 'border-zinc-200')}>
            <span className={cn('flex items-center gap-1.5 text-xs', tc.textMuted)}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" /> Profit
            </span>
            <span className={cn('flex items-center gap-1.5 text-xs', tc.textMuted)}>
              <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" /> Loss
            </span>
            <span className={cn('flex items-center gap-1.5 text-xs', tc.textMuted)}>
              <span className="w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0" /> No trades
            </span>
          </div>
        </div>
      </div>
    );
}
