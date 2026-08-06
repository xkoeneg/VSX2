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

    // Grouped by category (fixed order) so the whole library reads top to
    // bottom on one page — no filter buttons, no clicking to switch views.
    // Any entry with a category outside the 4 fixed ones still shows up
    // under an "Other" section instead of getting hidden.
    const groupedWikiSections = [...WIKI_CATEGORIES, 'Other'].map(cat => ({
      category: cat,
      entries: cat === 'Other'
        ? wikiEntries.filter(e => !WIKI_CATEGORIES.includes(e.category as WikiCategory))
        : wikiEntries.filter(e => e.category === cat),
    })).filter(section => section.entries.length > 0);

    const renderWikiCard = (entry: WikiEntry) => {
      const style = getWikiCategoryStyle(entry.category);
      const visibleRules = entry.keyRules.slice(0, 4);
      const extraRuleCount = entry.keyRules.length - visibleRules.length;
      const executionTag = [entry.timeframe, entry.bestSession].filter(Boolean).join(' • ');
      return (
        <div
          key={entry.id}
          onClick={() => setViewWikiId(entry.id)}
          className={cn(
            'group min-w-0 bg-[#111113] border rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all hover:-translate-y-0.5',
            'border-zinc-800/80 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40'
          )}
        >
          {/* Live image preview container (~192px) */}
          <div className="relative h-[188px] w-full flex-shrink-0 bg-zinc-950 border-b border-zinc-800/80 overflow-hidden">
            {entry.imageUrl ? (
              <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-zinc-700">
                <ImageIcon className="w-6 h-6" />
                <span className="text-[11px]">No diagram yet</span>
              </div>
            )}
            {/* Category badge overlaid on the image, top-left, with a colored glow */}
            {entry.category && (
              <span className={cn('absolute top-2.5 left-2.5 text-[10px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm', style.badge, style.glow)}>
                {entry.category}
              </span>
            )}
            {/* Edit / Delete — visible on hover, top-right */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenEditWiki(entry); }}
                className="p-1.5 rounded-md bg-black/60 backdrop-blur-sm text-zinc-300 hover:text-white transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteWiki(entry.id); }}
                className="p-1.5 rounded-md bg-black/60 backdrop-blur-sm text-zinc-300 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* gradient fade so the image blends into the card body */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111113] to-transparent pointer-events-none" />
          </div>

          {/* Content — header, rules checklist, execution context — all
              visible right here, nothing hidden behind another click */}
          <div className="p-4 flex flex-col gap-3 min-w-0 flex-1">
            <h3 className="font-bold text-white text-[15px] leading-snug">{entry.title}</h3>

            {entry.content && (
              <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{entry.content}</p>
            )}

            {/* Core Rules / Criteria checklist */}
            {visibleRules.length > 0 && (
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
            )}

            {/* Execution Context tag — pinned to the bottom of the card */}
            <div className="mt-auto pt-1">
              {executionTag ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  {executionTag}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-zinc-900/60 border border-zinc-800/60 text-zinc-600 italic">
                  No execution context set
                </span>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-8 min-w-0">
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

        {/* EVERYTHING ON ONE PAGE — grouped by category as plain section
            labels (not buttons/tabs), so nothing needs to be clicked to
            bring the rest of the library into view; just scroll. */}
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

        {wikiEntries.length === 0 && (
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
        )}
      </div>
    );
}
