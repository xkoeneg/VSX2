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
  Sparkles,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { ModalBackdrop } from '../components/shared/ModalBackdrop';
import { TagSelectDropdown } from '../components/shared/TagSelectDropdown';
import { NOTICE_TYPE_META } from '../constants/notices';
import { SESSION_OPTIONS } from '../constants/trading';
import { WIKI_CATEGORIES } from '../types/index';
import { getWikiCategoryStyle } from '../constants/wiki';
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
import { generateId } from '../utils/id';
import { useAppContext } from '../context/AppContext';
import { renderStatCard, renderAccountFilter, renderAccountTypeBadge, renderTradingAccountTypeBadge } from '../components/shared/RenderHelpers';

export function AddNoticeModal() {
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
    handleNoticeImagesPick, removeNoticeImage, moveNoticeImage, draggingNoticeImageId, setDraggingNoticeImageId,
    dragOverNoticeImageId, setDragOverNoticeImageId, handleAddNotice, handleOpenAddNotice, handleEditNotice, handleDeleteNotice,
    noticeStepPendingDeleteId, setNoticeStepPendingDeleteId, draggingNoticeStepImageId, setDraggingNoticeStepImageId,
    dragOverNoticeStepImageId, setDragOverNoticeStepImageId, noticeStepImageInputRefs, addNoticeStep, updateNoticeStep,
    requestRemoveNoticeStep, removeNoticeStep, confirmRemoveNoticeStep, handleNoticeStepImagesPick, removeNoticeStepImage,
    moveNoticeStepImage,
    WIKI_FORM_DEFAULT, handleAddWiki, handleOpenAddWiki, handleOpenEditWiki, handleDeleteWiki,
    handleWikiImagePick, addWikiKeyRule, updateWikiKeyRule, removeWikiKeyRule, handleDeleteSetupType,
    handleDeleteConfluence, handleDeleteMistakeType, handleChangeSetupTypeColor, handleChangeConfluenceColor,
    handleChangeMistakeColor, handleDeleteEmotion, handleChangeEmotionColor, colorForEmotion, colorForMistake,
    handleFileUpload, handleAddImageUrl, handleRemoveImage, handleReorderImages, updateTimeframeNotes,
    exportBackup, importBackup,
  } = useAppContext();

  // Mistake tags are stored as a comma-separated string in the existing
  // `tag` field (the same field used as "Asset / Tag" for insights) so no
  // data-model changes are required — the TagSelectDropdown below just
  // joins/splits its selected array against that string.
  const selectedMistakeTags = newNotice.tag ? newNotice.tag.split(',').map(t => t.trim()).filter(Boolean) : [];
  const isMistake = newNotice.type === 'mistake';

  return (
    showAddNotice && (
      <ModalBackdrop
        onClose={() => { setShowAddNotice(false); setEditingNoticeId(null); }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between flex-shrink-0 z-20">
            <h3 className="text-xl font-bold text-white truncate">{editingNoticeId ? 'Edit Market Notice' : 'Add Market Notice'}</h3>
            <button onClick={() => { setShowAddNotice(false); setEditingNoticeId(null); }} className="p-2 text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto">
            {/* ================= SECTION 1: Type & Image ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">01</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Type &amp; Chart</h4>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(NOTICE_TYPE_META) as NoticeType[]).map(t => {
                    const meta = NOTICE_TYPE_META[t];
                    const active = newNotice.type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewNotice(prev => ({ ...prev, type: t }))}
                        className={cn(
                          'flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all',
                          active
                            ? t === 'mistake'
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-300'
                              : 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                        )}
                      >
                        <meta.headerIcon className={cn('w-3.5 h-3.5', active ? (t === 'mistake' ? 'text-rose-400' : 'text-cyan-400') : 'text-zinc-500')} />
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SCREENSHOTS — supports multiple chart images for both notice
                  types (Price Action Insight and Anti-Mistake/Trap), shown as
                  a reorderable grid; the first image doubles as the card
                  thumbnail. Mirrors the Strategy Model cover-image manager. */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs text-zinc-400">Screenshot(s) (TradingView chart reference)</label>
                  {newNotice.images.length > 0 && (
                    <span className="text-xs text-zinc-600">{newNotice.images.length} image{newNotice.images.length === 1 ? '' : 's'}</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {newNotice.images.map((img, imgIdx) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggingNoticeImageId(img.id);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', img.id);
                      }}
                      onDragEnd={() => { setDraggingNoticeImageId(null); setDragOverNoticeImageId(null); }}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                      onDragEnter={() => setDragOverNoticeImageId(img.id)}
                      onDragLeave={() => setDragOverNoticeImageId(prev => (prev === img.id ? null : prev))}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/plain');
                        moveNoticeImage(draggedId, img.id);
                        setDraggingNoticeImageId(null);
                        setDragOverNoticeImageId(null);
                      }}
                      onClick={() => setLightboxImage(img.url)}
                      title="Drag to reorder — click to view larger"
                      className={cn(
                        "relative aspect-video rounded-lg overflow-hidden border bg-zinc-950 group cursor-grab active:cursor-grabbing transition-all",
                        dragOverNoticeImageId === img.id
                          ? (isMistake ? "border-rose-400 ring-2 ring-rose-400/60" : "border-cyan-400 ring-2 ring-cyan-400/60")
                          : "border-zinc-700",
                        draggingNoticeImageId === img.id && "opacity-40"
                      )}
                    >
                      <img src={img.url} alt="Chart screenshot" className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/70 text-white text-[9px] font-semibold pointer-events-none">
                        <GripVertical className="w-2.5 h-2.5" />
                        {imgIdx + 1}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeNoticeImage(img.id); }}
                        title="Remove image"
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => noticeImageInputRef.current?.click()}
                    className={cn(
                      "aspect-video rounded-lg border border-dashed flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 transition-all bg-zinc-950",
                      isMistake ? "border-zinc-700 hover:border-rose-500/60" : "border-zinc-700 hover:border-cyan-500/60"
                    )}
                  >
                    <ImagePlus className="w-4 h-4" />
                    <span className="text-[10px] text-center leading-tight px-1">{newNotice.images.length > 0 ? 'Add more' : 'Upload chart image(s)'}</span>
                  </button>
                </div>
                <input ref={noticeImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleNoticeImagesPick} />
                <p className="text-xs text-zinc-600 mt-1.5">
                  {newNotice.images.length > 1
                    ? 'Drag a screenshot to reorder — the first one becomes the card thumbnail.'
                    : 'Add one or more chart screenshots for this notice.'}
                </p>
              </div>
            </div>

            {/* ================= SECTION 2: Details (dynamic by type) ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">02</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {isMistake ? 'Trap Details' : 'Insight Details'}
                </h4>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Title</label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={isMistake ? 'e.g. Chasing 9:30 AM Open Spikes' : 'e.g. London Open Liquidity Sweep'}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
                />
              </div>

              {isMistake ? (
                <>
                  {/* Mistake Tags — same reusable dropdown used for "Mistakes
                      Made" on the Add Trade modal, backed by the shared
                      mistakesList so tags, colors, and additions/removals
                      stay consistent across the whole app. */}
                  <TagSelectDropdown
                    label="Mistake Tags"
                    options={mistakesList}
                    selected={selectedMistakeTags}
                    onChange={(selected) => setNewNotice(prev => ({ ...prev, tag: selected.join(', ') }))}
                    onAddNew={(name) => setMistakesList(prev => [...prev, { id: generateId(), name, color: 'red' }])}
                    onDeleteOption={handleDeleteMistakeType}
                    onColorChange={handleChangeMistakeColor}
                    placeholder="Select Mistake Tags..."
                    colorScheme="rose"
                  />

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">What Happened — Card Title</label>
                    <input
                      type="text"
                      value={newNotice.whatHappenedTitle}
                      onChange={(e) => setNewNotice(prev => ({ ...prev, whatHappenedTitle: e.target.value }))}
                      placeholder="Short summary shown on the card, e.g. Chased the 9:30 spike"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
                    />
                    <label className="block text-xs text-zinc-500 mt-2.5 mb-1.5">Full Details <span className="text-zinc-600">(shown when opened)</span></label>
                    <textarea
                      value={newNotice.description}
                      onChange={(e) => setNewNotice(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the setup and behavior in detail..."
                      rows={3}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Consequence / Risk <span className="text-zinc-600">(optional)</span></label>
                    <input
                      type="text"
                      value={newNotice.consequence}
                      onChange={(e) => setNewNotice(prev => ({ ...prev, consequence: e.target.value }))}
                      placeholder="e.g. Full Stop Loss + Revenge Trade trigger"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-emerald-400 mb-1.5 font-medium">Prevention — Card Title</label>
                    <input
                      type="text"
                      value={newNotice.preventionTitle}
                      onChange={(e) => setNewNotice(prev => ({ ...prev, preventionTitle: e.target.value }))}
                      placeholder="Short rule shown on the card, e.g. Wait for the retest"
                      className="w-full bg-zinc-800 border border-emerald-500/30 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                    />
                    <label className="block text-xs text-zinc-500 mt-2.5 mb-1.5">Full Details <span className="text-zinc-600">(shown when opened)</span></label>
                    <textarea
                      value={newNotice.prevention}
                      onChange={(e) => setNewNotice(prev => ({ ...prev, prevention: e.target.value }))}
                      placeholder="The bold, actionable fix..."
                      rows={2}
                      className="w-full bg-zinc-800 border border-emerald-500/30 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Session + Asset side-by-side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5">Session</label>
                      <select
                        value={newNotice.session}
                        onChange={(e) => setNewNotice(prev => ({ ...prev, session: e.target.value as SessionOption | '' }))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
                      >
                        <option value="">None</option>
                        {SESSION_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5">Asset</label>
                      <input
                        type="text"
                        value={newNotice.tag}
                        onChange={(e) => setNewNotice(prev => ({ ...prev, tag: e.target.value }))}
                        placeholder="e.g. NQ Futures"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-cyan-400 mb-1.5 font-medium">Key Takeaway — Card Title</label>
                    <input
                      type="text"
                      value={newNotice.keyTakeawayTitle}
                      onChange={(e) => setNewNotice(prev => ({ ...prev, keyTakeawayTitle: e.target.value }))}
                      placeholder="Short summary shown on the card, e.g. Fades hold at the range high"
                      className="w-full bg-zinc-800 border border-cyan-500/30 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/60"
                    />
                    <label className="block text-xs text-zinc-500 mt-2.5 mb-1.5">Full Note <span className="text-zinc-600">(shown when opened)</span></label>
                    <textarea
                      value={newNotice.description}
                      onChange={(e) => setNewNotice(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What you noticed and how to use it next time..."
                      rows={3}
                      className="w-full bg-zinc-800 border border-cyan-500/30 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/60 resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* ================= SECTION 3: Additional Breakdown ================= */}
            {/* Optional — for setups where one screenshot + one paragraph isn't
                enough. Each part gets its own title, notes, and screenshot(s),
                so a multi-part insight or trap can be explained across
                several image+note blocks, journal-style. */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">03</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Additional Breakdown</h4>
                <span className="text-[10px] text-zinc-600">(optional)</span>
                {newNotice.steps.length > 0 && (
                  <span className="text-xs text-zinc-600 ml-auto">{newNotice.steps.length} part{newNotice.steps.length === 1 ? '' : 's'}</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 -mt-1.5">
                Need more than one image to explain this? Add more parts — each with its own note and screenshot(s).
              </p>

              {newNotice.steps.length > 0 && (
                <div className="space-y-3">
                  {newNotice.steps.map((step, idx) => (
                    <div key={step.id} className="rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Part {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => requestRemoveNoticeStep(step.id)}
                          title="Remove part"
                          className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateNoticeStep(step.id, 'title', e.target.value)}
                        placeholder={isMistake ? `Part ${idx + 1}: What led into the trap` : `Part ${idx + 1}: London Open Sweep & Reaction`}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600"
                      />
                      <textarea
                        ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; } }}
                        value={step.notes}
                        onChange={(e) => {
                          updateNoticeStep(step.id, 'notes', e.target.value);
                          const el = e.currentTarget;
                          el.style.height = 'auto';
                          el.style.height = `${el.scrollHeight}px`;
                        }}
                        placeholder="Explain what's happening here..."
                        rows={2}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 resize-none overflow-hidden"
                      />
                      <div>
                        <div className="grid grid-cols-3 gap-2">
                          {step.images.map((img, imgIdx) => (
                            <div
                              key={img.id}
                              draggable
                              onDragStart={(e) => {
                                setDraggingNoticeStepImageId(img.id);
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', img.id);
                              }}
                              onDragEnd={() => { setDraggingNoticeStepImageId(null); setDragOverNoticeStepImageId(null); }}
                              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                              onDragEnter={() => setDragOverNoticeStepImageId(img.id)}
                              onDragLeave={() => setDragOverNoticeStepImageId(prev => (prev === img.id ? null : prev))}
                              onDrop={(e) => {
                                e.preventDefault();
                                const draggedId = e.dataTransfer.getData('text/plain');
                                moveNoticeStepImage(step.id, draggedId, img.id);
                                setDraggingNoticeStepImageId(null);
                                setDragOverNoticeStepImageId(null);
                              }}
                              onClick={() => setLightboxImage(img.url)}
                              title="Drag to reorder — click to view larger"
                              className={cn(
                                "relative aspect-video rounded-lg overflow-hidden border bg-zinc-950 group cursor-grab active:cursor-grabbing transition-all",
                                dragOverNoticeStepImageId === img.id
                                  ? (isMistake ? "border-rose-400 ring-2 ring-rose-400/60" : "border-cyan-400 ring-2 ring-cyan-400/60")
                                  : "border-zinc-700",
                                draggingNoticeStepImageId === img.id && "opacity-40"
                              )}
                            >
                              <img src={img.url} alt="Part screenshot" className="w-full h-full object-cover pointer-events-none" />
                              <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/70 text-white text-[9px] font-semibold pointer-events-none">
                                <GripVertical className="w-2.5 h-2.5" />
                                {imgIdx + 1}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeNoticeStepImage(step.id, img.id); }}
                                title="Remove screenshot"
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => noticeStepImageInputRefs.current[step.id]?.click()}
                            className={cn(
                              "aspect-video rounded-lg border border-dashed flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 transition-all bg-zinc-800",
                              isMistake ? "border-zinc-700 hover:border-rose-500/60" : "border-zinc-700 hover:border-cyan-500/60"
                            )}
                          >
                            <ImagePlus className="w-4 h-4" />
                            <span className="text-[10px] text-center leading-tight px-1">{step.images.length > 0 ? 'Add more' : 'Upload screenshot(s)'}</span>
                          </button>
                        </div>
                        {step.images.length > 1 && (
                          <p className="text-[10px] text-zinc-600 mt-1.5">Drag a photo to reorder — the first one shows first. Click any photo to view it larger.</p>
                        )}
                        <input
                          ref={(el) => { noticeStepImageInputRefs.current[step.id] = el; }}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleNoticeStepImagesPick(step.id, e)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addNoticeStep}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Part
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowAddNotice(false); setEditingNoticeId(null); }}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNotice}
                disabled={!newNotice.title.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed text-black rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingNoticeId ? 'Save Changes' : 'Add Notice'}
              </button>
            </div>
          </div>
        </div>
      </ModalBackdrop>
    )
  );
}

export function DeleteNoticeStepConfirm() {
  const { noticeStepPendingDeleteId, setNoticeStepPendingDeleteId, newNotice, confirmRemoveNoticeStep } = useAppContext();

  if (!noticeStepPendingDeleteId) return null;
  const step = newNotice.steps.find(s => s.id === noticeStepPendingDeleteId);
  const idx = newNotice.steps.findIndex(s => s.id === noticeStepPendingDeleteId);

  return (
    <ModalBackdrop
      onClose={() => setNoticeStepPendingDeleteId(null)}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Remove "{step?.title || `Part ${idx + 1}`}"?</h3>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          This removes this part{step && step.images.length > 0 ? ` and its ${step.images.length} screenshot${step.images.length > 1 ? 's' : ''}` : ''} from the breakdown. This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setNoticeStepPendingDeleteId(null)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmRemoveNoticeStep}
            className="px-4 py-2 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

export function AddWikiModal() {
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
    handleNoticeImagesPick, removeNoticeImage, moveNoticeImage, draggingNoticeImageId, setDraggingNoticeImageId,
    dragOverNoticeImageId, setDragOverNoticeImageId, handleAddNotice, handleOpenAddNotice, handleEditNotice, handleDeleteNotice,
    WIKI_FORM_DEFAULT, handleAddWiki, handleOpenAddWiki, handleOpenEditWiki, handleDeleteWiki,
    handleWikiImagePick, handleWikiImageDragOver, handleWikiImageDragLeave, handleWikiImageDrop,
    handleWikiImagePaste, wikiImageDropzoneRef, isWikiImageDragActive,
    isWikiAutoFilling, handleWikiAutoFill,
    addWikiKeyRule, updateWikiKeyRule, removeWikiKeyRule, requestRemoveWikiKeyRule, handleDeleteSetupType,
    handleDeleteConfluence, handleDeleteMistakeType, handleChangeSetupTypeColor, handleChangeConfluenceColor,
    handleChangeMistakeColor, handleDeleteEmotion, handleChangeEmotionColor, colorForEmotion, colorForMistake,
    handleFileUpload, handleAddImageUrl, handleRemoveImage, handleReorderImages, updateTimeframeNotes,
    exportBackup, importBackup,
  } = useAppContext();

  return (
    showAddWiki && (
      <ModalBackdrop
        onClose={() => setShowAddWiki(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          onPaste={handleWikiImagePaste}
        >
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-20">
            <h3 className="text-xl font-bold text-white truncate">{editingWikiId ? 'Edit Knowledge Entry' : 'Add Knowledge Entry'}</h3>
            <button onClick={() => setShowAddWiki(false)} className="p-2 text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="p-6 space-y-4">
            {/* ================= SECTION 1: Diagram / Chart Image ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">01</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Diagram / Chart Image</h4>
              </div>
              <button
                type="button"
                ref={wikiImageDropzoneRef}
                onClick={() => wikiImageInputRef.current?.click()}
                onDragOver={handleWikiImageDragOver}
                onDragLeave={handleWikiImageDragLeave}
                onDrop={handleWikiImageDrop}
                onPaste={handleWikiImagePaste}
                className={cn(
                  'w-full aspect-video rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 transition-all overflow-hidden bg-zinc-950 outline-none',
                  isWikiImageDragActive
                    ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                    : 'border-zinc-700 hover:border-zinc-500 text-zinc-500 hover:text-zinc-300 focus-visible:border-sky-500/70'
                )}
              >
                {newWiki.imageUrl ? (
                  <img src={newWiki.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-xs">
                      {isWikiImageDragActive ? 'Drop image to upload' : 'Upload diagram image'}
                    </span>
                    <span className="text-[10px] text-zinc-600">Click, drag & drop, or paste (Ctrl+V)</span>
                  </>
                )}
              </button>
              <input ref={wikiImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleWikiImagePick} />
              <input
                type="text"
                value={(newWiki.imageUrl || '').startsWith('data:') ? '' : (newWiki.imageUrl || '')}
                onChange={(e) => setNewWiki(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="...or paste an image URL"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* ================= SECTION 2: Concept Details ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center justify-between gap-2 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">02</span>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Concept Details</h4>
                </div>
                <button
                  type="button"
                  onClick={handleWikiAutoFill}
                  disabled={!newWiki.title?.trim() || isWikiAutoFilling}
                  title={!newWiki.title?.trim() ? 'Type a concept name first' : 'Auto-fill this entry with AI'}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all flex-shrink-0',
                    isWikiAutoFilling
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 animate-pulse cursor-wait'
                      : !newWiki.title?.trim()
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-600 cursor-not-allowed'
                        : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-400 hover:text-purple-300'
                  )}
                >
                  {isWikiAutoFilling ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>{isWikiAutoFilling ? 'Generating…' : 'Auto-Fill with AI'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Title</label>
                <input
                  type="text"
                  value={newWiki.title || ''}
                  onChange={(e) => setNewWiki(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Order Block"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
                />
              </div>

              {/* Category picker — fixed set so it always maps to a filter tab */}
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {WIKI_CATEGORIES.map(cat => {
                    const active = newWiki.category === cat;
                    const style = getWikiCategoryStyle(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewWiki(prev => ({ ...prev, category: cat }))}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                          active ? style.active : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', style.dot)} />
                        <span className="truncate">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ================= SECTION 3: Definition & Key Rules ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">03</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Definition &amp; Key Rules</h4>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Core Definition</label>
                <textarea
                  value={newWiki.content || ''}
                  onChange={(e) => setNewWiki(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Short description of the concept..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 resize-none"
                />
              </div>

              {/* Key Rules / Conditions — one bullet per line */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs text-zinc-400">Key Rules / Conditions</label>
                  {(newWiki.keyRules || []).length > 0 && (
                    <span className="text-xs text-zinc-600">{(newWiki.keyRules || []).length} rule{(newWiki.keyRules || []).length === 1 ? '' : 's'}</span>
                  )}
                </div>
                <div className="space-y-2">
                  {(newWiki.keyRules || []).map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => updateWikiKeyRule(idx, e.target.value)}
                        placeholder="e.g. Must be formed by a displacement candle"
                        className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600"
                      />
                      <button type="button" onClick={() => requestRemoveWikiKeyRule(idx)} className="p-1 text-zinc-600 hover:text-rose-400 flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addWikiKeyRule} className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Add rule
                </button>
              </div>
            </div>

            {/* ================= SECTION 4: Trading Context ================= */}
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl space-y-3 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
              <div className="flex items-center gap-2 pb-1">
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest">04</span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Trading Context</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Best Session</label>
                  <input
                    type="text"
                    value={newWiki.bestSession || ''}
                    onChange={(e) => setNewWiki(prev => ({ ...prev, bestSession: e.target.value }))}
                    placeholder="e.g. NY Open"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Timeframe</label>
                  <input
                    type="text"
                    value={newWiki.timeframe || ''}
                    onChange={(e) => setNewWiki(prev => ({ ...prev, timeframe: e.target.value }))}
                    placeholder="e.g. 5m / 15m HTF"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Additional Notes</label>
                <textarea
                  value={newWiki.contextNotes || ''}
                  onChange={(e) => setNewWiki(prev => ({ ...prev, contextNotes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddWiki(false)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddWiki}
                disabled={!newWiki.title?.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed text-black rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingWikiId ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </form>
        </div>
      </ModalBackdrop>
    )
  );
}

export function WikiDetailModal() {
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
    handleNoticeImagesPick, removeNoticeImage, moveNoticeImage, draggingNoticeImageId, setDraggingNoticeImageId,
    dragOverNoticeImageId, setDragOverNoticeImageId, handleAddNotice, handleOpenAddNotice, handleEditNotice, handleDeleteNotice,
    WIKI_FORM_DEFAULT, handleAddWiki, handleOpenAddWiki, handleOpenEditWiki, handleDeleteWiki,
    handleWikiImagePick, addWikiKeyRule, updateWikiKeyRule, removeWikiKeyRule, handleDeleteSetupType,
    handleDeleteConfluence, handleDeleteMistakeType, handleChangeSetupTypeColor, handleChangeConfluenceColor,
    handleChangeMistakeColor, handleDeleteEmotion, handleChangeEmotionColor, colorForEmotion, colorForMistake,
    handleFileUpload, handleAddImageUrl, handleRemoveImage, handleReorderImages, updateTimeframeNotes,
    exportBackup, importBackup,
  } = useAppContext();

    const entry = wikiEntries.find(w => w.id === viewWikiId) || null;
    if (!entry) return null;
    const style = getWikiCategoryStyle(entry.category);
    const hasContext = entry.bestSession || entry.timeframe || entry.contextNotes;
    return (
      <ModalBackdrop
        onClose={() => setViewWikiId(null)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Full high-res diagram */}
          <div className="relative aspect-video w-full bg-zinc-950 border-b border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {entry.imageUrl ? (
              <img
                src={entry.imageUrl}
                alt={entry.title}
                className="w-full h-full object-contain bg-black cursor-zoom-in"
                onClick={() => setLightboxImage(entry.imageUrl)}
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-zinc-700">
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs">No diagram yet</span>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-b border-zinc-800 flex items-start justify-between gap-3 flex-shrink-0">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{entry.title}</h3>
              {entry.category && (
                <span className={cn('inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium', style.badge, style.glow)}>
                  {entry.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => handleOpenEditWiki(entry)} className="p-1.5 text-zinc-400 hover:text-white transition-colors" title="Edit entry">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDeleteWiki(entry.id)} className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors" title="Delete entry">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewWikiId(null)} className="p-1.5 text-zinc-400 hover:text-white transition-colors" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Core Definition */}
            {entry.content && (
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Core Definition</p>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
              </div>
            )}

            {/* Key Rules / Conditions */}
            {entry.keyRules.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Key Rules / Conditions</p>
                <ul className="space-y-2">
                  {entry.keyRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-300 leading-relaxed">
                      <span className={cn('mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0', style.dot)} />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trading Context */}
            {hasContext && (
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Trading Context</p>
                <div className="grid grid-cols-2 gap-3">
                  {entry.bestSession && (
                    <div className="bg-zinc-800/50 border border-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Best Session</p>
                      <p className="text-sm text-white font-medium truncate">{entry.bestSession}</p>
                    </div>
                  )}
                  {entry.timeframe && (
                    <div className="bg-zinc-800/50 border border-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Timeframe</p>
                      <p className="text-sm text-white font-medium truncate">{entry.timeframe}</p>
                    </div>
                  )}
                </div>
                {entry.contextNotes && (
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{entry.contextNotes}</p>
                )}
              </div>
            )}

            {!entry.content && entry.keyRules.length === 0 && !hasContext && (
              <p className="text-sm text-zinc-600 italic">No additional details yet — click the edit icon to fill this entry in.</p>
            )}
          </div>
        </div>
      </ModalBackdrop>
    );
}

// ---- Delete confirmation — guards against an accidental click on the
// trash icon in the list item or detail panel wiping out a concept with no
// way back. Mirrors DeleteTradeConfirm's look (TradeModals.tsx).
export function DeleteWikiConfirm() {
  const { wikiPendingDelete, setWikiPendingDelete, confirmDeleteWiki } = useAppContext();

  if (!wikiPendingDelete) return null;

  const handleCancel = () => setWikiPendingDelete(null);

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
          <h3 className="text-lg font-bold text-white">Delete Entry</h3>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          Are you sure you want to delete this knowledge entry? This action cannot be undone.
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
            onClick={confirmDeleteWiki}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ---- Delete confirmation for a single Key Rules / Conditions row inside
// the Add/Edit Wiki modal's form. Stacks above AddWikiModal (z-[70] vs its
// z-50) same as DeleteWikiConfirm above, since it's a guard on an action
// that happens while that modal is open.
export function DeleteWikiRuleConfirm() {
  const { wikiRulePendingDeleteIndex, setWikiRulePendingDeleteIndex, confirmRemoveWikiKeyRule } = useAppContext();

  if (wikiRulePendingDeleteIndex === null) return null;

  const handleCancel = () => setWikiRulePendingDeleteIndex(null);

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
          <h3 className="text-lg font-bold text-white">Delete Rule</h3>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          Are you sure you want to remove this rule from the entry?
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
            onClick={confirmRemoveWikiKeyRule}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

