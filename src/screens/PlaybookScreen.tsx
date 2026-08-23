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
import { PILLAR_GRID_COLS_CLASS, RULE_SEVERITY_META, getAllPillarIds, getPillarMeta, getPillarShortLabel, getRuleAccent, getRuleIconComponent } from '../constants/rules';
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

export function PlaybookScreen() {
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

  const renderRulePillarColumn = (pillar: RulePillar) => {
    const meta = getPillarMeta(pillar, customPillars);
    const pillarRules = rules.filter(r => r.pillar === pillar);
    let ruleNumber = 0; // numbering counter that skips dividers
    return (
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-4 min-w-0">
          <meta.Icon className={cn("w-5 h-5 flex-shrink-0", meta.color)} strokeWidth={2} />
          <h4 className={cn("text-base font-semibold uppercase tracking-wide break-words leading-snug", tc.text)}>{getPillarShortLabel(pillar, customPillars)}</h4>
        </div>

        {pillarRules.length === 0 ? (
          <p className={cn("text-xs italic", tc.textMuted)}>No mandates set.</p>
        ) : (
          <div className="space-y-4">
            {pillarRules.map((rule) => {
              if (rule.itemType === 'divider') {
                return (
                  <div key={rule.id} className="flex items-center gap-2 py-0.5">
                    <span className={cn("flex-1 h-px", theme !== 'light' ? 'bg-white/10' : 'bg-zinc-200')} />
                    {rule.dividerLabel && (
                      <span className={cn("text-[10px] font-semibold uppercase tracking-wider flex-shrink-0", tc.textMuted)}>{rule.dividerLabel}</span>
                    )}
                    <span className={cn("flex-1 h-px", theme !== 'light' ? 'bg-white/10' : 'bg-zinc-200')} />
                  </div>
                );
              }
              const index = ruleNumber++;
              const violations = ruleViolationCounts[rule.id] || 0;
              const severityMeta = RULE_SEVERITY_META[rule.severity];
              const accent = getRuleAccent(rule.color);
              const RuleIcon = getRuleIconComponent(rule, customPillars);
              const bulletStyle = rule.bulletStyle || 'bullet';
              const large = rule.textSize === 'large';
              return (
                <div key={rule.id} className="flex items-start gap-2.5 min-w-0">
                  {/* Bullet / number / icon-badge prefix */}
                  {bulletStyle === 'icon' ? (
                    <span className={cn("inline-flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5", accent.bg)}>
                      {rule.iconKind === 'emoji' && rule.iconValue
                        ? <span className="text-[13px] leading-none">{rule.iconValue}</span>
                        : <RuleIcon className={cn("w-4 h-4", accent.text)} strokeWidth={2.5} />}
                    </span>
                  ) : bulletStyle === 'number' ? (
                    <span className={cn("flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono font-semibold flex-shrink-0 mt-0.5", accent.bg, accent.text)}>
                      {index + 1}
                    </span>
                  ) : (
                    <span className={cn("mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0", accent.dot)} />
                  )}

                  <div className="min-w-0 flex-1 leading-relaxed">
                    <div className="flex flex-col sm:flex-row sm:items-center items-start gap-1 sm:gap-1.5">
                      <h5 className={cn("font-semibold whitespace-normal break-words leading-snug", tc.text, large ? "text-base" : "text-sm")}>{rule.title}</h5>
                      <span className={cn("text-[10px] px-1 py-0.5 rounded font-semibold uppercase tracking-wide leading-none flex-shrink-0 whitespace-normal break-words", severityMeta.badge)}>{severityMeta.label}</span>
                    </div>
                    {rule.description && (
                      <p className={cn("mt-0.5 leading-relaxed whitespace-normal break-words", tc.textMuted, large ? "text-sm" : "text-xs")}>{rule.description}</p>
                    )}
                    {violations > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono mt-1.5 px-1 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold">
                        <AlertTriangle className="w-2.5 h-2.5" strokeWidth={2} /> {violations}x
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

    return (
      <div className="space-y-6 min-w-0">
        {/* HEADER */}
        <PageHeader
          title="Rules & Strategy Playbook"
          description="Core execution mandates and strategy models"
        />

        {/* TOP ROW: STRATEGY MODELS + DAILY CREED — equal-height 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-w-0">

          {/* SECTION 1: ACTIVE STRATEGY MODELS — wrapped in a system card container to match other dashboard widgets */}
          <div className="min-w-0 lg:col-span-2 h-full">
            <div className={cn(
              "h-full flex flex-col rounded-xl p-4 border",
              theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
            )}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className={cn("text-sm font-semibold flex items-center gap-1.5 truncate", tc.text)}>
                  <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={2} />
                  STRATEGY MODELS
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {strategies.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => canScrollLeftStrategy && scrollStrategyCarousel('left')}
                        title="Scroll left"
                        disabled={!canScrollLeftStrategy}
                        aria-disabled={!canScrollLeftStrategy}
                        className={cn(
                          "p-1.5 rounded-lg border transition-colors",
                          canScrollLeftStrategy
                            ? cn(tc.btnSecondary, 'cursor-pointer')
                            : theme !== 'light'
                              ? 'text-white/20 bg-transparent border-white/5 cursor-not-allowed pointer-events-none'
                              : 'text-zinc-300 bg-transparent border-zinc-100 cursor-not-allowed pointer-events-none'
                        )}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => canScrollRightStrategy && scrollStrategyCarousel('right')}
                        title="Scroll right"
                        disabled={!canScrollRightStrategy}
                        aria-disabled={!canScrollRightStrategy}
                        className={cn(
                          "p-1.5 rounded-lg border transition-colors",
                          canScrollRightStrategy
                            ? cn(tc.btnSecondary, 'cursor-pointer')
                            : theme !== 'light'
                              ? 'text-white/20 bg-transparent border-white/5 cursor-not-allowed pointer-events-none'
                              : 'text-zinc-300 bg-transparent border-zinc-100 cursor-not-allowed pointer-events-none'
                        )}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button onClick={openAddStrategyModal} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors flex-shrink-0", tc.btnSecondary)}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Strategy</span>
                  </button>
                </div>
              </div>

              {strategies.length === 0 ? (
                <button
                  onClick={openAddStrategyModal}
                  className={cn("w-full flex-1 mt-4 flex flex-col items-center justify-center gap-2 py-12 rounded-xl border border-dashed transition-all", tc.border, tc.textMuted, theme !== 'light' ? 'hover:text-zinc-300 hover:border-zinc-500' : 'hover:text-zinc-600 hover:border-zinc-400')}
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm">+ Add Your First A+ Trading Model</span>
                </button>
              ) : (
                <>
                <div className="overflow-hidden flex-1 mt-4">
                <div
                  ref={strategyCarouselRef}
                  className="custom-slider-scrollbar scrollbar-none flex flex-nowrap overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 h-full"
                >
                  {strategies.map(strategy => (
                    <button
                      key={strategy.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggingStrategyId(strategy.id);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', strategy.id);
                      }}
                      onDragEnd={() => { setDraggingStrategyId(null); setDragOverStrategyId(null); }}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                      onDragEnter={() => setDragOverStrategyId(strategy.id)}
                      onDragLeave={() => setDragOverStrategyId(prev => (prev === strategy.id ? null : prev))}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/plain');
                        moveStrategy(draggedId, strategy.id);
                        setDraggingStrategyId(null);
                        setDragOverStrategyId(null);
                      }}
                      onClick={() => setViewStrategyId(strategy.id)}
                      title="Drag to reorder — click to view"
                      className={cn(
                        "group snap-start w-[calc((100%-2*1rem)/3)] min-w-[calc((100%-2*1rem)/3)] shrink-0 h-full flex flex-col border rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 ease-out text-left",
                        theme !== 'light' ? 'bg-zinc-900/40' : 'bg-white',
                        dragOverStrategyId === strategy.id
                          ? "border-indigo-400/80 ring-2 ring-indigo-400/40"
                          : theme !== 'light' ? "border-zinc-800/80 hover:border-zinc-700" : "border-zinc-200 hover:border-zinc-300",
                        draggingStrategyId === strategy.id && "opacity-40"
                      )}
                    >
                      <div className={cn("aspect-video flex items-center justify-center relative overflow-hidden flex-shrink-0", tc.bgSecondary)}>
                        {strategy.images[0]?.url ? (
                          <img
                            src={strategy.images[0].url}
                            alt={`${strategy.title} A+ example`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                          />
                        ) : (
                          <div className={cn("flex flex-col items-center gap-1.5", tc.textMuted)}>
                            <ImageIcon className="w-7 h-7" />
                            <span className="text-[10px]">No image</span>
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1 py-0.5 rounded bg-zinc-950/70 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <GripVertical className="w-3 h-3" />
                        </div>
                      </div>
                      <div className="p-3.5 min-w-0 flex-1 flex flex-col">
                        <h4 className={cn("font-semibold truncate tracking-tight text-sm min-w-0", tc.text)}>{strategy.title}</h4>
                      </div>
                    </button>
                  ))}
                </div>
                </div>
                </>
              )}
            </div>
          </div>

          {/* SECTION 1b: DAILY TRADING CREED / OPERATING MANIFESTO — quote card, matches Strategy Models column height */}
          <div className="min-w-0 lg:col-span-1 h-full">
            <div
              className="h-full flex flex-col rounded-xl p-6 relative overflow-hidden border border-emerald-500/20 backdrop-blur-sm"
              style={{
                background: 'radial-gradient(120% 100% at 100% 0%, rgba(16,185,129,0.16) 0%, rgba(8,145,178,0.08) 35%, rgba(15,15,20,0.92) 65%), linear-gradient(160deg, rgba(24,25,32,0.95), rgba(9,10,14,0.98))',
              }}
            >
              {/* Faint oversized quote-mark watermark, top-right corner */}
              <Quote className="absolute -top-4 -right-4 w-28 h-28 text-emerald-400/10 pointer-events-none select-none" strokeWidth={1} fill="currentColor" />

              {/* Header bar: icon + label on the left, Edit + Shuffle on the right */}
              <div className="relative flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm leading-none" aria-hidden="true">📜</span>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 truncate">Daily Trading Creed</h3>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={openCreedEditor}
                    title="Edit quote"
                    aria-label="Edit quote"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <span aria-hidden="true">✏️</span>
                  </button>
                  <button
                    type="button"
                    onClick={shuffleDailyCreed}
                    title="Shuffle quote"
                    aria-label="Shuffle quote"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                  >
                    <span aria-hidden="true">🎲</span>
                  </button>
                </div>
              </div>

              {isEditingCreed ? (
                <div className="relative space-y-2.5 flex-1 flex flex-col">
                  <textarea
                    value={creedDraftText}
                    onChange={(e) => setCreedDraftText(e.target.value)}
                    rows={4}
                    autoFocus
                    className="w-full flex-1 bg-zinc-950/60 border border-emerald-500/20 rounded-lg p-3 text-sm italic text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                    placeholder="Write today's trading creed..."
                  />
                  <input
                    type="text"
                    value={creedDraftTag}
                    onChange={(e) => setCreedDraftTag(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    placeholder="Tag, e.g. Rule #0: Mindset First"
                  />
                  <div className="flex items-center justify-between gap-2">
                    {isCurrentCreedCustom ? (
                      <button
                        type="button"
                        onClick={deleteCurrentCreedQuote}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    ) : <span />}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingCreed(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveCreedEdit}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative flex-1 flex flex-col justify-center gap-3">
                  <p className="text-[20px] sm:text-[22px] leading-snug italic font-bold text-white/95">
                    "{renderCreedQuoteText(currentCreedQuote.text)}"
                  </p>
                  <p className="text-xs text-zinc-500 text-right">
                    — <span className="text-zinc-400 font-medium">{currentCreedQuote.tag}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HORIZONTAL PRE-SESSION PROTOCOL STRIP — full width, sits above Trading Rules */}
        <div className={cn(
          "relative overflow-hidden min-w-0 border rounded-xl px-5 py-4 space-y-3 transition-colors duration-300 select-none",
          theme !== 'light'
            ? 'bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-900/60 border-zinc-800'
            : 'bg-gradient-to-br from-white via-zinc-50 to-zinc-100 border-zinc-200'
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] via-transparent to-emerald-500/[0.05] pointer-events-none" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <ListChecks className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={2} />
              <h3 className={cn("text-xs font-semibold uppercase tracking-wider whitespace-nowrap", tc.textMuted)}>Pre-Session Protocol</h3>
              <span className={cn(
                "text-[11px] font-mono font-semibold tabular-nums px-2 py-0.5 rounded-full border flex-shrink-0 whitespace-nowrap",
                preSessionCompletedCount === PRE_SESSION_CHECKLIST_ITEMS.length
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : cn(tc.bgSecondary, tc.textMuted, theme !== 'light' ? 'border-zinc-700/50' : 'border-zinc-200')
              )}>
                {preSessionCompletedCount}/{PRE_SESSION_CHECKLIST_ITEMS.length} Ready
              </span>
              {preSessionCompletedCount === PRE_SESSION_CHECKLIST_ITEMS.length && (
                <button
                  type="button"
                  onClick={resetPreSessionChecklist}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {PRE_SESSION_CHECKLIST_ITEMS.map(item => {
                const checked = !!preSessionChecklist[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePreSessionItem(item.id)}
                    className="flex items-center gap-2.5 group cursor-pointer select-none"
                  >
                    <span className={cn(
                      "flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer select-none",
                      checked ? "bg-emerald-500 border-emerald-500" : cn("bg-transparent", tc.borderSecondary, theme !== 'light' ? 'group-hover:border-zinc-400' : 'group-hover:border-zinc-500')
                    )}>
                      {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />}
                    </span>
                    <span className={cn(
                      "text-xs font-medium whitespace-nowrap transition-colors cursor-pointer select-none",
                      checked ? cn(tc.textMuted, "line-through") : cn(tc.textSecondary, theme !== 'light' ? 'group-hover:text-white' : 'group-hover:text-zinc-900')
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className={cn("relative w-full h-2 rounded-full overflow-hidden", tc.bgSecondary)}>
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(preSessionCompletedCount / PRE_SESSION_CHECKLIST_ITEMS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* SECTION 2: TRADING CHARTER & MANDATES — single unified, read-only card */}
        <div className={cn(
          "min-w-0 rounded-xl p-4 border",
          theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
        )}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className={cn("text-sm font-semibold flex items-center gap-1.5 truncate", tc.text)}>
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={2} />
              TRADING RULES
            </h3>
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <button
                onClick={() => setShowManageRulesModal(true)}
                className={cn("inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors", tc.btnSecondary)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" strokeWidth={2} />
                Manage Rules
              </button>
            </div>
          </div>

          <div className={cn("grid gap-x-6 gap-y-8 w-full mt-4", PILLAR_GRID_COLS_CLASS[pillarsPerRow])}>
            {getAllPillarIds(customPillars).map(pillar => (
              <div className="min-w-0" key={pillar}>
                {renderRulePillarColumn(pillar)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
}
