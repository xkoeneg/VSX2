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
import { PILLARS_PER_ROW_OPTIONS, RULE_ACCENT_PALETTE, RULE_BULLET_STYLES, RULE_EMOJI_OPTIONS, RULE_ICON_MAP, RULE_ICON_OPTIONS, RULE_PILLARS, RULE_SEVERITIES, RULE_SEVERITY_META, RULE_TEXT_SIZES, getAllPillarIds, getPillarMeta, getPillarShortLabel, getRuleAccent, getRuleIconComponent } from '../constants/rules';
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

export function AddRuleModal() {
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
    showAddRule && (
      <ModalBackdrop
        onClose={closeRuleModal}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-bold text-white truncate">{editingRuleId ? 'Edit Trading Rule' : 'Add Trading Rule'}</h3>
            <button onClick={closeRuleModal} className="p-1 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Pillar</label>
              <div className="grid grid-cols-3 gap-2">
                {getAllPillarIds(customPillars).map(pillar => {
                  const meta = getPillarMeta(pillar, customPillars);
                  const active = (newRule.pillar || 'risk') === pillar;
                  return (
                    <button
                      key={pillar}
                      type="button"
                      onClick={() => setNewRule(prev => ({ ...prev, pillar }))}
                      className={cn(
                        "flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-medium transition-colors",
                        active ? 'bg-white text-black border-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      )}
                    >
                      <meta.Icon className={cn("w-4 h-4", !active && meta.color)} strokeWidth={2} />
                      <span className="truncate">{meta.label.replace(' Rules', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Severity</label>
              <div className="grid grid-cols-3 gap-2">
                {RULE_SEVERITIES.map(severity => {
                  const meta = RULE_SEVERITY_META[severity];
                  const active = (newRule.severity || 'warning') === severity;
                  return (
                    <button
                      key={severity}
                      type="button"
                      onClick={() => setNewRule(prev => ({ ...prev, severity }))}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-medium transition-colors",
                        active ? meta.badge : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", meta.dot)} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notion-style icon & color picker */}
            <div className="relative">
              <label className="block text-sm text-zinc-400 mb-2">Icon &amp; Color</label>
              {(() => {
                const accent = getRuleAccent(newRule.color);
                const RuleIcon = getRuleIconComponent({ iconValue: newRule.iconValue, pillar: (newRule.pillar || 'risk') as RulePillar });
                return (
                  <button
                    type="button"
                    onClick={() => setShowRuleIconPicker(v => !v)}
                    className="w-full flex items-center gap-2.5 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-left hover:bg-zinc-750 hover:border-zinc-600 transition-colors"
                  >
                    <span className={cn("inline-flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0", accent.bg)}>
                      {newRule.iconKind === 'emoji' && newRule.iconValue
                        ? <span className="text-base leading-none">{newRule.iconValue}</span>
                        : <RuleIcon className={cn("w-4 h-4", accent.text)} strokeWidth={2.5} />}
                    </span>
                    <span className="text-sm text-white flex-1">Customize icon &amp; accent color</span>
                    <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform flex-shrink-0", showRuleIconPicker && "rotate-180")} />
                  </button>
                );
              })()}

              {showRuleIconPicker && (
                <div className="relative mt-2 bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-zinc-900/60 rounded-lg p-1">
                    {([
                      { id: 'emoji' as const, label: 'Emoji', Icon: Smile },
                      { id: 'icons' as const, label: 'Icons', Icon: Star },
                      { id: 'color' as const, label: 'Custom Color', Icon: Palette },
                    ]).map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setRuleIconPickerTab(tab.id)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                          ruleIconPickerTab === tab.id ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                        )}
                      >
                        <tab.Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {ruleIconPickerTab === 'emoji' && (
                    <div className="grid grid-cols-8 gap-1.5">
                      {RULE_EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewRule(prev => ({ ...prev, iconKind: 'emoji', iconValue: emoji }))}
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-md text-base transition-colors",
                            newRule.iconKind === 'emoji' && newRule.iconValue === emoji ? 'bg-zinc-600' : 'hover:bg-zinc-700'
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {ruleIconPickerTab === 'icons' && (
                    <div className="grid grid-cols-8 gap-1.5">
                      {RULE_ICON_OPTIONS.map(iconName => {
                        const IconComp = RULE_ICON_MAP[iconName];
                        const active = newRule.iconKind !== 'emoji' && newRule.iconValue === iconName;
                        return (
                          <button
                            key={iconName}
                            type="button"
                            title={iconName}
                            onClick={() => setNewRule(prev => ({ ...prev, iconKind: 'icon', iconValue: iconName }))}
                            className={cn(
                              "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
                              active ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                            )}
                          >
                            <IconComp className="w-4 h-4" strokeWidth={2} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {ruleIconPickerTab === 'color' && (
                    <div className="flex flex-wrap gap-2.5">
                      {RULE_ACCENT_PALETTE.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setNewRule(prev => ({ ...prev, color: c.id }))}
                          title={c.label}
                          className={cn(
                            "flex flex-col items-center gap-1.5 transition-transform",
                            newRule.color === c.id && "scale-105"
                          )}
                        >
                          <span className={cn(
                            "w-7 h-7 rounded-full",
                            c.dot,
                            newRule.color === c.id && cn("ring-2 ring-offset-2 ring-offset-zinc-800", c.ring)
                          )} />
                          <span className="text-[10px] text-zinc-400">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Rule Title</label>
              <input type="text" value={newRule.title || ''} onChange={(e) => setNewRule(prev => ({ ...prev, title: e.target.value }))} placeholder="Never Move Stop Loss" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-zinc-600" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Lesson Learned <span className="text-zinc-600">(shown as small muted subtext)</span></label>
              <textarea value={newRule.description || ''} onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))} placeholder="Moving SL cost me a $450 loss last Friday. Wait for the retest." rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-zinc-600 resize-none" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Category <span className="text-zinc-600">(optional label)</span></label>
              <input type="text" value={newRule.category || ''} onChange={(e) => setNewRule(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g. Prop Firm Rule" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-zinc-600" />
            </div>

            {/* Bullet type + text size customization */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">List Style</label>
                <div className="flex flex-col gap-1.5">
                  {RULE_BULLET_STYLES.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setNewRule(prev => ({ ...prev, bulletStyle: b.id }))}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors text-left",
                        (newRule.bulletStyle || 'bullet') === b.id ? 'bg-white text-black border-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      )}
                    >
                      {b.id === 'bullet' && '•'}
                      {b.id === 'number' && '1.'}
                      {b.id === 'icon' && <Star className="w-3 h-3" />}
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Text Size</label>
                <div className="flex flex-col gap-1.5">
                  {RULE_TEXT_SIZES.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setNewRule(prev => ({ ...prev, textSize: s.id }))}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border font-medium transition-colors text-left",
                        s.id === 'large' ? 'text-sm' : 'text-xs',
                        (newRule.textSize || 'normal') === s.id ? 'bg-white text-black border-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="button" onClick={handleSaveRule} className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-medium transition-colors">{editingRuleId ? 'Save Changes' : 'Add Rule'}</button>
          </div>
        </div>
      </ModalBackdrop>
    )
  );
}

export function ManageRulesModal() {
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

  const renderManageRulePillarSection = (pillar: RulePillar) => {
    const meta = getPillarMeta(pillar, customPillars);
    const pillarRules = rules.filter(r => r.pillar === pillar);
    const isCustom = !RULE_PILLARS.includes(pillar);
    return (
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <meta.Icon className={cn("w-4 h-4 flex-shrink-0", meta.color)} strokeWidth={2} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 break-words leading-snug">{getPillarShortLabel(pillar, customPillars)}</h4>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => handleAddDivider(pillar)}
              title="Add divider"
              className="p-0.5 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openAddRuleModal(pillar)}
              title={`Add ${meta.label}`}
              className="p-0.5 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {isCustom && (
              <button
                onClick={() => setPillarPendingDelete(pillar)}
                title="Delete pillar"
                className="p-0.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {pillarRules.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No mandates set.</p>
        ) : (
          <div className="space-y-3">
            {pillarRules.map(rule => {
              if (rule.itemType === 'divider') {
                return (
                  <div key={rule.id} className="group flex items-center gap-2 py-0.5">
                    <span className="flex-1 h-px bg-zinc-800" />
                    <input
                      type="text"
                      value={rule.dividerLabel || ''}
                      onChange={(e) => handleUpdateDividerLabel(rule.id, e.target.value)}
                      placeholder="Section label"
                      className="w-24 bg-transparent text-center text-[9px] font-bold uppercase tracking-wider text-zinc-500 placeholder-zinc-700 focus:outline-none focus:text-white"
                    />
                    <span className="flex-1 h-px bg-zinc-800" />
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-0.5 rounded text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              }
              const severityMeta = RULE_SEVERITY_META[rule.severity];
              const accent = getRuleAccent(rule.color);
              const RuleIcon = getRuleIconComponent(rule, customPillars);
              return (
                <div key={rule.id} className="group flex items-start gap-2.5">
                  <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 mt-0.5", accent.bg)}>
                    {rule.iconKind === 'emoji' && rule.iconValue
                      ? <span className="text-[13px] leading-none">{rule.iconValue}</span>
                      : <RuleIcon className={cn("w-3.5 h-3.5", accent.text)} strokeWidth={2.5} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center items-start gap-1 sm:gap-1.5">
                          <h5 className="text-sm font-bold text-white whitespace-normal break-words leading-snug">{rule.title}</h5>
                          <span className={cn("text-[9px] px-1 py-0.5 rounded font-semibold uppercase tracking-wide leading-none flex-shrink-0 whitespace-normal break-words", severityMeta.badge)}>{severityMeta.label}</span>
                        </div>
                        {rule.description && <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed whitespace-normal break-words">{rule.description}</p>}
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditRuleModal(rule)} className="p-0.5 rounded text-zinc-500 hover:text-white">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteRule(rule.id)} className="p-0.5 rounded text-zinc-500 hover:text-rose-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
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
    showManageRulesModal && (
      <ModalBackdrop
        onClose={() => setShowManageRulesModal(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" strokeWidth={2} />
              <h3 className="text-lg font-bold text-white truncate">Manage Rules</h3>
            </div>
            <button onClick={() => setShowManageRulesModal(false)} className="p-1 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Layout controls — pillars-per-row on the main card, plus adding new pillars */}
          <div className="px-6 py-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <label htmlFor="pillars-per-row" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 whitespace-nowrap">
                Pillars Per Row
              </label>
              <select
                id="pillars-per-row"
                value={pillarsPerRow}
                onChange={(e) => setPillarsPerRow(Number(e.target.value) as PillarsPerRow)}
                className="text-xs font-semibold rounded-lg pl-2.5 pr-7 py-2 border bg-zinc-800 border-zinc-700 text-white focus:outline-none cursor-pointer"
              >
                {PILLARS_PER_ROW_OPTIONS.map(n => (
                  <option key={n} value={n}>{n} / row</option>
                ))}
              </select>
            </div>
            <button
              onClick={openAddPillarModal}
              className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
              Add Pillar
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {getAllPillarIds(customPillars).map(pillar => (
                <div className="min-w-0" key={pillar}>
                  {renderManageRulePillarSection(pillar)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModalBackdrop>
    )
  );
}

export function AddPillarModal() {
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
    showAddPillarModal && (
      <ModalBackdrop
        onClose={closeAddPillarModal}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center overflow-y-auto p-4 py-8"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white truncate">Add Pillar</h3>
            <button onClick={closeAddPillarModal} className="p-1 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Name</label>
              <input
                type="text"
                value={newPillar.label || ''}
                onChange={(e) => setNewPillar(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Capital & Execution"
                autoFocus
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {RULE_ACCENT_PALETTE.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setNewPillar(prev => ({ ...prev, color: c.id }))}
                    title={c.label}
                    className={cn(
                      "w-7 h-7 rounded-full flex-shrink-0 transition-transform",
                      c.dot,
                      (newPillar.color || 'indigo') === c.id && cn("ring-2 ring-offset-2 ring-offset-zinc-900 scale-110", c.ring)
                    )}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Icon</label>
              <div className="grid grid-cols-7 gap-1.5">
                {RULE_ICON_OPTIONS.map(iconName => {
                  const Icon = RULE_ICON_MAP[iconName];
                  const active = (newPillar.icon || 'Layers') === iconName;
                  const accent = getRuleAccent(newPillar.color);
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewPillar(prev => ({ ...prev, icon: iconName }))}
                      title={iconName}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                        active ? accent.bg : 'hover:bg-zinc-800'
                      )}
                    >
                      <Icon className={cn("w-4 h-4", active ? accent.text : 'text-zinc-500')} strokeWidth={2} />
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddPillar}
              disabled={!(newPillar.label || '').trim()}
              className="w-full py-2.5 bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-white text-black rounded-lg text-sm font-medium transition-colors"
            >
              Add Pillar
            </button>
          </div>
        </div>
      </ModalBackdrop>
    )
  );
}

export function DeletePillarConfirm() {
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

    if (!pillarPendingDelete) return null;
    const pillar = customPillars.find(p => p.id === pillarPendingDelete);
    const ruleCount = rules.filter(r => r.pillar === pillarPendingDelete).length;
    return (
      <ModalBackdrop
        onClose={() => setPillarPendingDelete(null)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white truncate">Delete "{pillar?.label || 'this pillar'}"?</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            This permanently deletes the pillar{ruleCount > 0 ? ` and all ${ruleCount} rule${ruleCount > 1 ? 's' : ''}/divider${ruleCount > 1 ? 's' : ''} filed under it` : ''}. This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setPillarPendingDelete(null)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => pillarPendingDelete && handleDeletePillar(pillarPendingDelete)}
              className="px-4 py-2 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </ModalBackdrop>
    );
}

