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
import { ModalBackdrop } from '../components/shared/ModalBackdrop';
import { formatCurrency, formatDate, formatPriceInput } from '../utils/format';
import { TagSelectDropdown } from '../components/shared/TagSelectDropdown';
import { generateId } from '../utils/id';
import { calculateTradeDurationMinutes, formatTimeDisplay, formatTradeDuration } from '../utils/tradeDuration';
import { TrackingBadge } from '../components/shared/TrackingBadge';
import { getTagColorStyle } from '../constants/tagColors';
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

export function DisciplinePsychologyReviewModal() {
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

    const trade = trades.find(t => t.id === showDisciplineReview);
    if (!trade) return null;
    const account = accounts.find(a => a.id === trade.accountId);

    return (
      <ModalBackdrop
        onClose={() => setShowDisciplineReview(null)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between gap-3 z-20">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-white truncate">Discipline & Psychology Review</h3>
              <p className="text-sm text-zinc-500 truncate">
                {trade.symbol} · {account?.name} · {formatDate(trade.date)}
              </p>
            </div>
            <button onClick={() => setShowDisciplineReview(null)} className="p-2 text-zinc-400 hover:text-white transition-colors flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              {trade.rulesFollowed === 'followed' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Rule Followed
                </span>
              ) : trade.rulesFollowed === 'broken' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  <XCircle className="w-3.5 h-3.5" /> Rule Broken
                </span>
              ) : (
                // rulesFollowed is only ever set from the separate Trade
                // Detail modal, not from this review flow — an imported or
                // otherwise not-yet-categorized trade has neither value, and
                // silently defaulting that to "Rule Broken" here was
                // misleading (it hadn't been judged as broken; it just
                // hadn't been judged at all).
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Not Yet Set
                </span>
              )}
              <span className={cn('font-mono text-sm font-medium', trade.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {formatCurrency(trade.profitLoss, privacyMode)}
              </span>
            </div>

            <div>
              <TagSelectDropdown
                label="Emotions Tracker"
                options={emotionsList}
                selected={disciplineReviewDraft.emotions}
                onChange={(selected) => setDisciplineReviewDraft(prev => ({ ...prev, emotions: selected }))}
                onAddNew={(name) => setEmotionsList(prev => [...prev, { id: generateId(), name, color: 'purple' }])}
                onDeleteOption={handleDeleteEmotion}
                onColorChange={handleChangeEmotionColor}
                placeholder="Select Emotions..."
                colorScheme="rose"
              />
            </div>

            <div>
              <TagSelectDropdown
                label="Mistakes Analysis"
                options={mistakesList}
                selected={disciplineReviewDraft.mistakes}
                onChange={(selected) => setDisciplineReviewDraft(prev => ({ ...prev, mistakes: selected }))}
                onAddNew={(name) => setMistakesList(prev => [...prev, { id: generateId(), name, color: 'red' }])}
                onDeleteOption={handleDeleteMistakeType}
                onColorChange={handleChangeMistakeColor}
                placeholder="Select Mistakes..."
                colorScheme="rose"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-2">Performance Evaluation Summary</label>
              <textarea
                value={disciplineReviewDraft.notes}
                onChange={(e) => setDisciplineReviewDraft(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="What was going through your mind? Any psychological patterns or session observations worth remembering..."
                rows={5}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-600 placeholder-zinc-600 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowDisciplineReview(null)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDisciplineReview}
                className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Review
              </button>
            </div>
          </div>
        </div>
      </ModalBackdrop>
    );
}

export function RuleAdherenceReviewModal() {
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

    const trade = trades.find(t => t.id === showRuleReviewModal);
    if (!trade) return null;
    const account = accounts.find(a => a.id === trade.accountId);

    const execTf = trade.timeframes.find(tf => tf.name === 'Execution/Result');
    const executionImage = execTf?.images?.[0];
    const tradeStartDisplay = formatTimeDisplay(trade.startTime);
    const tradeEndDisplay = formatTimeDisplay(trade.endTime);
    const tradeDurationMinutes = calculateTradeDurationMinutes(trade.startTime, trade.endTime);
    const tradeDurationLabel = formatTradeDuration(tradeDurationMinutes);

    return (
      <ModalBackdrop
        onClose={closeRuleReviewModal}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={closeRuleReviewModal}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-zinc-800/90 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#121318] p-6 rounded-2xl border border-white/10 max-h-[85vh] overflow-y-auto">
            {/* ================= LEFT COLUMN — Trade Preview (static) ================= */}
            <div className="min-w-0 flex flex-col gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  {trade.trackingNumber && <TrackingBadge value={trade.trackingNumber} size="sm" />}
                  <h3 className="text-lg font-bold text-white truncate">{trade.symbol}</h3>
                </div>
                <p className="text-xs text-zinc-500 truncate mt-0.5">
                  {account?.name} · {formatDate(trade.date)}
                  {trade.session && <span> · {trade.session}</span>}
                </p>
              </div>

              <div className="relative bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-800 aspect-video flex items-center justify-center flex-shrink-0">
                {executionImage ? (
                  <img
                    src={executionImage.url}
                    alt="Execution"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setLightboxImage(executionImage.url)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-zinc-600">
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-xs">No chart image</span>
                  </div>
                )}
              </div>

              <div className={cn('w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border flex-shrink-0', trade.profitLoss >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20')}>
                <span className="text-xs text-zinc-400">P&amp;L</span>
                <span className={cn('text-xl font-bold', trade.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {formatCurrency(trade.profitLoss, privacyMode)}
                </span>
              </div>

              {(tradeStartDisplay || tradeEndDisplay) && (
                <div className="flex flex-wrap items-center gap-2 bg-zinc-800/30 border border-zinc-800 rounded-xl px-3 py-2.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Clock className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="text-xs text-zinc-300 whitespace-nowrap">
                      <span className="text-zinc-500">Start</span>{' '}
                      <span className="text-white font-medium">{tradeStartDisplay || '—'}</span>
                      <span className="text-zinc-600 mx-1.5">→</span>
                      <span className="text-zinc-500">End</span>{' '}
                      <span className="text-white font-medium">{tradeEndDisplay || '—'}</span>
                    </span>
                  </div>
                  {tradeDurationLabel && (
                    <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 whitespace-nowrap">
                      {tradeDurationLabel}
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-zinc-800/50 rounded-lg p-2.5 min-w-0">
                  <p className="text-[10px] text-zinc-500 mb-0.5 truncate">Entry</p>
                  <p className="text-xs text-white font-medium truncate">{formatPriceInput(trade.entryPrice)}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-2.5 min-w-0">
                  <p className="text-[10px] text-zinc-500 mb-0.5 truncate">Stop Loss</p>
                  <p className="text-xs text-white font-medium truncate">{formatPriceInput(trade.stopLoss)}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-2.5 min-w-0">
                  <p className="text-[10px] text-zinc-500 mb-0.5 truncate">Take Profit</p>
                  <p className="text-xs text-white font-medium truncate">{formatPriceInput(trade.takeProfit)}</p>
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN — Psychology Review (toggles) ================= */}
            <div className="min-w-0 flex flex-col gap-4 md:border-l md:border-white/10 md:pl-6">
              <div className="flex items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white truncate">Psychology Review</h3>
                </div>
                {!isEditingRuleReview && (
                  <button
                    type="button"
                    onClick={() => setIsEditingRuleReview(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white transition-all text-xs font-medium cursor-pointer flex-shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" strokeWidth={2} /> Edit Review
                  </button>
                )}
              </div>

              {trade.rulesFollowed === 'followed' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium w-fit flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Rule Followed
                </span>
              ) : trade.rulesFollowed === 'broken' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium w-fit flex-shrink-0">
                  <XCircle className="w-3.5 h-3.5" /> Rule Broken
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium w-fit flex-shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" /> Not Yet Set
                </span>
              )}

              {isEditingRuleReview ? (
                <>
                  <div>
                    <TagSelectDropdown
                      label="Emotions Tracker"
                      options={emotionsList}
                      selected={disciplineReviewDraft.emotions}
                      onChange={(selected) => setDisciplineReviewDraft(prev => ({ ...prev, emotions: selected }))}
                      onAddNew={(name) => setEmotionsList(prev => [...prev, { id: generateId(), name, color: 'purple' }])}
                      onDeleteOption={handleDeleteEmotion}
                      onColorChange={handleChangeEmotionColor}
                      placeholder="Select Emotions..."
                      colorScheme="rose"
                    />
                  </div>

                  <div>
                    <TagSelectDropdown
                      label="Mistakes Analysis"
                      options={mistakesList}
                      selected={disciplineReviewDraft.mistakes}
                      onChange={(selected) => setDisciplineReviewDraft(prev => ({ ...prev, mistakes: selected }))}
                      onAddNew={(name) => setMistakesList(prev => [...prev, { id: generateId(), name, color: 'red' }])}
                      onDeleteOption={handleDeleteMistakeType}
                      onColorChange={handleChangeMistakeColor}
                      placeholder="Select Mistakes..."
                      colorScheme="rose"
                    />
                  </div>

                  <div className="flex-1 min-h-0 flex flex-col">
                    <label className="block text-xs text-zinc-400 mb-2">Performance Evaluation Summary</label>
                    <textarea
                      value={disciplineReviewDraft.notes}
                      onChange={(e) => setDisciplineReviewDraft(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="What was going through your mind? Any psychological patterns or session observations worth remembering..."
                      rows={5}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-600 placeholder-zinc-600 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleCancelRuleReviewEdit}
                      className="px-4 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancel Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDisciplineReview}
                      className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Review
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-zinc-400 mb-2">Emotions Tracker</p>
                    {(trade.emotions || []).length === 0 ? (
                      <p className="text-xs text-zinc-600">No emotions logged</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(trade.emotions || []).map(e => (
                          <span key={e} className={cn('px-2.5 py-1 rounded-full text-xs font-medium', getTagColorStyle(colorForEmotion(e)).chip)}>
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400 mb-2">Mistakes Analysis</p>
                    {(trade.mistakes || []).length === 0 ? (
                      <p className="text-xs text-zinc-600">No mistakes logged</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(trade.mistakes || []).map(m => (
                          <span key={m} className={cn('px-2.5 py-1 rounded-full text-xs font-medium', getTagColorStyle(colorForMistake(m)).chip)}>
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-h-0 flex flex-col">
                    <p className="text-xs text-zinc-400 mb-2">Performance Evaluation Summary</p>
                    <div className="flex-1 min-h-[6.5rem] bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm whitespace-pre-wrap">
                      {trade.notes
                        ? <span className="text-zinc-300">{trade.notes}</span>
                        : <span className="text-zinc-600">No performance notes logged yet.</span>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </ModalBackdrop>
    );
}

