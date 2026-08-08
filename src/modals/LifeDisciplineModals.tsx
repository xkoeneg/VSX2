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
import { CHALLENGE_PRESETS, DURATION_PRESET_OPTIONS, ROUTINE_EMOJI_OPTIONS, ROUTINE_ICON_COLORS, ROUTINE_ICON_COLOR_CLASS, ROUTINE_ICON_OPTIONS, WEEKDAY_CHECKBOX_ORDER, WEEKDAY_FULL_NAME, WEEKLY_CATEGORY_ID, getLocalDateKey, getWeekdayForDateKey, renderCategoryIcon } from '../constants/lifeDiscipline';
import { ModalBackdrop } from '../components/shared/ModalBackdrop';
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

export function DayDetailsModal() {
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

    if (!dayDetailsModal) return null;
    const { dateKey, day } = dayDetailsModal;
    const todayKeyForModal = getLocalDateKey();
    const isFuture = dateKey > todayKeyForModal;
    const isToday = dateKey === todayKeyForModal;
    const complete = isLifeDisciplineDayComplete(dateKey);
    const graced = !!lifeDisciplineGraceDays[dateKey];
    let status: 'upcoming' | 'complete' | 'failed' | 'pending' | 'grace';
    if (isFuture) status = 'upcoming';
    else if (complete) status = 'complete';
    else if (isToday) status = 'pending';
    else if (graced) status = 'grace';
    else status = 'failed';

    const dayChecks = lifeDisciplineChecks[dateKey] || emptyLifeDisciplineChecks(challengeConfig);
    const currentReason = status === 'grace' ? lifeDisciplineRecheckNotes[dateKey] : lifeDisciplineMissedReasons[dateKey];
    const showReasonSection = status === 'failed' || status === 'grace';
    const showRecheckAction = status === 'failed' && lifeDisciplineTokensRemaining > 0 && !isEditingDayReason;
    const showUndoAction = status === 'grace' && !isEditingDayReason;
    const showChecklistSaveAction = status === 'failed' && isEditingDayChecklist && !isEditingDayReason;

    // Weekly Specifics for this day — Specific-Days items scheduled for
    // this date's weekday. Kept out of the Checklist Summary's per-category
    // lists (same split as the live dashboard) and surfaced in their own
    // section instead, so a category that's entirely Specific-Days items
    // doesn't clutter this day's summary with irrelevant entries.
    const weeklyRoutinesEnabledForModal = !!challengeConfig.weeklyRoutinesEnabled;
    const dayWeekday = getWeekdayForDateKey(dateKey);
    const isWeeklySpecificItem = (item: RoutineItem) =>
      weeklyRoutinesEnabledForModal && item.frequency === 'specific' && !!item.days && item.days.length > 0;
    // STRICT DATA SEPARATION (mirrors the live dashboard): daily categories
    // are matched by excluding the fixed Weekly category id, and the Weekly
    // Specifics section is sourced ONLY from that same fixed category — not
    // by scanning every category for stray frequency/day flags.
    const dailyOnlyGroupsForModal = challengeConfig.categories
      .map((cat, gI) => ({ cat, gI }))
      .filter(({ cat }) => cat.id !== WEEKLY_CATEGORY_ID);
    const weeklyGroupEntryForModal = challengeConfig.categories
      .map((cat, gI) => ({ cat, gI }))
      .find(({ cat }) => cat.id === WEEKLY_CATEGORY_ID);
    const weeklyItemsForDay: { gI: number; item: RoutineItem; iI: number }[] = [];
    if (weeklyRoutinesEnabledForModal && weeklyGroupEntryForModal) {
      const { cat, gI } = weeklyGroupEntryForModal;
      cat.items.forEach((item, iI) => {
        if (isWeeklySpecificItem(item) && item.days!.includes(dayWeekday)) {
          weeklyItemsForDay.push({ gI, item, iI });
        }
      });
    }

    const badge: Record<typeof status, { label: string; className: string }> = {
      complete: { label: 'Complete', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
      failed: { label: 'Failed', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
      grace: { label: 'Re-checked', className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
      pending: { label: 'In Progress — Today', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
      upcoming: { label: 'Upcoming', className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
    };
    const statusBadge = badge[status];

    return (
      <ModalBackdrop
        onClose={() => setDayDetailsModal(null)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <div
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-zinc-800 flex-shrink-0">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white truncate">Day {day} Overview</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{formatDate(dateKey)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap', statusBadge.className)}>
                {statusBadge.label}
              </span>
              <button
                onClick={() => setDayDetailsModal(null)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 overflow-y-auto space-y-5">
            {/* Checklist Summary — read-only for Complete/Re-checked days;
                interactively editable (with the honesty guardrail) on
                Failed days so a genuine mis-check from the night before
                can be corrected. */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Checklist Summary</h3>
                {status === 'failed' && (
                  isEditingDayChecklist ? (
                    <span className="text-[10px] text-cyan-300 italic">Tap an item to correct it</span>
                  ) : (
                    <button
                      onClick={startEditDayChecklist}
                      className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  )
                )}
              </div>
              {challengeConfig.categories.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No routine categories configured.</p>
              ) : dailyOnlyGroupsForModal.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">All routines live in the Weekly card — see Weekly Specifics below.</p>
              ) : (
                <div className="space-y-3">
                  {dailyOnlyGroupsForModal.map(({ cat, gI }) => {
                    // Weekly Specifics items live in their own section
                    // below — a category that's 100% weekly items has
                    // nothing left to show here, so skip the whole block
                    // rather than rendering an empty placeholder under
                    // whatever name it happens to have. A genuinely empty
                    // category (no items at all yet) still renders below.
                    const dailyItemCount = cat.items.filter(item => !isWeeklySpecificItem(item)).length;
                    if (cat.items.length > 0 && dailyItemCount === 0) return null;
                    return (
                    <div key={cat.id}>
                      <div className="flex items-center gap-2 mb-1.5">
                        {renderCategoryIcon(cat, 'w-3.5 h-3.5', 'text-zinc-400')}
                        <span className="text-xs font-medium text-zinc-300 truncate">{cat.label}</span>
                      </div>
                      <div className="space-y-1.5">
                        {cat.items.length === 0 ? (
                          <p className="text-xs text-zinc-600 italic pl-5">No items in this category.</p>
                        ) : (() => {
                          const itemsForDate = cat.items
                            .map((item, iI) => ({ item, iI }))
                            .filter(({ item }) => !isWeeklySpecificItem(item));
                          return itemsForDate.map(({ item, iI }) => {
                            // RE-CHECKED days render every item as completed —
                            // the token was spent to redeem the whole day, so
                            // the checklist reflects that regardless of the
                            // raw underlying values.
                            const checked = status === 'grace' ? true : !!dayChecks[gI]?.[iI];
                            const interactive = status === 'failed' && isEditingDayChecklist;
                            const itemContent = (
                              <>
                                {checked ? (
                                  <span className="flex-shrink-0 text-emerald-400 bg-emerald-500/10 p-1 rounded-md border border-emerald-500/20">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                ) : (
                                  <span className="flex-shrink-0 text-red-400 bg-red-500/10 p-1 rounded-md border border-red-500/20">
                                    <X className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                <span className={cn('text-xs', checked ? 'text-zinc-300' : 'text-zinc-500')}>
                                  {item.text}
                                </span>
                              </>
                            );
                            const containerClass = cn(
                              'flex items-center gap-2.5 bg-zinc-800/50 border border-zinc-800 p-2.5 rounded-lg transition-all',
                              interactive && 'w-full text-left cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/80 active:scale-[0.99]'
                            );
                            return interactive ? (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleDayDetailsFailedItem(dateKey, gI, iI)}
                                className={containerClass}
                              >
                                {itemContent}
                              </button>
                            ) : (
                              <div key={item.id} className={containerClass}>
                                {itemContent}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
              {/* Honesty guardrail nudge — shown when the user tries to
                  check off the very last remaining X on a Failed day. */}
              {status === 'failed' && dayDetailsHonestyGuardrail && (
                <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2.5">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-cyan-200 leading-relaxed">
                    {lifeDisciplineTokensRemaining > 0
                      ? 'All items completed? Spend 1 Re-Check Token below to mark this day as saved.'
                      : "All items completed? You're out of Re-Check Tokens, so this item has to stay unchecked to keep the day honestly Failed."}
                  </p>
                </div>
              )}
            </div>

            {/* Weekly Specifics — Specific-Days items scheduled for this
                day's weekday, pulled out of the per-category lists above,
                mirroring the "{Day} Specifics" section on the live dashboard. */}
            {weeklyRoutinesEnabledForModal && weeklyItemsForDay.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2.5">
                  {WEEKDAY_FULL_NAME[dayWeekday]} Specifics
                </h3>
                <div className="space-y-1.5">
                  {weeklyItemsForDay.map(({ gI, item, iI }) => {
                    const checked = status === 'grace' ? true : !!dayChecks[gI]?.[iI];
                    const interactive = status === 'failed' && isEditingDayChecklist;
                    const itemContent = (
                      <>
                        {checked ? (
                          <span className="flex-shrink-0 text-emerald-400 bg-emerald-500/10 p-1 rounded-md border border-emerald-500/20">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-red-400 bg-red-500/10 p-1 rounded-md border border-red-500/20">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className={cn('text-xs', checked ? 'text-zinc-300' : 'text-zinc-500')}>
                          {item.text}
                        </span>
                        <span className="ml-auto flex-shrink-0 text-[9px] font-semibold text-cyan-300/80 bg-cyan-500/10 border border-cyan-500/20 rounded px-1.5 py-0.5">
                          📅 {item.days!.join('/')}
                        </span>
                      </>
                    );
                    const containerClass = cn(
                      'flex items-center gap-2.5 bg-zinc-800/50 border border-zinc-800 p-2.5 rounded-lg transition-all',
                      interactive && 'w-full text-left cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/80 active:scale-[0.99]'
                    );
                    return interactive ? (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleDayDetailsFailedItem(dateKey, gI, iI)}
                        className={containerClass}
                      >
                        {itemContent}
                      </button>
                    ) : (
                      <div key={item.id} className={containerClass}>
                        {itemContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reason / Journal Note — Failed or Re-checked days only */}
            {showReasonSection && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Reason / Journal Note</h3>
                  {!isEditingDayReason && (
                    <button
                      onClick={() => startEditDayReason(dateKey, status)}
                      className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit Reason
                    </button>
                  )}
                </div>
                {isEditingDayReason ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      value={dayReasonDraftText}
                      onChange={(e) => setDayReasonDraftText(e.target.value)}
                      placeholder={status === 'failed' ? 'What got in the way today?' : 'Optional note about this re-check...'}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setIsEditingDayReason(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveDayDetailsReason(dateKey, status)}
                        disabled={status === 'failed' && !dayReasonDraftText.trim()}
                        className={cn(
                          'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                          (status === 'failed' && !dayReasonDraftText.trim())
                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                            : 'bg-cyan-500 text-black hover:bg-cyan-400'
                        )}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : currentReason ? (
                  <p className="text-sm text-zinc-300 bg-zinc-800/50 border border-zinc-800 rounded-xl p-3.5 whitespace-pre-wrap">
                    {currentReason}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500 italic">
                    {status === 'failed' ? 'No reason logged yet.' : 'No note added yet.'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer — Checklist Save (when editing) + Re-Check Token action (Failed days) */}
          {(showRecheckAction || showChecklistSaveAction) && (
            <div className="px-5 py-4 border-t border-zinc-800 flex-shrink-0">
              {isRecheckTokenPromptOpen ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-zinc-500">Optional reason for this re-check:</p>
                  <textarea
                    autoFocus
                    value={recheckTokenReasonDraft}
                    onChange={(e) => setRecheckTokenReasonDraft(e.target.value)}
                    placeholder="e.g. caught up later that day, one-off exception..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsRecheckTokenPromptOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => confirmUseRecheckToken(dateKey)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-500 text-black hover:bg-cyan-400 transition-all"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {showChecklistSaveAction && (
                    <button
                      onClick={saveDayChecklistEdits}
                      className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-all whitespace-nowrap"
                    >
                      Save
                    </button>
                  )}
                  {showRecheckAction && (
                    <button
                      onClick={openRecheckTokenPrompt}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-cyan-500 text-black hover:bg-cyan-400 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Use 1 Re-Check Token (Remaining: {lifeDisciplineTokensRemaining})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer — Undo Re-Check (Re-checked days) */}
          {showUndoAction && (
            <div className="px-5 py-4 border-t border-zinc-800 flex-shrink-0">
              <button
                onClick={() => undoRecheckDay(dateKey)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 transition-all"
              >
                Undo Re-Check (Refund Token)
              </button>
            </div>
          )}

          {/* Plain Close footer — shown whenever no status-specific action above is present */}
          {!showRecheckAction && !showUndoAction && !showChecklistSaveAction && (
            <div className="flex items-center justify-end gap-2 border-t border-zinc-800 px-5 py-3 flex-shrink-0">
              <button
                onClick={() => setDayDetailsModal(null)}
                className="px-3 py-1.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </ModalBackdrop>
    );
}

export function ChallengeConfigModal() {
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

    // STRICT DOUBLE-CONFIRMATION GUARD — "Start Challenge" (configure mode
    // only) always overwrites Day 1 and wipes any in-progress run, so if
    // one is already active we never let the click through directly.
    // Instead we surface a Step 1 warning + Step 2 typing gate ("RESET",
    // case-sensitive) and only call saveChallengeConfig() once the user
    // has explicitly typed it. Local state (not context) since this is a
    // transient, modal-scoped confirmation that should reset every time
    // it's dismissed or confirmed. Declared above the early return below
    // so hook order stays stable across renders (Rules of Hooks).
    const [isStartChallengeResetConfirmOpen, setIsStartChallengeResetConfirmOpen] = useState(false);
    const [startChallengeResetTypedText, setStartChallengeResetTypedText] = useState('');
    const isStartChallengeResetConfirmed = startChallengeResetTypedText === 'RESET';

    if (!isChallengeConfigOpen) return null;

    const handleStartChallengeClick = () => {
      // hasActiveChallengeProgress mirrors "hasActiveChallenge / currentDay
      // > 0" — there's an in-progress run whose streak/timeline would be
      // wiped by starting fresh. Only then do we intercept with the guard;
      // otherwise Start Challenge behaves exactly as before (immediate).
      if (hasActiveChallengeProgress) {
        setStartChallengeResetTypedText('');
        setIsStartChallengeResetConfirmOpen(true);
        return;
      }
      saveChallengeConfig();
    };

    const closeStartChallengeResetConfirm = () => {
      setIsStartChallengeResetConfirmOpen(false);
      setStartChallengeResetTypedText('');
    };

    const confirmStartChallengeReset = () => {
      if (!isStartChallengeResetConfirmed) return;
      saveChallengeConfig();
      closeStartChallengeResetConfirm();
    };

    // Regular "+ Add Category / Group" cards are strictly 100% Everyday
    // Daily Routines — the reserved Weekly Card lives outside this list and
    // is rendered separately, on its own row, below.
    const draftGroups = challengeConfigDraft.categories.filter(cat => cat.id !== WEEKLY_CATEGORY_ID);
    const weeklyDraftGroup = challengeConfigDraft.categories.find(cat => cat.id === WEEKLY_CATEGORY_ID);
    const weeklyDraftItems = weeklyDraftGroup?.items || [];
    // Once a challenge is active, Duration, Re-check Token Allowance, and
    // Load Preset are hidden for good — they're only ever set when a
    // challenge is first configured.
    const fieldsLocked = challengeModalMode === 'edit';
    const modalTitle = challengeModalMode === 'edit' ? 'Edit Challenge' : 'Configure Challenge';
    const matchingUserPreset = findMatchingUserPreset();

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
        {/* Centering wrapper lives *inside* the scrollable backdrop (rather
            than the backdrop itself being a fixed-height flex centerer) so
            that if the modal's own content is taller than the viewport —
            or an inner `max-h`/flex calculation comes out wrong in a given
            preview/embed context — the whole page can still scroll to
            reach the rest of the modal instead of clipping it. This inner
            wrapper is also the actual "click outside to close" surface —
            ModalBackdrop only closes on a mousedown+mouseup pair that both
            land on it directly (not a modal-body descendant) and bails if
            there's an active text selection, so highlighting/dragging text
            inside the modal and releasing over the backdrop never closes it. */}
        <ModalBackdrop
          onClose={() => setIsChallengeConfigOpen(false)}
          className="min-h-full flex items-center justify-center p-4"
        >
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                {challengeModalMode === 'edit' ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Settings className="w-4 h-4 text-amber-400" />}
              </div>
              <h2 className="text-base font-semibold text-white">{modalTitle}</h2>
            </div>
            <button
              onClick={() => setIsChallengeConfigOpen(false)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* PRESET SELECTOR BAR — compact toolbar replacing the old static
              preset cards. Load Preset opens a dropdown listing both the
              built-in templates and any user-saved presets; Save Current as
              Preset stores the live draft fields as a new reusable preset;
              Manage opens a small modal for deleting saved presets. */}
          <div className={cn('flex items-center gap-2 px-6 py-3 border-b border-zinc-800 flex-shrink-0', fieldsLocked ? 'justify-end' : 'justify-between')}>
            {!fieldsLocked && (
            <div className="relative" ref={loadPresetMenuRef}>
              <button
                onClick={() => setIsLoadPresetMenuOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/60 border border-zinc-700 text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 transition-all"
              >
                <span>📁 Load Preset</span>
                <ChevronDown className={cn('w-3.5 h-3.5 text-zinc-500 transition-transform', isLoadPresetMenuOpen && 'rotate-180')} />
              </button>
              {isLoadPresetMenuOpen && (
                <div className="absolute z-10 left-0 mt-1.5 w-64 max-h-80 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-1.5">
                  <p className="px-2 pt-1 pb-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Built-in Templates</p>
                  {CHALLENGE_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => applyChallengePreset(preset)}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 transition-all"
                    >
                      <p className="text-sm text-white truncate">{preset.name}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{preset.durationDays} days · {preset.recheckTokens} tokens</p>
                    </button>
                  ))}
                  <div className="my-1.5 border-t border-zinc-800" />
                  <p className="px-2 pt-1 pb-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Your Presets</p>
                  {userChallengePresets.length === 0 ? (
                    <p className="px-2.5 py-2 text-xs text-zinc-600 italic">No saved presets yet.</p>
                  ) : (
                    userChallengePresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyChallengePreset(preset)}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 transition-all"
                      >
                        <p className="text-sm text-white truncate">{preset.name}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{preset.durationDays} days · {preset.recheckTokens} tokens</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            )}

            <div className="flex items-center gap-1.5">
              {isSavingPresetDraft ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    type="text"
                    value={savePresetNameDraft}
                    onChange={(e) => setSavePresetNameDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveDraftAsPreset(); if (e.key === 'Escape') { setIsSavingPresetDraft(false); setSavePresetNameDraft(''); } }}
                    placeholder="Preset name..."
                    className="w-36 px-2.5 py-1.5 rounded-lg bg-zinc-800/60 border border-amber-500/50 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                  <button
                    onClick={saveDraftAsPreset}
                    className="p-1.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-all"
                    aria-label="Confirm save preset"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setIsSavingPresetDraft(false); setSavePresetNameDraft(''); }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                    aria-label="Cancel save preset"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative" ref={presetSaveChoiceRef}>
                  <button
                    onClick={handleSaveCurrentAsPresetClick}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/60 border border-zinc-700 text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 transition-all"
                  >
                    + Save Current as Preset
                  </button>
                  {isPresetSaveChoiceOpen && matchingUserPreset && (
                    <div className="absolute z-10 right-0 mt-1.5 w-64 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-1.5">
                      <button
                        onClick={() => overwriteExistingUserPreset(matchingUserPreset)}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 transition-all"
                      >
                        <p className="text-sm text-white">Overwrite existing preset</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5 truncate">"{matchingUserPreset.name}"</p>
                      </button>
                      <div className="my-1 border-t border-zinc-800" />
                      <button
                        onClick={chooseSaveAsNewPreset}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 transition-all"
                      >
                        <p className="text-sm text-white">Save as new preset</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Keep "{matchingUserPreset.name}" untouched</p>
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!fieldsLocked && (
                <button
                  onClick={() => { setIsLoadPresetMenuOpen(false); setIsManagePresetsOpen(true); }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                  aria-label="Manage saved presets"
                  title="Manage/Delete Presets"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1 min-h-0">
            {/* CHALLENGE IDENTITY — Title + Motto grouped together since
                these two fields are exactly what populates the "ACTIVE
                CHALLENGE" banner on the Life Discipline Hub page. */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 flex-shrink-0" />
                Challenge Identity
              </p>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Challenge Title</label>
                <input
                  type="text"
                  value={challengeConfigDraft.title}
                  onChange={(e) => setChallengeConfigDraft(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Monk Mode, 100-Day Trading Focus"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                  Identity / Vision Motto <span className="text-zinc-600 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={challengeConfigDraft.motto}
                  onChange={(e) => setChallengeConfigDraft(prev => ({ ...prev, motto: e.target.value }))}
                  placeholder="e.g. Discipline is the bridge between goals and results."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            {/* Duration and Token Allowance are only ever shown for a
                brand-new challenge — once a challenge is active, these
                sections are removed from the DOM entirely and can no
                longer be changed. */}
            {!fieldsLocked && (
              <>
                {/* DURATION */}
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Duration</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {DURATION_PRESET_OPTIONS.map(days => (
                      <button
                        key={days}
                        onClick={() => {
                          setIsCustomDuration(false);
                          setChallengeConfigDraft(prev => ({ ...prev, durationDays: days }));
                        }}
                        className={cn(
                          'px-3.5 py-2 rounded-lg text-sm font-medium border transition-all',
                          !isCustomDuration && challengeConfigDraft.durationDays === days
                            ? 'bg-amber-500 border-amber-400 text-black'
                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                        )}
                      >
                        {days} Days
                      </button>
                    ))}
                    <button
                      onClick={() => setIsCustomDuration(true)}
                      className={cn(
                        'px-3.5 py-2 rounded-lg text-sm font-medium border transition-all',
                        isCustomDuration
                          ? 'bg-amber-500 border-amber-400 text-black'
                          : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                      )}
                    >
                      Custom
                    </button>
                    {isCustomDuration && (
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={challengeConfigDraft.durationDays}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setChallengeConfigDraft(prev => ({ ...prev, durationDays: Number.isFinite(val) ? val : prev.durationDays }));
                        }}
                        className="w-24 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    )}
                    {isCustomDuration && <span className="text-xs text-zinc-500">days (1–365)</span>}
                  </div>
                </div>

                {/* RE-CHECK TOKENS */}
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                    Re-check Token Allowance
                  </label>
                  <p className="text-xs text-zinc-500 mb-2">Max number of grace re-checks allowed for missed days.</p>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={challengeConfigDraft.recheckTokens}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setChallengeConfigDraft(prev => ({ ...prev, recheckTokens: Number.isFinite(val) ? val : prev.recheckTokens }));
                    }}
                    className="w-24 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </>
            )}

            {/* WEEKLY / DAY-SPECIFIC ROUTINES TOGGLE */}
            <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-zinc-800/50 border border-zinc-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">Enable Weekly / Day-Specific Routines</p>
                  <p className="text-xs text-zinc-500 truncate">Schedule items to specific days (e.g. Shampoo every Thursday)</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!!challengeConfigDraft.weeklyRoutinesEnabled}
                onClick={toggleWeeklyRoutinesEnabled}
                className={cn(
                  'relative flex-shrink-0 w-10 h-6 rounded-full transition-colors',
                  challengeConfigDraft.weeklyRoutinesEnabled ? 'bg-cyan-500' : 'bg-zinc-700'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  challengeConfigDraft.weeklyRoutinesEnabled && 'translate-x-4'
                )} />
              </button>
            </div>

            {/* ROUTINE MANAGER */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Custom Routine Manager</label>
                <button
                  onClick={addDraftCategory}
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/60 border border-zinc-700 text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Category / Group
                </button>
              </div>
              {draftGroups.length === 0 && (
                <p className="text-xs text-zinc-600 italic px-1">
                  No routine categories added yet. Click "+ Add Category / Group" to start.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {draftGroups.map(group => {
                  return (
                    <div key={group.id} className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-3.5">
                      <div className="flex items-center gap-1.5 mb-3 pb-2.5 border-b border-zinc-800/60">
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            ref={(el) => { iconPickerTriggerRefs.current[group.id] = el; }}
                            onClick={() => toggleIconPicker(group.id, group.iconKind)}
                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-zinc-700/70 border border-transparent hover:border-zinc-700 transition-colors flex-shrink-0"
                            aria-label="Choose category icon or emoji"
                            title="Choose icon or emoji"
                          >
                            {renderCategoryIcon(group, 'w-4 h-4')}
                          </button>
                          {iconPickerOpenFor === group.id && iconPickerPos && (
                            <div
                              ref={iconPickerPopoverRef}
                              style={{ position: 'fixed', top: iconPickerPos.top, bottom: iconPickerPos.bottom, left: iconPickerPos.left }}
                              className="z-50 w-72 max-h-[320px] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1 mb-3 p-0.5 rounded-lg bg-zinc-800/60">
                                <button
                                  type="button"
                                  onClick={() => setIconPickerTab('emoji')}
                                  className={cn(
                                    'flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                                    iconPickerTab === 'emoji' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                                  )}
                                >
                                  Emoji
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIconPickerTab('icon')}
                                  className={cn(
                                    'flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                                    iconPickerTab === 'icon' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                                  )}
                                >
                                  Icons
                                </button>
                              </div>
                              {iconPickerTab === 'emoji' ? (
                                <div className="grid grid-cols-8 gap-1 max-h-[210px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pr-0.5">
                                  {ROUTINE_EMOJI_OPTIONS.map(emoji => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => { setDraftCategoryIcon(group.id, 'emoji', emoji); setIconPickerOpenFor(null); setIconPickerPos(null); }}
                                      className={cn(
                                        'w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-800 text-base transition-colors',
                                        group.iconKind === 'emoji' && group.iconValue === emoji && 'bg-zinc-800 ring-1 ring-amber-500/50'
                                      )}
                                      aria-label={emoji}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto mb-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pr-0.5">
                                    {ROUTINE_ICON_OPTIONS.map(({ key, Icon }) => (
                                      <button
                                        key={key}
                                        type="button"
                                        onClick={() => setDraftCategoryIcon(group.id, 'icon', key)}
                                        className={cn(
                                          'w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-800 transition-colors',
                                          group.iconKind === 'icon' && group.iconValue === key && 'bg-zinc-800 ring-1 ring-amber-500/50'
                                        )}
                                        aria-label={key}
                                        title={key}
                                      >
                                        <Icon className={cn('w-4 h-4', group.iconKind === 'icon' ? ROUTINE_ICON_COLOR_CLASS[group.iconColor || 'white'] : 'text-zinc-400')} />
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Icon Color</p>
                                  <div className="flex items-center gap-1.5">
                                    {ROUTINE_ICON_COLORS.map(c => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setDraftCategoryIconColor(group.id, c.id)}
                                        className={cn(
                                          'w-5 h-5 rounded-full border border-black/20 transition-all',
                                          c.swatchClass,
                                          group.iconColor === c.id ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white' : 'hover:scale-110'
                                        )}
                                        aria-label={c.label}
                                        title={c.label}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={group.label}
                          onChange={(e) => renameDraftCategory(group.id, e.target.value)}
                          placeholder="Category title..."
                          aria-label="Category title"
                          className="flex-1 min-w-0 px-1.5 py-1 rounded-md bg-transparent border border-transparent hover:border-zinc-700 focus:border-amber-500/50 text-sm font-semibold text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => requestDeleteDraftCategory(group.id, group.label)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-700 transition-all flex-shrink-0"
                          aria-label={`Delete ${group.label || 'category'}`}
                          title="Delete this category block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1.5 mb-2.5">
                        {group.items.length === 0 && (
                          <p className="text-xs text-zinc-600 italic">No items yet.</p>
                        )}
                        {group.items.map(item => {
                          // Daily cards are strictly 100% Everyday Daily Routines —
                          // plain "Item Name + Delete" only, no frequency badges or
                          // schedule editor here. Specific-Days scheduling lives
                          // exclusively in the single fixed Weekly Card below.
                          return (
                            <div key={item.id} className="group">
                              <div className="flex items-center gap-1.5">
                                {editingRoutineItem?.categoryId === group.id && editingRoutineItem?.id === item.id ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    value={editingRoutineItemText}
                                    onChange={(e) => setEditingRoutineItemText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') commitEditDraftRoutineItem(); if (e.key === 'Escape') setEditingRoutineItem(null); }}
                                    onBlur={commitEditDraftRoutineItem}
                                    className="flex-1 min-w-0 px-2 py-1 rounded-md bg-zinc-900 border border-amber-500/50 text-xs text-white focus:outline-none"
                                  />
                                ) : (
                                  <span className="flex-1 min-w-0 text-xs text-zinc-300 truncate">{item.text}</span>
                                )}
                                <button
                                  onClick={() => startEditDraftRoutineItem(group.id, item)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all flex-shrink-0"
                                  aria-label="Edit item"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => requestDeleteDraftRoutineItem(group.id, item.id, item.text)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-700 transition-all flex-shrink-0"
                                  aria-label="Delete item"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newRoutineItemText[group.id] || ''}
                          onChange={(e) => setNewRoutineItemText(prev => ({ ...prev, [group.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') addDraftRoutineItem(group.id); }}
                          placeholder="Add item..."
                          className="flex-1 min-w-0 px-2 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                        />
                        <button
                          onClick={() => addDraftRoutineItem(group.id)}
                          className="p-1.5 rounded-md bg-zinc-700 text-white hover:bg-zinc-600 transition-all flex-shrink-0"
                          aria-label="Add item"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SINGLE FIXED WEEKLY CARD — only rendered while "Enable
                  Weekly / Day-Specific Routines" is on. Always exactly one
                  card, on its own row below the daily cards grid; it can
                  never be added again or removed like a regular category —
                  there's no "+ Add Category" affordance for it and no
                  delete button on its header. Every item inside is
                  Specific-Days only (day picker, no "Daily" option). */}
              {challengeConfigDraft.weeklyRoutinesEnabled && (
                <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-800/30 p-3.5">
                  <div className="flex items-center gap-1.5 mb-3 pb-2.5 border-b border-zinc-800/60">
                    <span className="text-sm flex-shrink-0" aria-hidden="true">📅</span>
                    <span className="flex-1 min-w-0 text-sm font-semibold text-white truncate">
                      Weekly / Day-Specific Routines
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-2.5">
                    {weeklyDraftItems.length === 0 && (
                      <p className="text-xs text-zinc-600 italic">No items yet.</p>
                    )}
                    {weeklyDraftItems.map(item => (
                      <div key={item.id} className="group">
                        <div className="flex items-center gap-1.5">
                          {editingRoutineItem?.categoryId === WEEKLY_CATEGORY_ID && editingRoutineItem?.id === item.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingRoutineItemText}
                              onChange={(e) => setEditingRoutineItemText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') commitEditDraftRoutineItem(); if (e.key === 'Escape') setEditingRoutineItem(null); }}
                              onBlur={commitEditDraftRoutineItem}
                              className="flex-1 min-w-0 px-2 py-1 rounded-md bg-zinc-900 border border-amber-500/50 text-xs text-white focus:outline-none"
                            />
                          ) : (
                            <span className="flex-1 min-w-0 text-xs text-zinc-300 truncate">{item.text}</span>
                          )}
                          <button
                            onClick={() => startEditDraftRoutineItem(WEEKLY_CATEGORY_ID, item)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all flex-shrink-0"
                            aria-label="Edit item"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => requestDeleteDraftRoutineItem(WEEKLY_CATEGORY_ID, item.id, item.text)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-700 transition-all flex-shrink-0"
                            aria-label="Delete item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {/* Day Picker — the only scheduling control here; no
                            "Daily" toggle, since every item in this card is
                            Specific-Days by definition. */}
                        <div className="flex flex-wrap gap-1 mt-1.5 mb-0.5">
                          {WEEKDAY_CHECKBOX_ORDER.map(day => {
                            const active = !!item.days?.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleDraftItemDay(WEEKLY_CATEGORY_ID, item.id, day)}
                                className={cn(
                                  'w-8 py-1 rounded text-[10px] font-semibold border transition-all',
                                  active
                                    ? 'bg-cyan-500 border-cyan-400 text-black'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                )}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        {(!item.days || item.days.length === 0) && (
                          <p className="text-[10px] text-amber-400/80 italic">
                            No days selected yet — applies daily until you pick at least one.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newRoutineItemText[WEEKLY_CATEGORY_ID] || ''}
                      onChange={(e) => setNewRoutineItemText(prev => ({ ...prev, [WEEKLY_CATEGORY_ID]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') addDraftWeeklyItem(); }}
                      placeholder="Add item..."
                      className="flex-1 min-w-0 px-2 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                    />
                    <button
                      onClick={addDraftWeeklyItem}
                      className="p-1.5 rounded-md bg-zinc-700 text-white hover:bg-zinc-600 transition-all flex-shrink-0"
                      aria-label="Add item"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer — two distinct actions depending on which entry point
              opened the modal: 'configure' always starts a brand-new run
              from Day 1 (even if a challenge is already active, this
              overwrites it); 'edit' only ever updates Title/Motto/Routines
              in place, leaving the active run's progress untouched. */}
          <div className={cn('flex items-center gap-2 border-t border-zinc-800 px-6 py-4 flex-shrink-0', challengeModalMode === 'configure' ? 'justify-between' : 'justify-between')}>
            {challengeModalMode === 'configure' && (
              <p className="text-xs text-zinc-500">
                Saving starts a new challenge run from Day 1.
              </p>
            )}

            {challengeModalMode === 'edit' && (
              // Wipes all progress and restarts Day 1 today. Always gated
              // behind a confirmation dialog — see isResetChallengeConfirmOpen.
              <button
                onClick={() => setIsResetChallengeConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Challenge
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChallengeConfigOpen(false)}
                className="px-3.5 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>

              {challengeModalMode === 'configure' && (
                // Applies the full draft (including Duration/Tokens) and
                // starts Day 1. If a challenge is already active, this is
                // intercepted by the double-confirmation guard below instead
                // of saving immediately — see handleStartChallengeClick.
                <button
                  onClick={handleStartChallengeClick}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 transition-all"
                >
                  Start Challenge
                </button>
              )}

              {challengeModalMode === 'edit' && (
                // Duration/Tokens are hidden in edit mode, so this only
                // updates Title/Motto/Routines in place — no reset.
                <button
                  onClick={saveChallengeConfigUpdate}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 transition-all"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
        </ModalBackdrop>

        {/* RESET CHALLENGE CONFIRMATION — layered above the Edit Challenge
            modal. Wipes every completed/failed/re-checked day and restarts
            Day 1 from today; Title/Motto/Routines/Duration/Tokens are kept
            as-is. Destructive and irreversible, so it always requires this
            explicit confirmation before anything is actually cleared. */}
        {isResetChallengeConfirmOpen && (
          <ModalBackdrop
            onClose={() => setIsResetChallengeConfirmOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Reset Challenge?</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-6">
                This clears every completed, failed, and re-checked day — plus all logged reasons and re-check tokens used — and restarts Day 1 today. Title, motto, and routines stay as configured. This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResetChallengeConfirmOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={resetChallengeProgress}
                  className="px-4 py-2 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </ModalBackdrop>
        )}

        {/* START CHALLENGE — DOUBLE CONFIRMATION GUARD — layered above the
            Configure Challenge modal. Only ever shown when Start Challenge
            is clicked while a challenge is already active (hasActiveChallengeProgress).
            Step 1 is the warning copy below; Step 2 is the typing gate —
            "Confirm & Reset Challenge" stays disabled until the user types
            RESET exactly (case-sensitive). No other way to proceed. */}
        {isStartChallengeResetConfirmOpen && (
          <ModalBackdrop
            onClose={closeStartChallengeResetConfirm}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Active Challenge in Progress!</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Proceeding will wipe current streak and reset timeline back to Day 1. This cannot be undone.
              </p>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                Type <span className="text-rose-400 font-bold normal-case">RESET</span> to confirm
              </label>
              <input
                type="text"
                autoFocus
                value={startChallengeResetTypedText}
                onChange={(e) => setStartChallengeResetTypedText(e.target.value)}
                placeholder="RESET"
                className="w-full mb-6 px-3.5 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeStartChallengeResetConfirm}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmStartChallengeReset}
                  disabled={!isStartChallengeResetConfirmed}
                  className="px-4 py-2 bg-rose-500/90 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed disabled:hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Confirm & Reset Challenge
                </button>
              </div>
            </div>
          </ModalBackdrop>
        )}

        {/* MANAGE / DELETE PRESETS — layered above the Configure Challenge
            modal. Only user-saved presets can be deleted; built-in templates
            are read-only and listed for reference only. */}
        {isManagePresetsOpen && (
          <ModalBackdrop
            onClose={() => setIsManagePresetsOpen(false)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <div
              className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800 flex-shrink-0">
                <h3 className="text-sm font-semibold text-white">Manage Presets</h3>
                <button
                  onClick={() => setIsManagePresetsOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto px-5 py-4 flex-1 min-h-0">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Your Presets</p>
                {userChallengePresets.length === 0 ? (
                  <p className="text-xs text-zinc-600 italic">You haven't saved any presets yet. Use "+ Save Current as Preset" to create one.</p>
                ) : (
                  <div className="space-y-1.5">
                    {userChallengePresets.map(preset => (
                      <div key={preset.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-800">
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{preset.name}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{preset.durationDays} days · {preset.recheckTokens} tokens</p>
                        </div>
                        <button
                          onClick={() => requestDeleteUserChallengePreset(preset.id, preset.name)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-700 transition-all flex-shrink-0"
                          aria-label={`Delete ${preset.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mt-4 mb-2">Built-in Templates</p>
                <div className="space-y-1.5">
                  {CHALLENGE_PRESETS.map(preset => (
                    <div key={preset.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-zinc-800/20 border border-zinc-800/60">
                      <div className="min-w-0">
                        <p className="text-sm text-zinc-400 truncate">{preset.name}</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">{preset.durationDays} days · {preset.recheckTokens} tokens</p>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end border-t border-zinc-800 px-5 py-3 flex-shrink-0">
                <button
                  onClick={() => setIsManagePresetsOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </ModalBackdrop>
        )}

        {/* DELETE PRESET CONFIRMATION — layered above Manage Presets. */}
        {presetPendingDelete && (
          <ModalBackdrop
            onClose={() => setPresetPendingDelete(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Delete "{presetPendingDelete.name}"?</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-6">
                This permanently removes this saved preset. This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPresetPendingDelete(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUserChallengePreset}
                  className="px-4 py-2 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </ModalBackdrop>
        )}

        {/* DELETE CATEGORY CONFIRMATION — layered above the Configure
            Challenge modal. Deleting a category block removes every routine
            item filed under it, so this always requires an explicit
            confirmation before anything is actually removed. */}
        {categoryPendingDelete && (
          <ModalBackdrop
            onClose={() => setCategoryPendingDelete(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-white truncate">Delete "{categoryPendingDelete.label}"?</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-6">
                This permanently deletes the entire category block and every routine item inside it. This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCategoryPendingDelete(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteDraftCategory}
                  className="px-4 py-2 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </ModalBackdrop>
        )}

        {/* DELETE ROUTINE ITEM CONFIRMATION — layered above the Configure
            Challenge modal. */}
        {itemPendingDelete && (
          <ModalBackdrop
            onClose={() => setItemPendingDelete(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-base font-bold text-white truncate">Delete "{itemPendingDelete.text}"?</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-6">
                This removes the routine item from this category. This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setItemPendingDelete(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteDraftRoutineItem}
                  className="px-4 py-2 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </ModalBackdrop>
        )}
      </div>
    );
}

