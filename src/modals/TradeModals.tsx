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
import { calculateTradeDurationMinutes, formatTimeDisplay, formatTradeDuration } from '../utils/tradeDuration';
import { ModalBackdrop } from '../components/shared/ModalBackdrop';
import { formatCurrency, formatCurrencyAbsolute, formatDate, formatPriceInput } from '../utils/format';
import { getTagColorStyle } from '../constants/tagColors';
import { NumericInput } from '../components/shared/NumericInput';
import { ACCOUNT_TYPES, PRESET_SYMBOLS, SESSION_OPTIONS, TIMEFRAMES, TRADING_ACCOUNT_TYPES } from '../constants/trading';
import { PopupCalculator } from '../components/shared/PopupCalculator';
import { DateInput } from '../components/shared/DateInput';
import { TimeInput } from '../components/shared/TimeInput';
import { calculatePoints } from '../utils/image';
import { TagSelectDropdown } from '../components/shared/TagSelectDropdown';
import { generateId } from '../utils/id';
import { TimeframeChartInput } from '../components/shared/TimeframeChartInput';
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

export function TradeDetailModal() {
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

    const trade = trades.find(t => t.id === showTradeDetail);
    if (!trade) return null;
    const account = accounts.find(a => a.id === trade.accountId);

    const execTf = trade.timeframes.find(tf => tf.name === 'Execution/Result');
    const executionImages = execTf?.images || [];
    const hasMultipleExec = executionImages.length > 1;

    const otherTimeframes = trade.timeframes.filter(tf => tf.name !== 'Execution/Result');
    const tradeRR = trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : null;

    // Read-only duration breakdown for display purposes only — does not touch
    // the core trades array or any save/update handlers.
    const tradeStartDisplay = formatTimeDisplay(trade.startTime);
    const tradeEndDisplay = formatTimeDisplay(trade.endTime);
    const tradeDurationMinutes = calculateTradeDurationMinutes(trade.startTime, trade.endTime);
    const tradeDurationLabel = formatTradeDuration(tradeDurationMinutes);

    return (
      <ModalBackdrop
        onClose={() => { setShowTradeDetail(null); setShowExpandGallery(false); }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-white truncate">{trade.symbol}</h3>
              <p className="text-sm text-zinc-500 truncate">{account?.name} | {formatDate(trade.date)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowExpandGallery(true)}
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
                title="Expand Gallery"
              >
                <Expand className="w-5 h-5" />
              </button>
              <button onClick={() => { setShowTradeDetail(null); openEditTrade(trade); }} className="p-2 text-zinc-400 hover:text-white transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
              <button onClick={() => handleDeleteTrade(trade.id)} className="p-2 text-zinc-400 hover:text-rose-400 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={() => setShowTradeDetail(null)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {executionImages.length > 0 && (
              <div className="relative bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-800">
                <div className="group aspect-video relative">
                  <img
                    src={executionImages[executionImageIndex]?.url}
                    alt="Execution"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setLightboxImage(executionImages[executionImageIndex]?.url)}
                  />
                  {hasMultipleExec && (
                    <>
                      <button
                        onClick={() => setExecutionImageIndex(prev => prev === 0 ? executionImages.length - 1 : prev - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 hover:bg-black/75 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setExecutionImageIndex(prev => prev === executionImages.length - 1 ? 0 : prev + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 hover:bg-black/75 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {executionImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setExecutionImageIndex(idx)}
                            className={cn(
                              'h-1.5 rounded-full transition-all duration-200',
                              idx === executionImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {execTf?.notes && (
                  <div className="p-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Execution Notes</p>
                    <p className="text-sm text-zinc-300">{execTf.notes}</p>
                  </div>
                )}
              </div>
            )}

            <div className={cn('w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl border', trade.profitLoss >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20')}>
              <span className="text-sm text-zinc-400">P&L</span>
              <span className={cn('text-2xl font-bold', trade.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {formatCurrency(trade.profitLoss, privacyMode)}
              </span>
            </div>

            {(tradeStartDisplay || tradeEndDisplay) && (
              <div className="flex flex-wrap items-center gap-3 bg-zinc-800/30 border border-zinc-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <span className="text-sm text-zinc-300 whitespace-nowrap">
                    <span className="text-zinc-500">Start</span>{' '}
                    <span className="text-white font-medium">{tradeStartDisplay || '—'}</span>
                    <span className="text-zinc-600 mx-2">→</span>
                    <span className="text-zinc-500">End</span>{' '}
                    <span className="text-white font-medium">{tradeEndDisplay || '—'}</span>
                  </span>
                </div>
                {tradeDurationLabel && (
                  <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 whitespace-nowrap">
                    Duration: {tradeDurationLabel}
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-800/50 rounded-lg p-3 min-w-0">
                <p className="text-xs text-zinc-500 mb-1 truncate">Symbol</p>
                <p className="text-sm text-white font-medium truncate">{trade.symbol}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 min-w-0">
                <p className="text-xs text-zinc-500 mb-1 truncate">Entry</p>
                <p className="text-sm text-white font-medium truncate">{formatPriceInput(trade.entryPrice)}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 min-w-0">
                <p className="text-xs text-zinc-500 mb-1 truncate">Stop Loss</p>
                <p className="text-sm text-white font-medium truncate">{formatPriceInput(trade.stopLoss)} <span className="text-zinc-500">({trade.slPoints} pts)</span></p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 min-w-0">
                <p className="text-xs text-zinc-500 mb-1 truncate">Take Profit</p>
                <p className="text-sm text-white font-medium truncate">{formatPriceInput(trade.takeProfit)} <span className="text-zinc-500">({trade.tpPoints} pts)</span></p>
              </div>
            </div>

            {(trade.riskAmount > 0 || tradeRR !== null) && (
              <div className="flex flex-wrap gap-3">
                {trade.riskAmount > 0 && (
                  <div className="bg-zinc-800/50 rounded-lg p-3 inline-block">
                    <p className="text-xs text-zinc-500 mb-1">Risk Amount</p>
                    <p className="text-sm text-white font-medium">{formatCurrencyAbsolute(trade.riskAmount)}</p>
                  </div>
                )}
                {tradeRR !== null && (
                  <div className="bg-zinc-800/50 rounded-lg p-3 inline-block">
                    <p className="text-xs text-zinc-500 mb-1">Risk:Reward</p>
                    <p className={cn('text-sm font-medium', tradeRR >= 1 ? 'text-emerald-400' : tradeRR >= 0 ? 'text-white' : 'text-rose-400')}>
                      {tradeRR >= 1 ? '+' : ''}{tradeRR.toFixed(2)}R
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {trade.setupTypes.map(s => {
                const tagColor = setupTypes.find(st => st.name === s)?.color || 'gray';
                return (
                  <span key={s} className={cn('px-3 py-1.5 rounded-lg text-sm truncate max-w-[150px]', getTagColorStyle(tagColor).chip)}>{s}</span>
                );
              })}
              {trade.confluences.map(c => {
                const tagColor = confluences.find(cf => cf.name === c)?.color || 'gray';
                return (
                  <span key={c} className={cn('px-3 py-1.5 rounded-lg text-sm truncate max-w-[150px]', getTagColorStyle(tagColor).chip)}>{c}</span>
                );
              })}
              <button
                type="button"
                onClick={() => setDetailRulesFollowedDraft(prev => prev === 'followed' ? 'broken' : 'followed')}
                className={cn('px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors', detailRulesFollowedDraft === 'followed' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30')}
                title="Click to toggle rule adherence"
              >
                {detailRulesFollowedDraft === 'followed' ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate">Rules {detailRulesFollowedDraft}</span>
              </button>
            </div>

            {trade.mistakes.length > 0 && (
              <div>
                <h4 className="text-sm text-zinc-500 mb-2">Mistakes Made</h4>
                <div className="flex flex-wrap gap-2">
                  {trade.mistakes.map(m => (
                    <span key={m} className={cn('px-3 py-1.5 rounded-lg text-sm truncate max-w-[150px]', getTagColorStyle(colorForMistake(m)).chip)}>{m}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">Post-Trade Performance Notes</h4>
                {detailRulesFollowedDraft !== trade.rulesFollowed && (
                  <button
                    type="button"
                    onClick={handleSaveDetailNotes}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-medium transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-rose-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Mistakes Analysis</span>
                  </h5>
                  <div className="w-full min-h-[6.5rem] bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm whitespace-pre-wrap cursor-default">
                    {trade.mistakesAnalysis
                      ? <span className="text-zinc-300">{trade.mistakesAnalysis}</span>
                      : <span className="text-zinc-600">What went wrong on this trade...</span>}
                  </div>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Lessons Learned</span>
                  </h5>
                  <div className="w-full min-h-[6.5rem] bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm whitespace-pre-wrap cursor-default">
                    {trade.lessonsLearned
                      ? <span className="text-zinc-300">{trade.lessonsLearned}</span>
                      : <span className="text-zinc-600">What to take away from this trade...</span>}
                  </div>
                </div>
              </div>
            </div>

            {otherTimeframes.filter(tf => tf.images.length > 0 || tf.notes).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Timeframe Charts</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {otherTimeframes.filter(tf => tf.images.length > 0 || tf.notes).map(tf => {
                    const tfKey = `${trade.id}-${tf.name}`;
                    const tfIndex = timeframeImageIndices[tfKey] || 0;
                    const hasMultipleTfImages = tf.images.length > 1;
                    const activeImg = tf.images[tfIndex] || tf.images[0];
                    return (
                      <div
                        key={tf.name}
                        className="bg-zinc-800/50 rounded-lg overflow-hidden border border-zinc-800"
                      >
                        {activeImg && (
                          <div className="group relative aspect-video">
                            <img
                              src={activeImg.url}
                              alt={tf.name}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                              onClick={() => setLightboxImage(activeImg.url)}
                            />
                            {hasMultipleTfImages && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTimeframeImageIndices(prev => ({ ...prev, [tfKey]: tfIndex === 0 ? tf.images.length - 1 : tfIndex - 1 }));
                                  }}
                                  className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/75 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTimeframeImageIndices(prev => ({ ...prev, [tfKey]: tfIndex === tf.images.length - 1 ? 0 : tfIndex + 1 }));
                                  }}
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/75 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                                  {tf.images.map((_, idx) => (
                                    <span
                                      key={idx}
                                      className={cn(
                                        'h-1 rounded-full transition-all duration-200',
                                        idx === tfIndex ? 'w-3 bg-white' : 'w-1 bg-white/40'
                                      )}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-xs font-medium text-zinc-300 mb-1">{tf.name}</p>
                          {tf.notes && (
                            <p className="text-xs text-zinc-500 line-clamp-2">{tf.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalBackdrop>
    );
}

export function ExpandGalleryModal() {
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

    const trade = trades.find(t => t.id === showTradeDetail);
    if (!trade || !showExpandGallery) return null;

    const allImages = trade.timeframes.flatMap(tf => tf.images.map(img => ({ ...img, timeframe: tf.name })));
    const count = allImages.length;

    const gridCols =
      count <= 4 ? 'grid-cols-1 sm:grid-cols-2' :
      count <= 6 ? 'grid-cols-2 sm:grid-cols-3' :
      count <= 9 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' :
      'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5';

    return (
      <ModalBackdrop
        onClose={() => setShowExpandGallery(false)}
        className="fixed inset-0 bg-black/95 z-[60] flex flex-col p-4 md:p-8"
      >
        <button onClick={() => setShowExpandGallery(false)} className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 z-10">
          <X className="w-6 h-6" />
        </button>

        {count === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-500">No images to display</p>
          </div>
        )}

        {count === 1 && (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="relative group cursor-pointer max-w-full max-h-full" onClick={(e) => { e.stopPropagation(); setLightboxImage(allImages[0].url); }}>
              <img src={allImages[0].url} alt={allImages[0].timeframe} className="max-w-full max-h-[85vh] object-contain rounded-xl bg-zinc-900" />
              <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 rounded-lg text-xs text-white">{allImages[0].timeframe}</span>
            </div>
          </div>
        )}

        {count === 2 && (
          <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-4 place-items-center">
            {allImages.map(img => (
              <div key={img.id} className="relative group cursor-pointer max-w-full max-h-full" onClick={(e) => { e.stopPropagation(); setLightboxImage(img.url); }}>
                <img src={img.url} alt={img.timeframe} className="max-w-full max-h-[80vh] object-contain rounded-xl bg-zinc-900" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 rounded-lg text-xs text-white">{img.timeframe}</span>
              </div>
            ))}
          </div>
        )}

        {count > 2 && (
          <div className="flex-1 min-h-0 overflow-y-auto flex items-center">
            <div className={cn('grid gap-3 w-full', gridCols)}>
              {allImages.map(img => (
                <div key={img.id} className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); setLightboxImage(img.url); }}>
                  <img src={img.url} alt={img.timeframe} className="w-full aspect-video object-cover rounded-lg bg-zinc-800" />
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">{img.timeframe}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalBackdrop>
    );
}

export function AccountModal() {
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
    handleAddAccount, handleUpdateAccount, handleRecordPayoutReset, handleDeleteAccount, confirmDeleteAccount, handleImportTradesFile,
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

    const isEditing = showEditAccount !== null;
    const currentAccount = isEditing ? editingAccount : newAccount;
    const isFundedCycleAccount = isEditing &&
      (currentAccount.tradingAccountType === 'CFD' || currentAccount.tradingAccountType === 'FUTURES') &&
      currentAccount.type === 'Funded';

    return (
      (showAddAccount || showEditAccount !== null) && (
        <ModalBackdrop
          onClose={() => {
            isEditing ? setShowEditAccount(null) : setShowAddAccount(false);
            resetCalculator();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-20">
              <h3 className="text-xl font-bold text-white truncate">{isEditing ? 'Edit Account' : 'Add Trading Account'}</h3>
              <button onClick={() => { isEditing ? setShowEditAccount(null) : setShowAddAccount(false); resetCalculator(); }} className="p-2 text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              {/* ================= SECTION 1: Account Details ================= */}
              <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">01</span>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Account Details</h4>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Account Name</label>
                  <input
                    type="text"
                    value={currentAccount.name || ''}
                    onChange={(e) => isEditing ? setEditingAccount(prev => ({ ...prev, name: e.target.value })) : setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Funded Account"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Starting Balance</label>
                  <NumericInput
                    value={formatPriceInput(currentAccount.startingBalance || 0)}
                    onChange={(sanitized, numericValue) => {
                      if (isEditing) {
                        setEditingAccount(prev => ({ ...prev, startingBalance: numericValue, highestBalance: numericValue }));
                      } else {
                        setNewAccount(prev => ({ ...prev, startingBalance: numericValue, highestBalance: numericValue }));
                      }
                    }}
                    onFocus={(e) => handleNumberInputFocus(e, isEditing ? 'editaccount-startingBalance' : 'account-startingBalance', formatPriceInput(currentAccount.startingBalance || 0), false)}
                    placeholder="10,000"
                    allowNegative={false}
                  />
                </div>
              </div>

              {/* ================= SECTION 2: Type & Firm ================= */}
              <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">02</span>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Type &amp; Firm</h4>
                </div>
                <div className={cn('grid gap-3', currentAccount.tradingAccountType === 'LIVE' ? 'grid-cols-1' : 'grid-cols-2')}>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Type</label>
                    <div className="relative" ref={tradingAccountTypeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowTradingAccountTypeDropdown(!showTradingAccountTypeDropdown)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 flex items-center justify-between"
                      >
                        <span className="truncate flex items-center gap-2">
                          {renderTradingAccountTypeBadge({ tradingAccountType: currentAccount.tradingAccountType || 'LIVE' } as Account)}
                        </span>
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      </button>
                      {showTradingAccountTypeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10">
                          {TRADING_ACCOUNT_TYPES.map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                if (isEditing) {
                                  setEditingAccount(prev => ({ ...prev, tradingAccountType: type }));
                                } else {
                                  setNewAccount(prev => ({ ...prev, tradingAccountType: type }));
                                }
                                setShowTradingAccountTypeDropdown(false);
                              }}
                              className={cn(
                                'w-full text-left px-3 py-2.5 text-sm hover:bg-zinc-700 transition-colors flex items-center gap-2',
                                currentAccount.tradingAccountType === type ? 'text-white bg-zinc-700' : 'text-zinc-400'
                              )}
                            >
                              {renderTradingAccountTypeBadge({ tradingAccountType: type } as Account)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {currentAccount.tradingAccountType !== 'LIVE' && (
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5">Status</label>
                      <div className="relative" ref={accountTypeDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setShowAccountTypeDropdown(!showAccountTypeDropdown)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 flex items-center justify-between"
                        >
                          <span className="truncate">
                            {currentAccount.type === 'Custom Challenge' ? (currentAccount.customTypeName || 'Custom Challenge') : currentAccount.type}
                          </span>
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        </button>
                        {showAccountTypeDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                            {ACCOUNT_TYPES.map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  if (isEditing) {
                                    setEditingAccount(prev => ({ ...prev, type }));
                                  } else {
                                    setNewAccount(prev => ({ ...prev, type }));
                                  }
                                  if (type !== 'Custom Challenge') {
                                    setShowAccountTypeDropdown(false);
                                  }
                                }}
                                className={cn(
                                  'w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors',
                                  currentAccount.type === type ? 'text-white bg-zinc-700' : 'text-zinc-400'
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {currentAccount.type === 'Custom Challenge' && (
                        <input
                          type="text"
                          value={currentAccount.customTypeName || ''}
                          onChange={(e) => isEditing ? setEditingAccount(prev => ({ ...prev, customTypeName: e.target.value })) : setNewAccount(prev => ({ ...prev, customTypeName: e.target.value }))}
                          placeholder="Custom type name"
                          className="w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-600"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Prop Firm Name</label>
                  <input
                    type="text"
                    value={currentAccount.propFirm || ''}
                    onChange={(e) => isEditing ? setEditingAccount(prev => ({ ...prev, propFirm: e.target.value })) : setNewAccount(prev => ({ ...prev, propFirm: e.target.value }))}
                    placeholder="FTMO, FundedNext, etc."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>

                {currentAccount.tradingAccountType !== 'LIVE' && (
                  <div className="border-t border-zinc-700 pt-3">
                    {currentAccount.tradingAccountType === 'CFD' ? (
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5">Minimum Balance Threshold ($)</label>
                        <NumericInput
                          value={formatPriceInput(currentAccount.fixedMinBalance || 0)}
                          onChange={(sanitized, numericValue) => {
                            if (isEditing) {
                              setEditingAccount(prev => ({ ...prev, fixedMinBalance: numericValue }));
                            } else {
                              setNewAccount(prev => ({ ...prev, fixedMinBalance: numericValue }));
                            }
                          }}
                          onFocus={(e) => handleNumberInputFocus(e, isEditing ? 'editaccount-fixedMinBalance' : 'account-fixedMinBalance', formatPriceInput(currentAccount.fixedMinBalance || 0), false)}
                          placeholder="4,500"
                          allowNegative={false}
                        />
                      </div>
                    ) : currentAccount.tradingAccountType === 'FUTURES' && (
                      <div className={cn('grid gap-3', currentAccount.type === 'Funded' ? 'grid-cols-2' : 'grid-cols-1')}>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1.5">Max Trailing Drawdown ($)</label>
                          <NumericInput
                            value={formatPriceInput(currentAccount.maxDrawdownAllowance || 0)}
                            onChange={(sanitized, numericValue) => {
                              if (isEditing) {
                                setEditingAccount(prev => ({ ...prev, maxDrawdownAllowance: numericValue }));
                              } else {
                                setNewAccount(prev => ({ ...prev, maxDrawdownAllowance: numericValue }));
                              }
                            }}
                            onFocus={(e) => handleNumberInputFocus(e, isEditing ? 'editaccount-maxDrawdownAllowance' : 'account-maxDrawdownAllowance', formatPriceInput(currentAccount.maxDrawdownAllowance || 0), false)}
                            placeholder="2,000"
                            allowNegative={false}
                          />
                        </div>
                        {currentAccount.type === 'Funded' && (
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1.5">Threshold Lock Amount ($)</label>
                            <NumericInput
                              value={formatPriceInput(currentAccount.thresholdLockAmount ?? currentAccount.startingBalance ?? 0)}
                              onChange={(sanitized, numericValue) => {
                                if (isEditing) {
                                  setEditingAccount(prev => ({ ...prev, thresholdLockAmount: numericValue }));
                                } else {
                                  setNewAccount(prev => ({ ...prev, thresholdLockAmount: numericValue }));
                                }
                              }}
                              onFocus={(e) => handleNumberInputFocus(e, isEditing ? 'editaccount-thresholdLockAmount' : 'account-thresholdLockAmount', formatPriceInput(currentAccount.thresholdLockAmount ?? currentAccount.startingBalance ?? 0), false)}
                              placeholder="50,000"
                              allowNegative={false}
                            />
                            <p className="text-xs text-zinc-500 mt-1.5">
                              The trailing stop rises with peak equity until it clears this level, then locks here for good. Defaults to your starting balance (breakeven lock) if left as-is.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ================= SECTION 3: Goals & Cycle ================= */}
              <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">03</span>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Goals &amp; Cycle</h4>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        setEditingAccount(prev => ({ ...prev, hasProfitTarget: !prev.hasProfitTarget }));
                      } else {
                        setNewAccount(prev => ({ ...prev, hasProfitTarget: !prev.hasProfitTarget }));
                      }
                    }}
                    className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    {currentAccount.hasProfitTarget ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-zinc-500" />
                    )}
                    <span>Set Profit Target Goal</span>
                  </button>

                  {currentAccount.hasProfitTarget && (
                    <div className="mt-3">
                      <label className="block text-xs text-zinc-400 mb-1.5">Profit Target Amount ($)</label>
                      <NumericInput
                        value={formatPriceInput(currentAccount.profitTarget || 0)}
                        onChange={(sanitized, numericValue) => {
                          if (isEditing) {
                            setEditingAccount(prev => ({ ...prev, profitTarget: numericValue }));
                          } else {
                            setNewAccount(prev => ({ ...prev, profitTarget: numericValue }));
                          }
                        }}
                        onFocus={(e) => handleNumberInputFocus(e, isEditing ? 'editaccount-profitTarget' : 'account-profitTarget', formatPriceInput(currentAccount.profitTarget || 0), false)}
                        placeholder="5,000"
                        allowNegative={false}
                      />
                    </div>
                  )}
                </div>

                {isFundedCycleAccount && (
                  <div className="border-t border-zinc-700 pt-3">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div>
                        <p className="text-sm text-zinc-300">Payout / Reset Cycle</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {(currentAccount.payoutResetsCount || 0) > 0
                            ? `${currentAccount.payoutResetsCount} payout${currentAccount.payoutResetsCount === 1 ? '' : 's'} recorded`
                            : 'No payouts recorded yet'}
                        </p>
                      </div>
                      <DollarSign className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editingAccount.id) return;
                        const confirmed = window.confirm(
                          'Record a payout and reset this account\'s balance back to its starting balance? Your trade history stays intact for lifetime analytics — only the live P&L / progress metrics reset.'
                        );
                        if (confirmed) handleRecordPayoutReset(editingAccount.id);
                      }}
                      className="w-full mt-2 py-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Record Payout / Reset Cycle
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => { isEditing ? setShowEditAccount(null) : setShowAddAccount(false); resetCalculator(); }}
                  className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={isEditing ? handleUpdateAccount : handleAddAccount}
                  className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Update Account' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>

          {calculatorState.show && (
            <PopupCalculator
              value={calculatorState.value}
              onChange={handleCalculatorChange}
              onClose={closeCalculator}
              onEnter={handleCalculatorEnter}
              initialPosition={calculatorState.position}
              allowNegative={calculatorState.allowNegative}
              theme={theme}
            />
          )}
        </ModalBackdrop>
      )
    );
}

export function AddTradeModal() {
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

  return (
    showAddTrade && (
      <ModalBackdrop
        onClose={() => { setShowAddTrade(false); resetCalculator(); }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-20">
            <h3 className="text-xl font-bold text-white truncate">Add New Trade</h3>
            <button onClick={() => { setShowAddTrade(false); resetCalculator(); }} className="p-2 text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="p-6 space-y-4">
            {/* ================= SECTION 1: Trade Execution & Metrics ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">01</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Trade Execution &amp; Metrics</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Account</label>
                  <select
                    value={newTrade.accountId || ''}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, accountId: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <DateInput
                    value={newTrade.date || getTodayLocalDate()}
                    onChange={(value) => setNewTrade(prev => ({ ...prev, date: value }))}
                    label="Date"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTradeTimeFields(v => !v)}
                    className="mt-1.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {showTradeTimeFields ? 'Hide start / end time' : 'Add start / end time'}
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showTradeTimeFields && 'rotate-180')} />
                  </button>
                </div>
              </div>

              {showTradeTimeFields && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TimeInput
                    value={newTrade.startTime || ''}
                    onChange={(value) => setNewTrade(prev => ({ ...prev, startTime: value }))}
                    label="Start Time"
                  />
                  <TimeInput
                    value={newTrade.endTime || ''}
                    onChange={(value) => setNewTrade(prev => ({ ...prev, endTime: value }))}
                    label="End Time"
                  />
                </div>
              )}

              {/* Row 2: Symbol + Session + Trade # - sit side-by-side */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Symbol</label>
                  <div className="relative" ref={symbolDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowSymbolDropdown(!showSymbolDropdown)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 flex items-center justify-between"
                    >
                      <span className={cn(newTrade.symbol ? 'text-white' : 'text-zinc-500')}>
                        {newTrade.symbol || 'Select...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </button>
                    {showSymbolDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-30 max-h-40 overflow-y-auto">
                        {PRESET_SYMBOLS.map(sym => (
                          <button
                            type="button"
                            key={sym.value}
                            onClick={() => { setNewTrade(prev => ({ ...prev, symbol: sym.value })); setShowSymbolDropdown(false); }}
                            className={cn('w-full text-left px-3 py-2 text-sm hover:bg-zinc-700', newTrade.symbol === sym.value ? 'text-white bg-zinc-700' : 'text-zinc-400')}
                          >
                            {sym.name}
                          </button>
                        ))}
                        {customSymbols.length > 0 && (
                          <>
                            <div className="border-t border-zinc-700 my-1" />
                            {customSymbols.map(sym => (
                              <button type="button" key={sym} onClick={() => { setNewTrade(prev => ({ ...prev, symbol: sym })); setShowSymbolDropdown(false); }}
                                className={cn('w-full text-left px-3 py-2 text-sm hover:bg-zinc-700', newTrade.symbol === sym ? 'text-white bg-zinc-700' : 'text-zinc-400')}>
                                {sym}
                              </button>
                            ))}
                          </>
                        )}
                        <div className="border-t border-zinc-700 p-2">
                          <input type="text" value={symbolCustomInput} onChange={(e) => setSymbolCustomInput(e.target.value.toUpperCase())}
                            placeholder="Add custom..."
                            className="w-full bg-[#242631] border border-zinc-600 rounded px-2 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && symbolCustomInput.trim()) {
                                setNewTrade(prev => ({ ...prev, symbol: symbolCustomInput.trim() }));
                                if (!customSymbols.includes(symbolCustomInput.trim())) setCustomSymbols(prev => [...prev, symbolCustomInput.trim()]);
                                setSymbolCustomInput('');
                                setShowSymbolDropdown(false);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Session</label>
                  <div className="relative" ref={sessionDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 flex items-center justify-between"
                    >
                      <span className={cn(newTrade.session ? 'text-white' : 'text-zinc-500')}>
                        {newTrade.session || 'Select...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </button>
                    {showSessionDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-30 max-h-40 overflow-y-auto">
                        {SESSION_OPTIONS.map(opt => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => { setNewTrade(prev => ({ ...prev, session: opt })); setShowSessionDropdown(false); }}
                            className={cn('w-full text-left px-3 py-2 text-sm hover:bg-zinc-700', newTrade.session === opt ? 'text-white bg-zinc-700' : 'text-zinc-400')}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Trade #</label>
                  <NumericInput
                    value={newTrade.trackingNumber || ''}
                    onChange={(sanitized) => setNewTrade(prev => ({ ...prev, trackingNumber: sanitized }))}
                    onFocus={(e) => handleNumberInputFocus(e, 'trade-trackingNumber', newTrade.trackingNumber || '', false)}
                    placeholder="e.g. 14, 15, 18"
                    allowNegative={false}
                    className="focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Row 2: P&L + Risk + R:R Ratio - STRICT numeric inputs, RR always visible */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">P&L ($)</label>
                  <NumericInput
                    value={priceInputs.profitLoss}
                    onChange={(sanitized, numericValue) => {
                      setPriceInputs(prev => ({ ...prev, profitLoss: sanitized }));
                      setNewTrade(prev => ({ ...prev, profitLoss: numericValue }));
                    }}
                    onFocus={(e) => handleNumberInputFocus(e, 'trade-profitLoss', priceInputs.profitLoss, true)}
                    placeholder="0"
                    allowNegative={true}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Risk ($)</label>
                  <NumericInput
                    value={priceInputs.riskAmount}
                    onChange={(sanitized, numericValue) => {
                      setPriceInputs(prev => ({ ...prev, riskAmount: sanitized }));
                      setNewTrade(prev => ({ ...prev, riskAmount: numericValue }));
                    }}
                    onFocus={(e) => handleNumberInputFocus(e, 'trade-riskAmount', priceInputs.riskAmount, false)}
                    onBlur={() => setPriceInputs(prev => ({ ...prev, riskAmount: formatPriceInput(newTrade.riskAmount || 0) }))}
                    placeholder="0"
                    allowNegative={false}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">R:R Ratio</label>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm">
                    {calculatedRR !== null ? (
                      <span className={cn('font-medium', calculatedRR >= 1 ? 'text-emerald-400' : calculatedRR >= 0 ? 'text-zinc-400' : 'text-rose-400')}>
                        {calculatedRR.toFixed(2)}R
                      </span>
                    ) : (
                      <span className="text-zinc-500">--</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTradePriceLevels(v => !v)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                {showTradePriceLevels ? 'Hide entry / stop loss / take profit' : 'Add entry / stop loss / take profit'}
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showTradePriceLevels && 'rotate-180')} />
              </button>

              {showTradePriceLevels && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Entry</label>
                    <NumericInput
                      value={priceInputs.entryPrice}
                      onChange={(sanitized, numericValue) => {
                        setPriceInputs(prev => ({ ...prev, entryPrice: sanitized }));
                        setNewTrade(prev => ({
                          ...prev,
                          entryPrice: numericValue,
                          slPoints: calculatePoints(prev.symbol || '', numericValue, prev.stopLoss || 0),
                          tpPoints: calculatePoints(prev.symbol || '', numericValue, prev.takeProfit || 0),
                        }));
                      }}
                      onFocus={(e) => handleNumberInputFocus(e, 'trade-entryPrice', priceInputs.entryPrice, false)}
                      onBlur={() => setPriceInputs(prev => ({ ...prev, entryPrice: formatPriceInput(newTrade.entryPrice || 0) }))}
                      placeholder="0"
                      allowNegative={false}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Stop Loss</label>
                    <NumericInput
                      value={priceInputs.stopLoss}
                      onChange={(sanitized, numericValue) => {
                        setPriceInputs(prev => ({ ...prev, stopLoss: sanitized }));
                        setNewTrade(prev => ({ ...prev, stopLoss: numericValue, slPoints: calculatePoints(prev.symbol || '', prev.entryPrice || 0, numericValue) }));
                      }}
                      onFocus={(e) => handleNumberInputFocus(e, 'trade-stopLoss', priceInputs.stopLoss, false)}
                      onBlur={() => setPriceInputs(prev => ({ ...prev, stopLoss: formatPriceInput(newTrade.stopLoss || 0) }))}
                      placeholder="0"
                      allowNegative={false}
                    />
                    {newTrade.slPoints !== undefined && newTrade.slPoints > 0 && <p className="text-[10px] text-zinc-500 mt-0.5">{newTrade.slPoints} pts</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Take Profit</label>
                    <NumericInput
                      value={priceInputs.takeProfit}
                      onChange={(sanitized, numericValue) => {
                        setPriceInputs(prev => ({ ...prev, takeProfit: sanitized }));
                        setNewTrade(prev => ({ ...prev, takeProfit: numericValue, tpPoints: calculatePoints(prev.symbol || '', prev.entryPrice || 0, numericValue) }));
                      }}
                      onFocus={(e) => handleNumberInputFocus(e, 'trade-takeProfit', priceInputs.takeProfit, false)}
                      onBlur={() => setPriceInputs(prev => ({ ...prev, takeProfit: formatPriceInput(newTrade.takeProfit || 0) }))}
                      placeholder="0"
                      allowNegative={false}
                    />
                    {newTrade.tpPoints !== undefined && newTrade.tpPoints > 0 && <p className="text-[10px] text-zinc-500 mt-0.5">{newTrade.tpPoints} pts</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ================= HIGHLIGHTED BANNER: Rules Adherence ================= */}
            <div className={cn(
              'bg-[#161822] border-2 p-4 rounded-xl text-center space-y-3 transition-all',
              newTrade.rulesFollowed === 'followed'
                ? 'bg-emerald-950/30 border-emerald-500/60'
                : newTrade.rulesFollowed === 'broken'
                  ? 'bg-rose-950/30 border-rose-500/60'
                  : 'border-slate-700/80'
            )}>
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-slate-200" />
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200">Rules Adherence</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewTrade(prev => ({ ...prev, rulesFollowed: prev.rulesFollowed === 'followed' ? undefined : 'followed' }))}
                  className={cn('w-full flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg text-sm font-medium border transition-colors',
                    newTrade.rulesFollowed === 'followed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/80 hover:bg-zinc-800 hover:border-zinc-600')}
                >
                  <Check className="w-3.5 h-3.5" /> Followed
                </button>
                <button
                  type="button"
                  onClick={() => { setNewTrade(prev => ({ ...prev, rulesFollowed: prev.rulesFollowed === 'broken' ? undefined : 'broken' })); }}
                  className={cn('w-full flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg text-sm font-medium border transition-colors',
                    newTrade.rulesFollowed === 'broken'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/80 hover:bg-zinc-800 hover:border-zinc-600')}
                >
                  <X className="w-3.5 h-3.5" /> Broken
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">Optional — leave unselected if not yet reviewed</p>
            </div>

            {/* ================= SECTION 2: Strategy & Tagging ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">02</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Strategy &amp; Tagging</h4>
              </div>
              {/* Tag groups: Setup Types + Confluences side by side, Mistakes Made full width below */}
              <div className="grid grid-cols-2 gap-4">
                <TagSelectDropdown
                  label="Setup Types"
                  options={setupTypes}
                  selected={newTrade.setupTypes || []}
                  onChange={(selected) => setNewTrade(prev => ({ ...prev, setupTypes: selected }))}
                  onAddNew={(name) => setSetupTypes(prev => [...prev, { id: generateId(), name, color: 'gray' }])}
                  onDeleteOption={handleDeleteSetupType}
                  onColorChange={handleChangeSetupTypeColor}
                  placeholder="Select Setup Types..."
                  colorScheme="emerald"
                />
                <TagSelectDropdown
                  label="Confluences"
                  options={confluences}
                  selected={newTrade.confluences || []}
                  onChange={(selected) => setNewTrade(prev => ({ ...prev, confluences: selected }))}
                  onAddNew={(name) => setConfluences(prev => [...prev, { id: generateId(), name, color: 'gray' }])}
                  onDeleteOption={handleDeleteConfluence}
                  onColorChange={handleChangeConfluenceColor}
                  placeholder="Select Confluences..."
                  colorScheme="emerald"
                />
              </div>

              <TagSelectDropdown
                label="Mistakes Made"
                options={mistakesList}
                selected={newTrade.mistakes || []}
                onChange={(selected) => setNewTrade(prev => ({ ...prev, mistakes: selected }))}
                onAddNew={(name) => setMistakesList(prev => [...prev, { id: generateId(), name, color: 'red' }])}
                onDeleteOption={handleDeleteMistakeType}
                onColorChange={handleChangeMistakeColor}
                placeholder="Select Mistakes Made..."
                colorScheme="rose"
              />
            </div>

            {/* ================= SECTION 3: Chart Screenshots ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">03</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Chart Screenshots</h4>
              </div>
              <p className="text-xs text-zinc-500">Attach images for each timeframe</p>
              <div className="grid grid-cols-2 gap-3">
                {TIMEFRAMES.map(tf => {
                  const tfData = (newTrade.timeframes || []).find(t => t.name === tf) || { name: tf, images: [], notes: '' };
                  return (
                    <TimeframeChartInput
                      key={tf}
                      timeframe={tf}
                      images={tfData.images || []}
                      notes={tfData.notes || ''}
                      onAddImage={(url) => handleAddImageUrl(url, tf)}
                      onUploadImage={(file) => handleFileUpload(file, tf)}
                      onRemoveImage={(imageId) => handleRemoveImage(tf, imageId)}
                      onReorderImages={(fromIndex, toIndex) => handleReorderImages(tf, fromIndex, toIndex)}
                      onPreviewImage={(url) => setLightboxImage(url)}
                      onNotesChange={(notes) => updateTimeframeNotes(tf, notes)}
                      isExecution={tf === 'Execution/Result'}
                    />
                  );
                })}
              </div>
            </div>

            {/* ================= SECTION 4: Post-Trade Reflection ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">04</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Post-Trade Reflection</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Mistakes Analysis</label>
                  <textarea
                    value={newTrade.mistakesAnalysis || ''}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, mistakesAnalysis: e.target.value }))}
                    placeholder="What went wrong?"
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 placeholder-zinc-600 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Lessons Learned</label>
                  <textarea
                    value={newTrade.lessonsLearned || ''}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                    placeholder="What did you learn?"
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 placeholder-zinc-600 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => { setShowAddTrade(false); resetCalculator(); }}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTrade}
                className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Trade
              </button>
            </div>
          </form>

          {calculatorState.show && (
            <PopupCalculator
              value={calculatorState.value}
              onChange={handleCalculatorChange}
              onClose={closeCalculator}
              onEnter={handleCalculatorEnter}
              initialPosition={calculatorState.position}
              allowNegative={calculatorState.allowNegative}
              theme={theme}
            />
          )}
        </div>
      </ModalBackdrop>
    )
  );
}

export function EditTradeModal() {
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

  return (
    showEditTrade && editingTrade && (
      <ModalBackdrop
        onClose={() => { setShowEditTrade(false); setEditingTrade(null); resetTradeForm(); resetCalculator(); }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-20">
            <h3 className="text-xl font-bold text-white truncate">Edit Trade</h3>
            <button onClick={() => { setShowEditTrade(false); setEditingTrade(null); resetTradeForm(); resetCalculator(); }} className="p-2 text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="p-6 space-y-4">
            {/* ================= SECTION 1: Trade Execution & Metrics ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">01</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Trade Execution &amp; Metrics</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Account</label>
                  <select
                    value={newTrade.accountId || ''}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, accountId: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <DateInput
                    value={newTrade.date || getTodayLocalDate()}
                    onChange={(value) => setNewTrade(prev => ({ ...prev, date: value }))}
                    label="Date"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTradeTimeFields(v => !v)}
                    className="mt-1.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {showTradeTimeFields ? 'Hide start / end time' : 'Add start / end time'}
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showTradeTimeFields && 'rotate-180')} />
                  </button>
                </div>
              </div>

              {showTradeTimeFields && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TimeInput
                    value={newTrade.startTime || ''}
                    onChange={(value) => setNewTrade(prev => ({ ...prev, startTime: value }))}
                    label="Start Time"
                  />
                  <TimeInput
                    value={newTrade.endTime || ''}
                    onChange={(value) => setNewTrade(prev => ({ ...prev, endTime: value }))}
                    label="End Time"
                  />
                </div>
              )}

              {/* Row 2: Symbol + Session + Trade # - sit side-by-side */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Symbol</label>
                  <div className="relative" ref={symbolDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowSymbolDropdown(!showSymbolDropdown)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 flex items-center justify-between"
                    >
                      <span className={cn(newTrade.symbol ? 'text-white' : 'text-zinc-500')}>
                        {newTrade.symbol || 'Select...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </button>
                    {showSymbolDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-30 max-h-40 overflow-y-auto">
                        {PRESET_SYMBOLS.map(sym => (
                          <button
                            type="button"
                            key={sym.value}
                            onClick={() => { setNewTrade(prev => ({ ...prev, symbol: sym.value })); setShowSymbolDropdown(false); }}
                            className={cn('w-full text-left px-3 py-2 text-sm hover:bg-zinc-700', newTrade.symbol === sym.value ? 'text-white bg-zinc-700' : 'text-zinc-400')}
                          >
                            {sym.name}
                          </button>
                        ))}
                        {customSymbols.length > 0 && (
                          <>
                            <div className="border-t border-zinc-700 my-1" />
                            {customSymbols.map(sym => (
                              <button type="button" key={sym} onClick={() => { setNewTrade(prev => ({ ...prev, symbol: sym })); setShowSymbolDropdown(false); }}
                                className={cn('w-full text-left px-3 py-2 text-sm hover:bg-zinc-700', newTrade.symbol === sym ? 'text-white bg-zinc-700' : 'text-zinc-400')}>
                                {sym}
                              </button>
                            ))}
                          </>
                        )}
                        <div className="border-t border-zinc-700 p-2">
                          <input type="text" value={symbolCustomInput} onChange={(e) => setSymbolCustomInput(e.target.value.toUpperCase())}
                            placeholder="Add custom..."
                            className="w-full bg-[#242631] border border-zinc-600 rounded px-2 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && symbolCustomInput.trim()) {
                                setNewTrade(prev => ({ ...prev, symbol: symbolCustomInput.trim() }));
                                if (!customSymbols.includes(symbolCustomInput.trim())) setCustomSymbols(prev => [...prev, symbolCustomInput.trim()]);
                                setSymbolCustomInput('');
                                setShowSymbolDropdown(false);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Session</label>
                  <div className="relative" ref={sessionDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 flex items-center justify-between"
                    >
                      <span className={cn(newTrade.session ? 'text-white' : 'text-zinc-500')}>
                        {newTrade.session || 'Select...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </button>
                    {showSessionDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-30 max-h-40 overflow-y-auto">
                        {SESSION_OPTIONS.map(opt => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => { setNewTrade(prev => ({ ...prev, session: opt })); setShowSessionDropdown(false); }}
                            className={cn('w-full text-left px-3 py-2 text-sm hover:bg-zinc-700', newTrade.session === opt ? 'text-white bg-zinc-700' : 'text-zinc-400')}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Trade #</label>
                  <NumericInput
                    value={newTrade.trackingNumber || ''}
                    onChange={(sanitized) => setNewTrade(prev => ({ ...prev, trackingNumber: sanitized }))}
                    onFocus={(e) => handleNumberInputFocus(e, 'trade-trackingNumber', newTrade.trackingNumber || '', false)}
                    placeholder="e.g. 14, 15, 18"
                    allowNegative={false}
                    className="focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Row 2: P&L + Risk + R:R Ratio - STRICT numeric inputs, RR always visible */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">P&L ($)</label>
                  <NumericInput
                    value={priceInputs.profitLoss}
                    onChange={(sanitized, numericValue) => {
                      setPriceInputs(prev => ({ ...prev, profitLoss: sanitized }));
                      setNewTrade(prev => ({ ...prev, profitLoss: numericValue }));
                    }}
                    onFocus={(e) => handleNumberInputFocus(e, 'trade-profitLoss', priceInputs.profitLoss, true)}
                    placeholder="0"
                    allowNegative={true}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Risk ($)</label>
                  <NumericInput
                    value={priceInputs.riskAmount}
                    onChange={(sanitized, numericValue) => {
                      setPriceInputs(prev => ({ ...prev, riskAmount: sanitized }));
                      setNewTrade(prev => ({ ...prev, riskAmount: numericValue }));
                    }}
                    onFocus={(e) => handleNumberInputFocus(e, 'trade-riskAmount', priceInputs.riskAmount, false)}
                    onBlur={() => setPriceInputs(prev => ({ ...prev, riskAmount: formatPriceInput(newTrade.riskAmount || 0) }))}
                    placeholder="0"
                    allowNegative={false}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">R:R Ratio</label>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm">
                    {calculatedRR !== null ? (
                      <span className={cn('font-medium', calculatedRR >= 1 ? 'text-emerald-400' : calculatedRR >= 0 ? 'text-zinc-400' : 'text-rose-400')}>
                        {calculatedRR.toFixed(2)}R
                      </span>
                    ) : (
                      <span className="text-zinc-500">--</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTradePriceLevels(v => !v)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                {showTradePriceLevels ? 'Hide entry / stop loss / take profit' : 'Add entry / stop loss / take profit'}
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showTradePriceLevels && 'rotate-180')} />
              </button>

              {showTradePriceLevels && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Entry</label>
                    <NumericInput
                      value={priceInputs.entryPrice}
                      onChange={(sanitized, numericValue) => {
                        setPriceInputs(prev => ({ ...prev, entryPrice: sanitized }));
                        setNewTrade(prev => ({
                          ...prev,
                          entryPrice: numericValue,
                          slPoints: calculatePoints(prev.symbol || '', numericValue, prev.stopLoss || 0),
                          tpPoints: calculatePoints(prev.symbol || '', numericValue, prev.takeProfit || 0),
                        }));
                      }}
                      onFocus={(e) => handleNumberInputFocus(e, 'trade-entryPrice', priceInputs.entryPrice, false)}
                      onBlur={() => setPriceInputs(prev => ({ ...prev, entryPrice: formatPriceInput(newTrade.entryPrice || 0) }))}
                      placeholder="0"
                      allowNegative={false}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Stop Loss</label>
                    <NumericInput
                      value={priceInputs.stopLoss}
                      onChange={(sanitized, numericValue) => {
                        setPriceInputs(prev => ({ ...prev, stopLoss: sanitized }));
                        setNewTrade(prev => ({ ...prev, stopLoss: numericValue, slPoints: calculatePoints(prev.symbol || '', prev.entryPrice || 0, numericValue) }));
                      }}
                      onFocus={(e) => handleNumberInputFocus(e, 'trade-stopLoss', priceInputs.stopLoss, false)}
                      onBlur={() => setPriceInputs(prev => ({ ...prev, stopLoss: formatPriceInput(newTrade.stopLoss || 0) }))}
                      placeholder="0"
                      allowNegative={false}
                    />
                    {newTrade.slPoints !== undefined && newTrade.slPoints > 0 && <p className="text-[10px] text-zinc-500 mt-0.5">{newTrade.slPoints} pts</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Take Profit</label>
                    <NumericInput
                      value={priceInputs.takeProfit}
                      onChange={(sanitized, numericValue) => {
                        setPriceInputs(prev => ({ ...prev, takeProfit: sanitized }));
                        setNewTrade(prev => ({ ...prev, takeProfit: numericValue, tpPoints: calculatePoints(prev.symbol || '', prev.entryPrice || 0, numericValue) }));
                      }}
                      onFocus={(e) => handleNumberInputFocus(e, 'trade-takeProfit', priceInputs.takeProfit, false)}
                      onBlur={() => setPriceInputs(prev => ({ ...prev, takeProfit: formatPriceInput(newTrade.takeProfit || 0) }))}
                      placeholder="0"
                      allowNegative={false}
                    />
                    {newTrade.tpPoints !== undefined && newTrade.tpPoints > 0 && <p className="text-[10px] text-zinc-500 mt-0.5">{newTrade.tpPoints} pts</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ================= HIGHLIGHTED BANNER: Rules Adherence ================= */}
            <div className={cn(
              'bg-[#161822] border-2 p-4 rounded-xl text-center space-y-3 transition-all',
              newTrade.rulesFollowed === 'followed'
                ? 'bg-emerald-950/30 border-emerald-500/60'
                : newTrade.rulesFollowed === 'broken'
                  ? 'bg-rose-950/30 border-rose-500/60'
                  : 'border-slate-700/80'
            )}>
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-slate-200" />
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200">Rules Adherence</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewTrade(prev => ({ ...prev, rulesFollowed: prev.rulesFollowed === 'followed' ? undefined : 'followed' }))}
                  className={cn('w-full flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg text-sm font-medium border transition-colors',
                    newTrade.rulesFollowed === 'followed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/80 hover:bg-zinc-800 hover:border-zinc-600')}
                >
                  <Check className="w-3.5 h-3.5" /> Followed
                </button>
                <button
                  type="button"
                  onClick={() => { setNewTrade(prev => ({ ...prev, rulesFollowed: prev.rulesFollowed === 'broken' ? undefined : 'broken' })); }}
                  className={cn('w-full flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg text-sm font-medium border transition-colors',
                    newTrade.rulesFollowed === 'broken'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/80 hover:bg-zinc-800 hover:border-zinc-600')}
                >
                  <X className="w-3.5 h-3.5" /> Broken
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">Optional — leave unselected if not yet reviewed</p>
            </div>

            {/* ================= SECTION 2: Strategy & Tagging ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">02</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Strategy &amp; Tagging</h4>
              </div>
              {/* Tag groups: Setup Types + Confluences side by side, Mistakes Made full width below */}
              <div className="grid grid-cols-2 gap-4">
                <TagSelectDropdown
                  label="Setup Types"
                  options={setupTypes}
                  selected={newTrade.setupTypes || []}
                  onChange={(selected) => setNewTrade(prev => ({ ...prev, setupTypes: selected }))}
                  onAddNew={(name) => setSetupTypes(prev => [...prev, { id: generateId(), name, color: 'gray' }])}
                  onDeleteOption={handleDeleteSetupType}
                  onColorChange={handleChangeSetupTypeColor}
                  placeholder="Select Setup Types..."
                  colorScheme="emerald"
                />
                <TagSelectDropdown
                  label="Confluences"
                  options={confluences}
                  selected={newTrade.confluences || []}
                  onChange={(selected) => setNewTrade(prev => ({ ...prev, confluences: selected }))}
                  onAddNew={(name) => setConfluences(prev => [...prev, { id: generateId(), name, color: 'gray' }])}
                  onDeleteOption={handleDeleteConfluence}
                  onColorChange={handleChangeConfluenceColor}
                  placeholder="Select Confluences..."
                  colorScheme="emerald"
                />
              </div>

              <TagSelectDropdown
                label="Mistakes Made"
                options={mistakesList}
                selected={newTrade.mistakes || []}
                onChange={(selected) => setNewTrade(prev => ({ ...prev, mistakes: selected }))}
                onAddNew={(name) => setMistakesList(prev => [...prev, { id: generateId(), name, color: 'red' }])}
                onDeleteOption={handleDeleteMistakeType}
                onColorChange={handleChangeMistakeColor}
                placeholder="Select Mistakes Made..."
                colorScheme="rose"
              />
            </div>

            {/* ================= SECTION 3: Chart Screenshots ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">03</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Chart Screenshots</h4>
              </div>
              <p className="text-xs text-zinc-500">Attach images for each timeframe</p>
              <div className="grid grid-cols-2 gap-3">
                {TIMEFRAMES.map(tf => {
                  const tfData = (newTrade.timeframes || []).find(t => t.name === tf) || { name: tf, images: [], notes: '' };
                  return (
                    <TimeframeChartInput
                      key={tf}
                      timeframe={tf}
                      images={tfData.images || []}
                      notes={tfData.notes || ''}
                      onAddImage={(url) => handleAddImageUrl(url, tf)}
                      onUploadImage={(file) => handleFileUpload(file, tf)}
                      onRemoveImage={(imageId) => handleRemoveImage(tf, imageId)}
                      onReorderImages={(fromIndex, toIndex) => handleReorderImages(tf, fromIndex, toIndex)}
                      onPreviewImage={(url) => setLightboxImage(url)}
                      onNotesChange={(notes) => updateTimeframeNotes(tf, notes)}
                      isExecution={tf === 'Execution/Result'}
                    />
                  );
                })}
              </div>
            </div>

            {/* ================= SECTION 4: Post-Trade Reflection ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">04</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Post-Trade Reflection</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Mistakes Analysis</label>
                  <textarea
                    value={newTrade.mistakesAnalysis || ''}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, mistakesAnalysis: e.target.value }))}
                    placeholder="What went wrong?"
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 placeholder-zinc-600 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Lessons Learned</label>
                  <textarea
                    value={newTrade.lessonsLearned || ''}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                    placeholder="What did you learn?"
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 placeholder-zinc-600 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => { setShowEditTrade(false); setEditingTrade(null); resetTradeForm(); resetCalculator(); }}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedTrade}
                className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>

          {calculatorState.show && (
            <PopupCalculator
              value={calculatorState.value}
              onChange={handleCalculatorChange}
              onClose={closeCalculator}
              onEnter={handleCalculatorEnter}
              initialPosition={calculatorState.position}
              allowNegative={calculatorState.allowNegative}
              theme={theme}
            />
          )}
        </div>
      </ModalBackdrop>
    )
  );
}

export function DeleteTradeConfirm() {
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

    const isBulk = showDeleteSelectedConfirm;
    const isSingle = !isBulk && !!tradePendingDelete;
    if (!isBulk && !isSingle) return null;

    const count = isBulk ? selectedTradeIds.length : 1;
    const title = count > 1 ? `Delete ${count} Trades` : 'Delete Trade';
    const body = 'Are you sure you want to delete this trade history entry? This action cannot be undone.';
    const bulkBody = 'Are you sure you want to delete these trade history entries? This action cannot be undone.';

    const handleCancel = () => {
      setShowDeleteSelectedConfirm(false);
      setTradePendingDelete(null);
    };

    const handleConfirm = () => {
      if (isBulk) {
        confirmDeleteSelectedTrades();
      } else {
        confirmDeleteTrade();
      }
    };

    return (
      <ModalBackdrop
        onClose={handleCancel}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      >
        <div className="bg-[#121318] border border-white/10 rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            {count > 1 ? bulkBody : body}
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </ModalBackdrop>
    );
}

export function DeleteAccountConfirm() {
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

    if (!accountPendingDelete) return null;
    const account = accounts.find(a => a.id === accountPendingDelete);
    const tradeCount = trades.filter(t => t.accountId === accountPendingDelete).length;
    return (
      <ModalBackdrop
        onClose={() => setAccountPendingDelete(null)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete "{account?.name || 'this account'}"?</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            This permanently deletes the account{tradeCount > 0 ? ` and all ${tradeCount} trade${tradeCount > 1 ? 's' : ''} logged under it` : ''}. This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setAccountPendingDelete(null)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteAccount}
              className="px-4 py-2 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </ModalBackdrop>
    );
}

export function LightboxModal() {
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

  return (
    lightboxImage && (
      <ModalBackdrop
        onClose={() => setLightboxImage(null)}
        className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
      >
        <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full text-white hover:bg-zinc-700">
          <X className="w-6 h-6" />
        </button>
        <img src={lightboxImage} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
      </ModalBackdrop>
    )
  );
}

