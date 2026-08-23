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
import { NOTICE_TYPE_META } from '../constants/notices';
import { PageHeader } from '../components/shared/PageHeader';
import { MarketSessionsBar } from '../components/shared/MarketSessionsBar';
import { EconomicCalendarCard } from '../components/shared/EconomicCalendarCard';
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

export function NoticesScreen() {
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

    // Which notice (if any) is open in the full-detail preview modal.
    const [previewNotice, setPreviewNotice] = useState<MarketNotice | null>(null);
    // Tracks which screenshot is showing in the preview modal's carousel —
    // reset to the first image whenever a different notice is opened.
    const [previewImageIndex, setPreviewImageIndex] = useState(0);
    const openPreviewNotice = (notice: MarketNotice) => {
      setPreviewImageIndex(0);
      setPreviewNotice(notice);
    };

    // Full-detail preview modal — opened by clicking any card. Shows the
    // high-res chart image on top and every note/lesson field underneath.
    // Kept as local state (not global context) since it's purely a
    // read-only viewer scoped to this screen.
    const previewMeta = previewNotice ? NOTICE_TYPE_META[previewNotice.type] : null;
    const previewTags = previewNotice?.type === 'mistake' && previewNotice.tag
      ? previewNotice.tag.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const renderPreviewModal = () => (
      previewNotice && previewMeta && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center overflow-y-auto p-4 py-8"
          onClick={() => setPreviewNotice(null)}
        >
          <div
            className={cn(
              'rounded-xl max-w-xl w-full border overflow-hidden',
              theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* High-res chart image(s) — carousel when the notice has more
                than one screenshot, single static image otherwise. Mirrors
                the Strategy Model cover carousel. */}
            {previewNotice.images && previewNotice.images.length > 0 ? (
              <div className="relative w-full aspect-video bg-zinc-950 group">
                <img
                  src={previewNotice.images[Math.min(previewImageIndex, previewNotice.images.length - 1)].url}
                  alt={previewNotice.title}
                  className="w-full h-full object-contain"
                />
                {previewNotice.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewImageIndex(prev => prev === 0 ? previewNotice.images.length - 1 : prev - 1); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewImageIndex(prev => prev === previewNotice.images.length - 1 ? 0 : prev + 1); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                      {previewNotice.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setPreviewImageIndex(idx); }}
                          className={cn('w-1.5 h-1.5 rounded-full transition-colors', idx === previewImageIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60')}
                        />
                      ))}
                    </div>
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-medium">
                      {previewImageIndex + 1} / {previewNotice.images.length}
                    </span>
                  </>
                )}
                <button
                  onClick={() => setPreviewNotice(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className={cn('flex items-center justify-between px-5 py-4 border-b', theme !== 'light' ? 'border-zinc-800' : 'border-zinc-200')}>
                <span className={cn('text-xs font-semibold uppercase tracking-wider', previewNotice.type === 'mistake' ? 'text-rose-400' : 'text-cyan-400')}>
                  {previewMeta.tabLabel}
                </span>
                <button onClick={() => setPreviewNotice(null)} className="p-1 text-zinc-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="p-5 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  {previewNotice.type === 'mistake' ? (
                    previewTags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-rose-500/10 text-rose-400 border-rose-500/30">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <>
                      {previewNotice.session && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                          {previewNotice.session}
                        </span>
                      )}
                      {previewNotice.tag && (
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', theme !== 'light' ? 'border-zinc-700 text-zinc-400 bg-zinc-800/60' : 'border-zinc-200 text-zinc-500 bg-zinc-100')}>
                          {previewNotice.tag}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <h2 className={cn('text-lg font-bold leading-snug', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{previewNotice.title}</h2>
              </div>

              {(previewNotice.description || previewNotice.whatHappenedTitle || previewNotice.keyTakeawayTitle) && (
                <div className={cn('rounded-lg border p-3', theme !== 'light' ? 'bg-zinc-800/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200')}>
                  <p className={cn('text-[11px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5', theme !== 'light' ? 'text-zinc-400' : 'text-zinc-500')}>
                    {previewNotice.type === 'mistake' ? <>❌ What Happened</> : '🔑 What You Noticed'}
                  </p>
                  {previewNotice.type === 'mistake' && previewNotice.whatHappenedTitle && (
                    <p className={cn('text-sm font-semibold mb-1', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{previewNotice.whatHappenedTitle}</p>
                  )}
                  {previewNotice.type === 'insight' && previewNotice.keyTakeawayTitle && (
                    <p className={cn('text-sm font-semibold mb-1', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{previewNotice.keyTakeawayTitle}</p>
                  )}
                  {previewNotice.description && (
                    <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', theme !== 'light' ? 'text-zinc-300' : 'text-zinc-700')}>{previewNotice.description}</p>
                  )}
                </div>
              )}

              {previewNotice.consequence && (
                <div className={cn('rounded-lg border p-3', theme !== 'light' ? 'bg-zinc-800/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200')}>
                  <p className={cn('text-[11px] font-semibold uppercase tracking-wider mb-1.5', theme !== 'light' ? 'text-zinc-400' : 'text-zinc-500')}>Consequence / Risk</p>
                  <p className={cn('text-sm leading-relaxed', theme !== 'light' ? 'text-zinc-300' : 'text-zinc-700')}>{previewNotice.consequence}</p>
                </div>
              )}

              {(previewNotice.prevention || previewNotice.preventionTitle) && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-emerald-400 flex items-center gap-1.5">
                    {previewNotice.type === 'mistake' ? <>💡 Rule / Prevention</> : 'How To Use This'}
                  </p>
                  {previewNotice.type === 'mistake' && previewNotice.preventionTitle && (
                    <p className="text-sm font-semibold mb-1 text-emerald-300">{previewNotice.preventionTitle}</p>
                  )}
                  {previewNotice.prevention && (
                    <p className="text-sm leading-relaxed text-emerald-100 font-medium">{previewNotice.prevention}</p>
                  )}
                </div>
              )}

              {/* Additional Breakdown — extra image+note blocks for setups
                  that need more than one screenshot to explain, added in the
                  Add/Edit Notice modal. Mirrors the Strategy Model's
                  execution-step timeline, just worded as "parts" here. */}
              {previewNotice.steps && previewNotice.steps.length > 0 && (
                <div>
                  <p className={cn('text-[11px] font-semibold uppercase tracking-wider mb-2', theme !== 'light' ? 'text-zinc-500' : 'text-zinc-500')}>Additional Breakdown</p>
                  <div className="space-y-3">
                    {previewNotice.steps.map((step, idx) => (
                      <div key={step.id} className={cn('rounded-lg border overflow-hidden', theme !== 'light' ? 'border-zinc-800 bg-zinc-800/40' : 'border-zinc-200 bg-zinc-50')}>
                        {step.images.length > 0 && (
                          <div className={cn('grid gap-0.5', step.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
                            {step.images.map((img, imgIdx) => (
                              <div
                                key={img.id}
                                className="relative w-full bg-zinc-950 cursor-pointer"
                                onClick={() => setLightboxImage(img.url)}
                              >
                                <img
                                  src={img.url}
                                  alt={`${step.title || `Part ${idx + 1}`} screenshot`}
                                  className="w-full h-full object-cover aspect-video"
                                />
                                {step.images.length > 1 && (
                                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-white/10 shadow-sm pointer-events-none">
                                    #{imgIdx + 1}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="p-3 space-y-1">
                          <p className={cn('text-[10px] font-bold uppercase tracking-wider', previewNotice.type === 'mistake' ? 'text-rose-400' : 'text-cyan-400')}>Part {idx + 1}</p>
                          {step.title && (
                            <p className={cn('text-sm font-semibold', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{step.title}</p>
                          )}
                          {step.notes && (
                            <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', theme !== 'light' ? 'text-zinc-300' : 'text-zinc-700')}>{step.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => { handleEditNotice(previewNotice); setPreviewNotice(null); }}
                  className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800')}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => { handleDeleteNotice(previewNotice.id); setPreviewNotice(null); }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    );

    // Price Action Insight card — compact Notion gallery style: small
    // chart image on top, bold title + session/asset pills below.
    const renderInsightCard = (notice: MarketNotice) => (
      <div
        key={notice.id}
        onClick={() => openPreviewNotice(notice)}
        className={cn(
          'group relative rounded-lg border overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col h-full',
          theme !== 'light'
            ? 'bg-zinc-800/30 border-zinc-700/40 hover:bg-zinc-800/50'
            : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'
        )}
      >
        {/* Chart preview */}
        <div className={cn('relative w-full aspect-[16/10] flex items-center justify-center overflow-hidden', theme !== 'light' ? 'bg-zinc-950' : 'bg-zinc-100')}>
          {notice.images?.[0] ? (
            <img src={notice.images[0].url} alt={notice.title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className={cn('w-5 h-5', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-400')} />
          )}

          {/* Caption overlay — mirrors the mistake card's overlay so both
              columns feel equally complete at a glance */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-2 pt-5 pb-1.5">
            <p className={cn('text-[11px] uppercase tracking-wider', tc.textMuted)}>🔑 Key Takeaway</p>
            <p className={cn('text-[10px] leading-snug line-clamp-1', notice.keyTakeawayTitle ? 'text-white/90' : 'text-zinc-500 italic')}>
              {notice.keyTakeawayTitle || 'No title added yet.'}
            </p>
          </div>
        </div>

        {/* Edit / Delete */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); handleEditNotice(notice); }}
            className="p-1 rounded-md backdrop-blur-sm bg-black/60 text-zinc-300 hover:text-white transition-colors"
          >
            <Edit2 className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteNotice(notice.id); }}
            className="p-1 rounded-md backdrop-blur-sm bg-black/60 text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 flex flex-col gap-1 flex-1">
          <h3 className={cn('text-xs font-bold leading-snug line-clamp-2 min-h-[2.2em]', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{notice.title}</h3>
          <div className="flex flex-wrap items-center gap-1 min-h-[17px]">
            {notice.session && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium border bg-cyan-500/15 text-cyan-400 border-cyan-500/30">
                {notice.session}
              </span>
            )}
            {notice.tag && (
              <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium border', theme !== 'light' ? 'border-zinc-700 text-zinc-400 bg-zinc-800/60' : 'border-zinc-200 text-zinc-500 bg-zinc-100')}>
                {notice.tag}
              </span>
            )}
          </div>
        </div>
      </div>
    );

    // Anti-Mistake / Trap card — structured problem vs. solution format:
    // header with mistake tag pills, thumbnail banner, a dark "what
    // happened" block, then a green-accented "prevention" block. Every
    // slot is always rendered (with a placeholder when empty) so every
    // card in this column comes out the same fixed height.
    const renderMistakeCard = (notice: MarketNotice) => {
      const tags = notice.tag ? notice.tag.split(',').map(t => t.trim()).filter(Boolean) : [];
      return (
        <div
          key={notice.id}
          onClick={() => openPreviewNotice(notice)}
          className={cn(
            'group relative rounded-lg border overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col h-full',
            theme !== 'light'
              ? 'bg-zinc-800/30 border-zinc-700/40 hover:bg-zinc-800/50'
              : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'
          )}
        >
          {/* Edit / Delete */}
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={(e) => { e.stopPropagation(); handleEditNotice(notice); }}
              className="p-1 rounded-md backdrop-blur-sm bg-black/60 text-zinc-300 hover:text-white transition-colors"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteNotice(notice.id); }}
              className="p-1 rounded-md backdrop-blur-sm bg-black/60 text-zinc-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Thumbnail banner — same aspect ratio as insight cards. What
              Happened / Prevention titles are overlaid directly on top of
              the image (not stacked below it) so the card's total height
              stays identical to the insight cards regardless of content. */}
          <div className={cn('relative w-full aspect-[16/10] flex-shrink-0 flex items-center justify-center overflow-hidden', theme !== 'light' ? 'bg-zinc-950' : 'bg-zinc-100')}>
            {notice.images?.[0] ? (
              <img src={notice.images[0].url} alt={notice.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className={cn('w-5 h-5', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-400')} />
            )}

            {/* Caption overlay — dark scrim at the bottom of the image */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-2 pt-5 pb-1.5 flex flex-col gap-1">
              <div>
                <p className={cn('text-[11px] uppercase tracking-wider', tc.textMuted)}>❌ What Happened</p>
                <p className={cn('text-[10px] leading-snug line-clamp-1', notice.whatHappenedTitle ? 'text-white/90' : 'text-zinc-500 italic')}>
                  {notice.whatHappenedTitle || 'No title added yet.'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-emerald-400">💡 Rule / Prevention</p>
                <p className={cn('text-[10px] font-semibold leading-snug line-clamp-1', notice.preventionTitle ? 'text-emerald-200' : 'text-emerald-200/50 italic')}>
                  {notice.preventionTitle || 'No title added yet.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2 flex-1 flex flex-col gap-1">
            {/* Header: title + mistake tag pills — pill row height reserved even when empty */}
            <div className="space-y-1 pr-6">
              <h3 className={cn('text-xs font-bold leading-snug line-clamp-2 min-h-[2.2em]', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{notice.title}</h3>
              <div className="flex flex-wrap gap-1 min-h-[17px]">
                {tags.length > 0 && tags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold border bg-rose-500/15 text-rose-400 border-rose-500/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    };

    // One column (Price Action Insights or Anti-Mistakes & Traps) — always
    // visible side by side, nothing to click through. Each column is a
    // fixed-height parent card so left/right stay identical in height no
    // matter how many items either side has; the header stays pinned at
    // the top of the card and only the items area scrolls internally.
    const renderColumn = (type: NoticeType) => {
      const meta = NOTICE_TYPE_META[type];
      const list = notices.filter(n => n.type === type);
      return (
        <div className={cn(
          'min-w-0 h-[450px] rounded-xl p-4 flex flex-col border',
          theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
        )}>
          <div className={cn(
            'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border flex-shrink-0',
            theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200'
          )}>
            <div className="flex items-center gap-2 min-w-0">
              <meta.headerIcon className={cn('w-4 h-4 flex-shrink-0', type === 'mistake' ? 'text-rose-400' : 'text-cyan-400')} />
              <h2 className={cn('text-sm font-semibold truncate', tc.text)}>
                {meta.tabLabel}
              </h2>
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0',
                type === 'mistake' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
              )}>
                {list.length}
              </span>
            </div>
            <button
              onClick={() => handleOpenAddNotice(type)}
              className={cn(
                'p-1.5 rounded-lg transition-colors flex-shrink-0',
                theme !== 'light' ? 'bg-black/20 hover:bg-black/40 text-zinc-300 hover:text-white' : 'bg-zinc-200/60 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            className={cn(
              'flex-1 overflow-y-auto overscroll-contain mt-3',
              type === 'mistake'
                ? 'notice-column-scroll-mistake [direction:rtl] pl-1'
                : 'notice-column-scroll-insight pr-1'
            )}
          >
            {/* Mirrored (mistake) column has its scroll container flipped
                to RTL so the scrollbar renders on the LEFT edge — this
                inner wrapper flips direction back to LTR so text, icons,
                and layout inside still read normally left-to-right. */}
            <div className={type === 'mistake' ? '[direction:ltr]' : undefined}>
            {list.length > 0 ? (
              <div className="grid gap-2.5 items-start grid-cols-2 sm:grid-cols-3">
                {list.map(type === 'mistake' ? renderMistakeCard : renderInsightCard)}
              </div>
            ) : (
              <div className={cn(
                'text-center py-8 rounded-lg border border-dashed',
                theme !== 'light' ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-300 bg-zinc-50'
              )}>
                <p className="text-zinc-500 text-xs mb-2">
                  {notices.some(n => n.type === type) ? 'No matches for these filters' : `No ${meta.tabLabel.toLowerCase()} yet`}
                </p>
                <button
                  onClick={() => handleOpenAddNotice(type)}
                  className={cn(
                    'inline-flex items-center gap-1 text-xs transition-colors',
                    theme !== 'light' ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
                  )}
                >
                  <Plus className="w-3 h-3" />
                  Add {meta.shortLabel}
                </button>
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
          title="Market Notices"
          description="Anti-mistake database & price action playbook"
          actions={
            <button
              onClick={() => handleOpenAddNotice('mistake')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors flex-shrink-0',
                theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-white'
              )}
            >
              <Plus className="w-4 h-4" />
              <span>Add Notice</span>
            </button>
          }
        />

        {/* Market Sessions & Killzones — live PHT session status for
            Tokyo/Asian, London, and New York, with DST auto-detected via
            Intl for the London/NY summer-vs-winter PHT windows. */}
        <MarketSessionsBar />

        {/* Two equal-height parent cards: Price Action Insights on the
            left, Anti-Mistakes & Traps on the right — nothing to click
            through, both cards fixed to the same height regardless of
            item count. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderColumn('insight')}
          {renderColumn('mistake')}
        </div>

        {/* Economic Calendar — full width, spans below both columns.
            Fetches live from /api/calendar (Vercel serverless proxy for
            the Myfxbook RSS feed) and filters to USD high-impact events. */}
        <EconomicCalendarCard />

        {renderPreviewModal()}

      </div>
    );
}
