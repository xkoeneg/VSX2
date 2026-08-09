import type React from 'react';
import { useEffect, useRef, useState } from 'react';
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
  LogOut,
  User as UserIcon,
  type LucideIcon,
} from 'lucide-react';
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
import { supabase } from '../lib/supabaseClient';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useAppContext } from '../context/AppContext';
import { renderStatCard, renderAccountFilter, renderAccountTypeBadge, renderTradingAccountTypeBadge } from '../components/shared/RenderHelpers';

export function Sidebar({ isMobile }: { isMobile: boolean }) {
  const {
    view, setView, privacyMode, setPrivacyMode, theme, setTheme, mainScrollRef, isExportConfirmOpen,
    setIsExportConfirmOpen, sidebarCollapsed, setSidebarCollapsed, isSettingsModalOpen,
    setIsSettingsModalOpen, settingsModalTab, setSettingsModalTab, isMobileSidebarOpen,
    setIsMobileSidebarOpen, galleryView, setGalleryView, dbSearch, setDbSearch,
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

    const [authUser, setAuthUser] = useState<{ email: string | null; name: string | null; avatarUrl: string | null } | null>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Load the logged-in user and keep it in sync with auth state changes
    useEffect(() => {
      let isMounted = true;

      const mapUser = (u: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined) => {
        if (!u) return null;
        const metadata = (u.user_metadata ?? {}) as Record<string, unknown>;
        return {
          email: u.email ?? null,
          name: (metadata.full_name as string) || (metadata.name as string) || null,
          avatarUrl: (metadata.avatar_url as string) || (metadata.picture as string) || null,
        };
      };

      supabase.auth.getUser().then(({ data }) => {
        if (isMounted) setAuthUser(mapUser(data.user));
      });

      const { data: authListener }: { data: { subscription: any } } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          setAuthUser(mapUser(session?.user));
        }
      );

      return () => {
        isMounted = false;
        authListener?.subscription?.unsubscribe();
      };
    }, []);

    // Close the profile popover when clicking outside of it
    useEffect(() => {
      if (!isProfileMenuOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
          setIsProfileMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileMenuOpen]);

    const handleSignOut = async () => {
      setIsProfileMenuOpen(false);
      try {
        await supabase.auth.signOut();
      } finally {
        window.location.href = '/login';
      }
    };

    const displayName = authUser?.name || authUser?.email?.split('@')[0] || 'Account';
    const displayEmail = authUser?.email || '';

    const collapsed = !isMobile && sidebarCollapsed;
    return (
      <div className="flex flex-col h-full w-full justify-between px-3.5 py-4 select-none">
        {/* TOP GROUP: logo/header row + primary nav items, strictly stacked */}
        <div className="flex flex-col gap-1 w-full min-h-0">
          <div className={cn("pb-4 mb-2 border-b w-full", theme !== 'light' ? 'border-zinc-800' : 'border-zinc-200')}>
            <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "justify-between")}>
              <div className={cn("flex items-center gap-3 min-w-0", collapsed && "justify-center")}>
                <div className={cn(
                  "relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  theme !== 'light' ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border border-emerald-500/20' : 'bg-gradient-to-br from-zinc-100 to-zinc-200'
                )}>
                  <Activity className={cn(
                    "w-[18px] h-[18px]",
                    theme !== 'light' ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.55)]' : 'text-emerald-600'
                  )} />
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <h1 className={cn("font-bold text-lg uppercase tracking-wider leading-none truncate select-none", theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                      VSX
                    </h1>
                    <p className={cn("text-[10px] font-medium uppercase tracking-widest truncate mt-0.5 select-none", theme !== 'light' ? 'text-zinc-500' : 'text-zinc-500')}>
                      Trading Journal
                    </p>
                  </div>
                )}
              </div>
              {isMobile ? (
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Close menu"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors flex-shrink-0",
                    theme !== 'light' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(prev => !prev)}
                  title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors flex-shrink-0",
                    theme !== 'light' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  )}
                >
                  {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          <nav className="flex flex-col w-full overflow-y-auto overflow-x-hidden min-h-0">
            {[
              {
                header: 'TRADING',
                headerClassName: 'text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3.5 mt-6 mb-2 select-none',
                accentIcon: theme !== 'light' ? 'text-cyan-400/80' : 'text-cyan-600/80',
                accentIconActive: theme !== 'light' ? 'text-cyan-300' : 'text-cyan-600',
                activeBorder: 'border-cyan-400',
                activeBg: 'bg-cyan-500/10',
                items: [
                  { id: 'dashboard' as ViewType, icon: LayoutDashboard, label: 'Dashboard' },
                  { id: 'trades' as ViewType, icon: TrendingUp, label: 'Trade History' },
                  { id: 'calendar' as ViewType, icon: Calendar, label: 'Performance Calendar' },
                ],
              },
              {
                header: 'PROCESS',
                headerClassName: 'text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3.5 mt-6 mb-2 select-none',
                accentIcon: theme !== 'light' ? 'text-emerald-400/80' : 'text-emerald-600/80',
                accentIconActive: theme !== 'light' ? 'text-emerald-300' : 'text-emerald-600',
                activeBorder: 'border-emerald-400',
                activeBg: 'bg-emerald-500/10',
                items: [
                  { id: 'discipline' as ViewType, icon: Shield, label: 'Discipline Tracker' },
                  { id: 'playbook' as ViewType, icon: BookOpen, label: 'Rules Playbook' },
                  { id: 'lifeDiscipline' as ViewType, icon: Flame, label: 'Life Discipline Hub' },
                ],
              },
              {
                header: 'RESOURCES',
                headerClassName: 'text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3.5 mt-6 mb-2 select-none',
                accentIcon: theme !== 'light' ? 'text-purple-400/80' : 'text-purple-600/80',
                accentIconActive: theme !== 'light' ? 'text-purple-300' : 'text-purple-600',
                activeBorder: 'border-purple-400',
                activeBg: 'bg-purple-500/10',
                items: [
                  { id: 'notices' as ViewType, icon: FileText, label: 'Market Notices' },
                  { id: 'wiki' as ViewType, icon: Lightbulb, label: 'Knowledge Wiki' },
                ],
              },
            ].map((section, sectionIndex) => (
              <div
                key={section.header}
                className={cn(
                  'flex flex-col gap-1 w-full',
                  sectionIndex > 0 && (theme !== 'light' ? 'border-t border-zinc-800 pt-1' : 'border-t border-zinc-200 pt-1')
                )}
              >
                {!collapsed && (
                  <span className={section.headerClassName}>{section.header}</span>
                )}
                <div className="flex flex-col gap-1 w-full">
                  {section.items.map(item => {
                    const isActive = view === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          // NOTE: tradeSubView is deliberately NOT reset here.
                          // App.tsx defers `view` via useDeferredValue so the
                          // outgoing screen stays mounted an extra render
                          // while the next one's chunk loads. tradeSubView
                          // isn't deferred, so flipping it here would land
                          // in-between: TradesScreen still mounted (showing
                          // Database) but tradeSubView already 'overview' —
                          // a one-frame flash of the Overview sub-view right
                          // before the real unmount. TradesScreen resets its
                          // own tradeSubView in an unmount-cleanup effect
                          // instead, which only fires once it's actually
                          // gone, so there's nothing left on screen to flash.
                          setView(item.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          'w-full flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-lg border-l-4 transition-all text-sm select-none cursor-pointer',
                          collapsed && 'justify-center px-0 border-l-0',
                          isActive
                            ? cn(
                                section.activeBorder,
                                section.activeBg,
                                theme !== 'light' ? 'text-white font-medium' : 'text-zinc-900 font-medium'
                              )
                            : cn(
                                'border-transparent',
                                theme !== 'light' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                              )
                        )}
                      >
                        <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? section.accentIconActive : section.accentIcon)} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* BOTTOM GROUP: user profile section, pinned to the bottom */}
        <div className="relative mt-auto" ref={profileMenuRef}>
          {isProfileMenuOpen && (
            <div
              className={cn(
                'absolute bottom-full mb-2 rounded-lg border shadow-lg overflow-hidden z-50',
                collapsed ? 'left-0 w-48' : 'left-0 right-0',
                theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setIsSettingsModalOpen(true);
                  setIsMobileSidebarOpen(false);
                  setIsProfileMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors select-none cursor-pointer',
                  theme !== 'light' ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'
                )}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Settings</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors select-none cursor-pointer border-t',
                  theme !== 'light' ? 'text-red-400 hover:bg-zinc-800 border-zinc-800' : 'text-red-600 hover:bg-red-50 border-zinc-200'
                )}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Sign Out</span>
              </button>
            </div>
          )}

          <div
            onClick={() => setIsProfileMenuOpen(prev => !prev)}
            title={collapsed ? (displayEmail || displayName) : undefined}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer border-t select-none',
              theme !== 'light' ? 'border-white/5' : 'border-zinc-200',
              collapsed && 'justify-center px-0'
            )}
          >
            <div
              className={cn(
                'relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden',
                theme !== 'light' ? 'bg-zinc-800 border border-zinc-700' : 'bg-zinc-100 border border-zinc-200'
              )}
            >
              {authUser?.avatarUrl ? (
                <img src={authUser.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className={cn('w-4 h-4', theme !== 'light' ? 'text-zinc-400' : 'text-zinc-500')} />
              )}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-medium truncate select-none', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                  {displayName}
                </p>
                {displayEmail && (
                  <p className={cn('text-xs truncate select-none', theme !== 'light' ? 'text-zinc-500' : 'text-zinc-500')}>
                    {displayEmail}
                  </p>
                )}
              </div>
            )}

            {!collapsed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileMenuOpen(prev => !prev);
                }}
                title="Settings"
                className={cn(
                  'p-1.5 rounded-lg transition-colors flex-shrink-0',
                  theme !== 'light' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                )}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
}
