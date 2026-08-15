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
  type LucideIcon,
} from 'lucide-react';
import type React from 'react';
import { lazy, Suspense, useDeferredValue, useEffect, useState, type ComponentType } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { cn } from './utils/format';
import { Sidebar } from './components/Sidebar';
import { NotificationBell } from './components/shared/NotificationBell';
import { LoginPage } from './components/LoginPage';
import { PreviewScreen } from './screens/PreviewScreen';

// ============================================================================
// Code splitting: screens & modals
// ----------------------------------------------------------------------------
// Only one screen is ever mounted at a time (see the `view === '...'` switch
// below), and at most a handful of modals are open at once — but before this
// change every screen and every modal shipped in the same JS bundle the app
// downloads and parses before it can paint anything. Converting them to
// React.lazy() means each one becomes its own chunk, fetched on first use
// and cached after that, which shrinks the initial bundle substantially and
// gets the first paint on screen faster.
//
// These are named exports (not default), so `lazy()` — which requires a
// default export — is fed a tiny adapter that resolves to `{ default }`.
// This is a load-time transform only; every component's props/behavior are
// completely unchanged.
// ============================================================================
function lazyNamed<T extends ComponentType<any>>(
  factory: () => Promise<Record<string, unknown>>,
  exportName: string,
): React.LazyExoticComponent<T> {
  return lazy(() => factory().then(m => ({ default: m[exportName] as T })));
}

const DashboardScreen = lazyNamed<typeof import('./screens/DashboardScreen').DashboardScreen>(() => import('./screens/DashboardScreen'), 'DashboardScreen');
const TradesScreen = lazyNamed<typeof import('./screens/TradesScreen').TradesScreen>(() => import('./screens/TradesScreen'), 'TradesScreen');
const DisciplineScreen = lazyNamed<typeof import('./screens/DisciplineScreen').DisciplineScreen>(() => import('./screens/DisciplineScreen'), 'DisciplineScreen');
const LifeDisciplineScreen = lazyNamed<typeof import('./screens/LifeDisciplineScreen').LifeDisciplineScreen>(() => import('./screens/LifeDisciplineScreen'), 'LifeDisciplineScreen');
const PlaybookScreen = lazyNamed<typeof import('./screens/PlaybookScreen').PlaybookScreen>(() => import('./screens/PlaybookScreen'), 'PlaybookScreen');
const NoticesScreen = lazyNamed<typeof import('./screens/NoticesScreen').NoticesScreen>(() => import('./screens/NoticesScreen'), 'NoticesScreen');
const WikiScreen = lazyNamed<typeof import('./screens/WikiScreen').WikiScreen>(() => import('./screens/WikiScreen'), 'WikiScreen');
const CalendarScreen = lazyNamed<typeof import('./screens/CalendarScreen').CalendarScreen>(() => import('./screens/CalendarScreen'), 'CalendarScreen');

const SettingsModal = lazyNamed<typeof import('./modals/SettingsModal').SettingsModal>(() => import('./modals/SettingsModal'), 'SettingsModal');
const DayDetailsModal = lazyNamed<typeof import('./modals/LifeDisciplineModals').DayDetailsModal>(() => import('./modals/LifeDisciplineModals'), 'DayDetailsModal');
const ChallengeConfigModal = lazyNamed<typeof import('./modals/LifeDisciplineModals').ChallengeConfigModal>(() => import('./modals/LifeDisciplineModals'), 'ChallengeConfigModal');
const DisciplinePsychologyReviewModal = lazyNamed<typeof import('./modals/DisciplineReviewModals').DisciplinePsychologyReviewModal>(() => import('./modals/DisciplineReviewModals'), 'DisciplinePsychologyReviewModal');
const RuleAdherenceReviewModal = lazyNamed<typeof import('./modals/DisciplineReviewModals').RuleAdherenceReviewModal>(() => import('./modals/DisciplineReviewModals'), 'RuleAdherenceReviewModal');
const TradeDetailModal = lazyNamed<typeof import('./modals/TradeModals').TradeDetailModal>(() => import('./modals/TradeModals'), 'TradeDetailModal');
const ExpandGalleryModal = lazyNamed<typeof import('./modals/TradeModals').ExpandGalleryModal>(() => import('./modals/TradeModals'), 'ExpandGalleryModal');
const AccountModal = lazyNamed<typeof import('./modals/TradeModals').AccountModal>(() => import('./modals/TradeModals'), 'AccountModal');
const AddTradeModal = lazyNamed<typeof import('./modals/TradeModals').AddTradeModal>(() => import('./modals/TradeModals'), 'AddTradeModal');
const EditTradeModal = lazyNamed<typeof import('./modals/TradeModals').EditTradeModal>(() => import('./modals/TradeModals'), 'EditTradeModal');
const DeleteTradeConfirm = lazyNamed<typeof import('./modals/TradeModals').DeleteTradeConfirm>(() => import('./modals/TradeModals'), 'DeleteTradeConfirm');
const DeleteAccountConfirm = lazyNamed<typeof import('./modals/TradeModals').DeleteAccountConfirm>(() => import('./modals/TradeModals'), 'DeleteAccountConfirm');
const LightboxModal = lazyNamed<typeof import('./modals/TradeModals').LightboxModal>(() => import('./modals/TradeModals'), 'LightboxModal');
const AddRuleModal = lazyNamed<typeof import('./modals/RuleModals').AddRuleModal>(() => import('./modals/RuleModals'), 'AddRuleModal');
const ManageRulesModal = lazyNamed<typeof import('./modals/RuleModals').ManageRulesModal>(() => import('./modals/RuleModals'), 'ManageRulesModal');
const AddPillarModal = lazyNamed<typeof import('./modals/RuleModals').AddPillarModal>(() => import('./modals/RuleModals'), 'AddPillarModal');
const DeletePillarConfirm = lazyNamed<typeof import('./modals/RuleModals').DeletePillarConfirm>(() => import('./modals/RuleModals'), 'DeletePillarConfirm');
const AddStrategyModal = lazyNamed<typeof import('./modals/StrategyModals').AddStrategyModal>(() => import('./modals/StrategyModals'), 'AddStrategyModal');
const DeleteStepConfirm = lazyNamed<typeof import('./modals/StrategyModals').DeleteStepConfirm>(() => import('./modals/StrategyModals'), 'DeleteStepConfirm');
const StrategyDetailModal = lazyNamed<typeof import('./modals/StrategyModals').StrategyDetailModal>(() => import('./modals/StrategyModals'), 'StrategyDetailModal');
const DeleteStrategyConfirm = lazyNamed<typeof import('./modals/StrategyModals').DeleteStrategyConfirm>(() => import('./modals/StrategyModals'), 'DeleteStrategyConfirm');
const AddNoticeModal = lazyNamed<typeof import('./modals/NoticeWikiModals').AddNoticeModal>(() => import('./modals/NoticeWikiModals'), 'AddNoticeModal');
const DeleteNoticeStepConfirm = lazyNamed<typeof import('./modals/NoticeWikiModals').DeleteNoticeStepConfirm>(() => import('./modals/NoticeWikiModals'), 'DeleteNoticeStepConfirm');
const AddWikiModal = lazyNamed<typeof import('./modals/NoticeWikiModals').AddWikiModal>(() => import('./modals/NoticeWikiModals'), 'AddWikiModal');
const WikiDetailModal = lazyNamed<typeof import('./modals/NoticeWikiModals').WikiDetailModal>(() => import('./modals/NoticeWikiModals'), 'WikiDetailModal');

// NOTE: there used to be a `ScreenLoadingFallback` pulse spinner rendered
// here as the Suspense fallback. It's gone — see the `deferredView` +
// `fallback={null}` combo below for why removing it (rather than just
// making it prettier) is the actual fix for the tab-switch flicker.

// ============================================================================
// AppShell renders the page chrome (sidebar / main content switch / all
// modals) exactly as the original App() component's final `return (...)`
// did — just reading state from context instead of closures now.
// ============================================================================
function AppShell() {
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
    exportBackup, importBackup, session, authLoading, signOutUser,
  } = useAppContext();

  // Tab-switch flicker fix: `deferredView` lags one render behind `view`
  // whenever swapping to it would suspend (i.e. the target screen's lazy
  // chunk hasn't finished loading yet). React keeps rendering the currently
  // mounted screen — matching the stale `deferredView` — instead of
  // unmounting it in favor of the Suspense fallback, so the old screen
  // just stays on-screen for that last handful of milliseconds and then
  // swaps directly to the new one once it's ready. No spinner ever
  // flashes in between. Once the chunk is cached (which happens after the
  // very first visit to a given tab), this gap is imperceptible.
  const deferredView = useDeferredValue(view);

  return (
    <div className={cn(
      "h-screen w-full flex overflow-hidden",
      theme === 'light' ? 'bg-zinc-50 text-zinc-900' : 'bg-[#0b0c0e] text-white',
      theme === 'light' && 'theme-light-fix',
      theme === 'minecraft' && 'theme-minecraft'
    )}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        *::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          scroll-behavior: smooth;
          /* Matches the current theme's root background so mobile
             elastic/rubber-band overscroll never reveals a mismatched
             canvas underneath tall pages (e.g. the 100-day grid) — was
             hardcoded to the dark color, which flashed black on overscroll
             even in light theme. */
          background-color: ${theme === 'light' ? '#fafafa' : '#0b0c0e'};
        }
        /* Trade History (List / Preview) tables force horizontal scroll on
           narrow screens — restore a slim, themed scrollbar here so users
           actually see there's more content instead of it silently clipping. */
        .trade-table-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(161,161,170,0.45) transparent;
        }
        .trade-table-scroll::-webkit-scrollbar {
          display: block;
          height: 8px;
          width: 8px;
        }
        .trade-table-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .trade-table-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(161,161,170,0.45);
          border-radius: 9999px;
        }
        .trade-table-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(161,161,170,0.7);
        }
        /* Momentum/inertial scrolling for iOS Safari on any horizontally
           scrollable table wrapper (Trade History, Execution Logs, etc.) —
           without this, dragging a finger across a narrow table on iOS
           scrolls in stiff, un-momentum'd steps instead of the native
           "flick and glide" feel every other scroll surface in iOS has. */
        .trade-table-scroll,
        .overflow-x-auto {
          -webkit-overflow-scrolling: touch;
        }

        /* Bottom padding that's the larger of our normal spacing scale or
           the device's home-indicator/gesture-bar safe-area-inset-bottom,
           so content and action buttons at the bottom of a screen are
           never obscured by the OS nav bar. env() resolves to 0 on devices
           without an inset, so this is a no-op there — just the plain
           1rem/1.5rem it replaces. */
        .pb-safe {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
        @media (min-width: 640px) {
          .pb-safe {
            padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
          }
        }

        /* ============================================================
           MOBILE OPTIMIZATION (below 767px / Tailwind's md breakpoint)
           ============================================================
           1. 44px is Apple's (and the generally accepted) minimum
              comfortable touch target — undersized buttons/inputs are the
              #1 cause of mis-taps on a phone. Scoped to mobile only so
              desktop's denser, mouse-driven layout is untouched.
           2. iOS Safari auto-zooms the page on focusing any form field
              whose computed font-size is under 16px. Forcing 16px on
              inputs/selects/textareas (but deliberately NOT on buttons,
              where it would blow up icon-button/badge layouts) stops that
              zoom-and-snap-back jitter every time someone taps a field. */
        @media (max-width: 767px) {
          button,
          a[role="button"],
          select,
          input[type="checkbox"],
          input[type="radio"] {
            min-height: 44px;
          }
          input[type="checkbox"],
          input[type="radio"] {
            min-width: 44px;
          }
          input,
          select,
          textarea {
            font-size: 16px !important;
          }
          /* Removes the ~300ms tap-delay ghost-click Safari/Chrome mobile
             otherwise waits out to check for a double-tap-to-zoom gesture,
             and the gray flash Android shows on every tap. */
          button,
          a,
          input,
          select {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
        }

        /* Market Notices columns — thin scrollbar, color-matched to each
           column's accent (cyan for Price Action Insights, rose for
           Anti-Mistakes & Traps) so the scroll affordance reads as part of
           that column's theme rather than a generic gray bar. Track stays
           dark/transparent to match the card background either way. */
        .notice-column-scroll-insight,
        .notice-column-scroll-mistake {
          scrollbar-width: thin;
        }
        .notice-column-scroll-insight {
          scrollbar-color: rgba(6,182,212,0.4) rgba(15,23,42,0.2);
        }
        .notice-column-scroll-mistake {
          scrollbar-color: rgba(244,63,94,0.4) rgba(15,23,42,0.2);
        }
        .notice-column-scroll-insight::-webkit-scrollbar,
        .notice-column-scroll-mistake::-webkit-scrollbar {
          width: 6px;
        }
        .notice-column-scroll-insight::-webkit-scrollbar-track,
        .notice-column-scroll-mistake::-webkit-scrollbar-track {
          background: rgba(15,23,42,0.2);
          border-radius: 9999px;
        }
        .notice-column-scroll-insight::-webkit-scrollbar-thumb {
          background-color: rgba(6,182,212,0.4);
          border-radius: 9999px;
          border: 1px solid transparent;
          background-clip: padding-box;
        }
        .notice-column-scroll-insight::-webkit-scrollbar-thumb:hover {
          background-color: rgba(6,182,212,0.7);
        }
        .notice-column-scroll-mistake::-webkit-scrollbar-thumb {
          background-color: rgba(244,63,94,0.4);
          border-radius: 9999px;
          border: 1px solid transparent;
          background-clip: padding-box;
        }
        .notice-column-scroll-mistake::-webkit-scrollbar-thumb:hover {
          background-color: rgba(244,63,94,0.7);
        }

        /* Active Strategy Models carousel — scrollbar fully hidden so it reads
           as a clean slider driven only by the < / > nav arrows (and drag/swipe),
           with no native scrollbar track ever visible. */
        .custom-slider-scrollbar,
        .scrollbar-none {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE / legacy Edge */
        }
        .custom-slider-scrollbar::-webkit-scrollbar,
        .scrollbar-none::-webkit-scrollbar {
          display: none; /* Chrome, Safari, modern Edge */
          width: 0;
          height: 0;
        }

        /* ---- Light theme color fixes ----
           Many panels/cards/text below were originally styled dark-only.
           These overrides remap the dark zinc palette to light-appropriate
           colors whenever the root wrapper carries .theme-light-fix. */
        .theme-light-fix [class~="bg-zinc-900"] { background-color: #ffffff !important; }
        .theme-light-fix [class~="border-zinc-800"] { border-color: #e4e4e7 !important; }
        .theme-light-fix [class~="text-zinc-300"] { color: #3f3f46 !important; }
        .theme-light-fix [class~="border-zinc-700"] { border-color: #d4d4d8 !important; }
        .theme-light-fix [class~="hover:bg-zinc-800/50"]:hover { background-color: #e4e4e7 !important; }
        .theme-light-fix [class~="text-zinc-400"] { color: #52525b !important; }
        .theme-light-fix [class~="hover:bg-zinc-700"]:hover { background-color: #e4e4e7 !important; }
        .theme-light-fix [class~="bg-zinc-800"] { background-color: #f4f4f5 !important; }
        .theme-light-fix [class~="bg-zinc-600"] { background-color: #e4e4e7 !important; }
        .theme-light-fix [class~="bg-zinc-700"] { background-color: #f4f4f5 !important; }
        .theme-light-fix [class~="hover:bg-zinc-600"]:hover { background-color: #d4d4d8 !important; }
        .theme-light-fix [class~="bg-zinc-900/50"] { background-color: #ffffff !important; }
        .theme-light-fix [class~="hover:border-zinc-700"]:hover { border-color: #a1a1aa !important; }
        .theme-light-fix [class~="border-zinc-600"] { border-color: #d4d4d8 !important; }
        .theme-light-fix [class~="hover:text-zinc-300"]:hover { color: #27272a !important; }
        .theme-light-fix [class~="bg-zinc-800/60"] { background-color: #f4f4f5 !important; }
        .theme-light-fix [class~="border-zinc-700/80"] { border-color: #d4d4d8 !important; }
        .theme-light-fix [class~="hover:bg-zinc-800"]:hover { background-color: #e4e4e7 !important; }
        .theme-light-fix [class~="hover:text-zinc-200"]:hover { color: #18181b !important; }
        .theme-light-fix [class~="bg-zinc-800/50"] { background-color: #f4f4f5 !important; }
        .theme-light-fix [class~="border-zinc-700/50"] { border-color: #d4d4d8 !important; }
        .theme-light-fix [class~="bg-zinc-700/50"] { background-color: #f4f4f5 !important; }
        .theme-light-fix [class~="border-zinc-600/50"] { border-color: #d4d4d8 !important; }
        .theme-light-fix [class~="bg-zinc-950"] { background-color: #fafafa !important; }
        .theme-light-fix [class~="bg-zinc-900/40"] { background-color: #ffffff !important; }
        .theme-light-fix [class~="hover:bg-zinc-900/70"]:hover { background-color: #fafafa !important; }
        .theme-light-fix [class~="border-zinc-800/80"] { border-color: #e4e4e7 !important; }
        .theme-light-fix [class~="from-zinc-700"] { --tw-gradient-from: #e4e4e7 !important; }
        .theme-light-fix [class~="to-zinc-800"] { --tw-gradient-to: #f4f4f5 !important; }
        .theme-light-fix [class~="from-zinc-900"] { --tw-gradient-from: #f4f4f5 !important; }
        .theme-light-fix [class~="via-zinc-900/90"] { --tw-gradient-stops: #f4f4f5 !important; }
        .theme-light-fix [class~="to-zinc-900/60"] { --tw-gradient-to: #f4f4f5 !important; }
        .theme-light-fix [class~="bg-zinc-800/30"] { background-color: #f4f4f5 !important; }
        .theme-light-fix [class~="hover:bg-zinc-800/60"]:hover { background-color: #e4e4e7 !important; }
        .theme-light-fix [class~="bg-zinc-800/40"] { background-color: #f4f4f5 !important; }
        .theme-light-fix [class~="from-zinc-900/70"] { --tw-gradient-from: #f4f4f5 !important; }
        .theme-light-fix [class~="to-zinc-900/30"] { --tw-gradient-to: #f4f4f5 !important; }
        .theme-light-fix [class~="bg-zinc-950/80"] { background-color: #fafafa !important; }
        .theme-light-fix [class~="bg-zinc-800/70"] { background-color: #f4f4f5 !important; }
        .theme-light-fix [class~="bg-zinc-800/80"] { background-color: #f4f4f5 !important; }
        .theme-light-fix [class~="from-zinc-800"] { --tw-gradient-from: #f4f4f5 !important; }
        .theme-light-fix [class~="border-zinc-800/70"] { border-color: #e4e4e7 !important; }
        .theme-light-fix [class~="border-zinc-800/60"] { border-color: #e4e4e7 !important; }
        .theme-light-fix [class~="border-zinc-700/60"] { border-color: #d4d4d8 !important; }
        .theme-light-fix [class~="border-zinc-800/50"] { border-color: #e4e4e7 !important; }
        .theme-light-fix [class~="bg-zinc-900/60"] { background-color: #ffffff !important; }
        .theme-light-fix [class~="text-white"] { color: #18181b !important; }
        .theme-light-fix [class~="hover:text-white"]:hover { color: #18181b !important; }
        .theme-light-fix [class~="border-zinc-500"] { border-color: #d4d4d8 !important; }
        .theme-light-fix [class~="hover:border-zinc-500"]:hover { border-color: #71717a !important; }
        .theme-light-fix [class~="bg-zinc-500"] { background-color: #d4d4d8 !important; }
        /* Two classes the minecraft reskin below already accounts for
           (bg-zinc-900/70, text-zinc-500) but that were missing from this
           list — added so every screen using them (not just the ones
           inlined in this file) renders correctly in light mode too. */
        .theme-light-fix [class~="bg-zinc-900/70"] { background-color: #ffffff !important; }
        .theme-light-fix [class~="text-zinc-500"] { color: #52525b !important; }
        /* bg-zinc-800/20 was the actual root cause of the "Top Emotions &
           State Breakdown" / "Top Mistakes Committed" / preset-row cards
           staying flat gray in light mode — fixed at the source in
           DisciplineScreen.tsx and LifeDisciplineModals.tsx, but covered
           here too as a safety net for any other screen using the same
           unconditional class. */
        .theme-light-fix [class~="bg-zinc-800/20"] { background-color: #fafafa !important; }

        /* ---- Light theme color fixes, gray-* palette ----
           The zinc-* block above assumed every dark surface used Tailwind's
           "zinc" neutral scale. Several empty-state placeholder cards (the
           flat gray boxes seen under "No emotions logged", "No price
           action insights yet", the day-grid cells, etc.) actually use
           Tailwind's separate "gray" neutral scale instead of "zinc" —
           same idea, different palette — so those never matched a single
           rule above and stayed a raw mid-gray regardless of theme. Mirrors
           every rule above 1:1, same target colors, gray-* selectors. */
        .theme-light-fix [class~="bg-gray-900"] { background-color: #ffffff !important; }
        .theme-light-fix [class~="border-gray-800"] { border-color: #e5e7eb !important; }
        .theme-light-fix [class~="text-gray-300"] { color: #374151 !important; }
        .theme-light-fix [class~="border-gray-700"] { border-color: #d1d5db !important; }
        .theme-light-fix [class~="hover:bg-gray-800/50"]:hover { background-color: #e5e7eb !important; }
        .theme-light-fix [class~="text-gray-400"] { color: #4b5563 !important; }
        .theme-light-fix [class~="hover:bg-gray-700"]:hover { background-color: #e5e7eb !important; }
        .theme-light-fix [class~="bg-gray-800"] { background-color: #f3f4f6 !important; }
        .theme-light-fix [class~="bg-gray-600"] { background-color: #e5e7eb !important; }
        .theme-light-fix [class~="bg-gray-700"] { background-color: #f3f4f6 !important; }
        .theme-light-fix [class~="hover:bg-gray-600"]:hover { background-color: #d1d5db !important; }
        .theme-light-fix [class~="bg-gray-900/50"] { background-color: #ffffff !important; }
        .theme-light-fix [class~="hover:border-gray-700"]:hover { border-color: #9ca3af !important; }
        .theme-light-fix [class~="border-gray-600"] { border-color: #d1d5db !important; }
        .theme-light-fix [class~="hover:text-gray-300"]:hover { color: #1f2937 !important; }
        .theme-light-fix [class~="bg-gray-800/60"] { background-color: #f3f4f6 !important; }
        .theme-light-fix [class~="border-gray-700/80"] { border-color: #d1d5db !important; }
        .theme-light-fix [class~="hover:bg-gray-800"]:hover { background-color: #e5e7eb !important; }
        .theme-light-fix [class~="hover:text-gray-200"]:hover { color: #111827 !important; }
        .theme-light-fix [class~="bg-gray-800/50"] { background-color: #f3f4f6 !important; }
        .theme-light-fix [class~="border-gray-700/50"] { border-color: #d1d5db !important; }
        .theme-light-fix [class~="bg-gray-700/50"] { background-color: #f3f4f6 !important; }
        .theme-light-fix [class~="border-gray-600/50"] { border-color: #d1d5db !important; }
        .theme-light-fix [class~="bg-gray-950"] { background-color: #fafafa !important; }
        .theme-light-fix [class~="bg-gray-900/40"] { background-color: #ffffff !important; }
        .theme-light-fix [class~="hover:bg-gray-900/70"]:hover { background-color: #fafafa !important; }
        .theme-light-fix [class~="border-gray-800/80"] { border-color: #e5e7eb !important; }
        .theme-light-fix [class~="from-gray-700"] { --tw-gradient-from: #e5e7eb !important; }
        .theme-light-fix [class~="to-gray-800"] { --tw-gradient-to: #f3f4f6 !important; }
        .theme-light-fix [class~="from-gray-900"] { --tw-gradient-from: #f3f4f6 !important; }
        .theme-light-fix [class~="via-gray-900/90"] { --tw-gradient-stops: #f3f4f6 !important; }
        .theme-light-fix [class~="to-gray-900/60"] { --tw-gradient-to: #f3f4f6 !important; }
        .theme-light-fix [class~="bg-gray-800/30"] { background-color: #f3f4f6 !important; }
        .theme-light-fix [class~="hover:bg-gray-800/60"]:hover { background-color: #e5e7eb !important; }
        .theme-light-fix [class~="bg-gray-800/40"] { background-color: #f3f4f6 !important; }
        .theme-light-fix [class~="from-gray-900/70"] { --tw-gradient-from: #f3f4f6 !important; }
        .theme-light-fix [class~="to-gray-900/30"] { --tw-gradient-to: #f3f4f6 !important; }
        .theme-light-fix [class~="bg-gray-950/80"] { background-color: #fafafa !important; }
        .theme-light-fix [class~="bg-gray-800/70"] { background-color: #f3f4f6 !important; }
        .theme-light-fix [class~="bg-gray-800/80"] { background-color: #f3f4f6 !important; }
        .theme-light-fix [class~="from-gray-800"] { --tw-gradient-from: #f3f4f6 !important; }
        .theme-light-fix [class~="border-gray-800/70"] { border-color: #e5e7eb !important; }
        .theme-light-fix [class~="border-gray-800/60"] { border-color: #e5e7eb !important; }
        .theme-light-fix [class~="border-gray-700/60"] { border-color: #d1d5db !important; }
        .theme-light-fix [class~="border-gray-800/50"] { border-color: #e5e7eb !important; }
        .theme-light-fix [class~="bg-gray-900/60"] { background-color: #ffffff !important; }
        .theme-light-fix [class~="border-gray-500"] { border-color: #d1d5db !important; }
        .theme-light-fix [class~="hover:border-gray-500"]:hover { border-color: #6b7280 !important; }
        .theme-light-fix [class~="bg-gray-500"] { background-color: #d1d5db !important; }
        .theme-light-fix [class~="bg-gray-900/70"] { background-color: #ffffff !important; }
        .theme-light-fix [class~="text-gray-500"] { color: #4b5563 !important; }

        /* ---- Minecraft theme ----
           The base markup is authored with dark zinc-* utility classes.
           Rather than thread a third branch through every ternary in the
           file, we reskin those same classes here (same pattern as the
           light-fix block above) whenever the root wrapper carries
           .theme-minecraft. Every theme === 'dark' check in the component
           tree was widened to theme !== 'light', so Minecraft mode renders
           the existing dark-styled markup, and this stylesheet retextures it
           into a Minecraft inventory-GUI look. */

        .theme-minecraft, .theme-minecraft * {
          font-family: 'VT323', monospace !important;
          letter-spacing: 0.02em;
        }
        .theme-minecraft [class*="rounded"] { border-radius: 0 !important; }
        .theme-minecraft [class*="blur"] { filter: none !important; }
        .theme-minecraft [class*="backdrop-blur"] { backdrop-filter: none !important; }
        .theme-minecraft * { transition-duration: 60ms !important; }

        /* Main page canvas: pixelated deepslate/stone grid, not a flat color */
        .theme-minecraft {
          background-color: #2b2b2b;
          background-image:
            repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 4px, transparent 4px, transparent 16px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 4px, transparent 4px, transparent 16px),
            repeating-linear-gradient(45deg, #363636 0px, #363636 16px, #2f2f2f 16px, #2f2f2f 32px);
        }
        .theme-minecraft [class~="bg-zinc-950"],
        .theme-minecraft [class~="bg-zinc-950/80"] {
          background-color: #2b2b2b !important;
          background-image:
            repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 4px, transparent 4px, transparent 16px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 4px, transparent 4px, transparent 16px),
            repeating-linear-gradient(45deg, #363636 0px, #363636 16px, #2f2f2f 16px, #2f2f2f 32px) !important;
        }

        /* Cards / panels / sidebar: solid stone slab with a 2px beveled edge
           (light highlight top-left, dark shadow bottom-right) */
        .theme-minecraft [class~="bg-zinc-900"],
        .theme-minecraft [class~="bg-zinc-900/40"],
        .theme-minecraft [class~="bg-zinc-900/50"],
        .theme-minecraft [class~="bg-zinc-900/60"],
        .theme-minecraft [class~="bg-zinc-900/70"],
        .theme-minecraft [class~="bg-zinc-900/95"],
        .theme-minecraft [class~="bg-zinc-800"],
        .theme-minecraft [class~="bg-zinc-800/30"],
        .theme-minecraft [class~="bg-zinc-800/40"],
        .theme-minecraft [class~="bg-zinc-800/50"],
        .theme-minecraft [class~="bg-zinc-800/60"],
        .theme-minecraft [class~="bg-zinc-800/70"],
        .theme-minecraft [class~="bg-zinc-800/80"],
        .theme-minecraft [class~="bg-zinc-700"],
        .theme-minecraft [class~="bg-zinc-700/50"],
        .theme-minecraft [class~="bg-zinc-600"],
        .theme-minecraft [class*="from-zinc-"],
        .theme-minecraft [class*="to-zinc-"],
        .theme-minecraft [class*="via-zinc-"] {
          background-color: #4a4a4a !important;
          background-image: none !important;
          border-color: transparent !important;
          box-shadow:
            inset 2px 2px 0 0 #7a7a7a,
            inset -2px -2px 0 0 #1e1e1e !important;
        }

        /* Standalone borders (no bg override above) still read as a bevel */
        .theme-minecraft [class~="border-zinc-800"],
        .theme-minecraft [class~="border-zinc-800/50"],
        .theme-minecraft [class~="border-zinc-800/60"],
        .theme-minecraft [class~="border-zinc-800/70"],
        .theme-minecraft [class~="border-zinc-800/80"],
        .theme-minecraft [class~="border-zinc-700"],
        .theme-minecraft [class~="border-zinc-700/50"],
        .theme-minecraft [class~="border-zinc-700/60"],
        .theme-minecraft [class~="border-zinc-700/80"],
        .theme-minecraft [class~="border-zinc-600"],
        .theme-minecraft [class~="border-zinc-600/50"],
        .theme-minecraft [class~="border-zinc-500"] {
          border-color: #1e1e1e !important;
          border-style: solid !important;
        }

        /* Inputs render as a recessed Minecraft text-field slot */
        .theme-minecraft input,
        .theme-minecraft select,
        .theme-minecraft textarea {
          background-color: #2b2b2b !important;
          border: none !important;
          border-radius: 0 !important;
          color: #ffffff !important;
          box-shadow:
            inset 2px 2px 0 0 #1e1e1e,
            inset -2px -2px 0 0 #6b6b6b !important;
        }

        /* Buttons: blocky Minecraft menu-button styling with a hard 3D
           drop shadow, brightening border + white text on hover */
        .theme-minecraft button {
          border-radius: 0 !important;
          background-color: #4a4a4a;
          box-shadow:
            inset 2px 2px 0 0 #7a7a7a,
            inset -2px -2px 0 0 #1e1e1e,
            3px 3px 0 0 #000000;
        }
        .theme-minecraft button:hover {
          color: #ffffff !important;
          box-shadow:
            inset 2px 2px 0 0 #a3a3a3,
            inset -2px -2px 0 0 #1e1e1e,
            0 0 0 2px #e6e6e6,
            3px 3px 0 0 #000000;
        }
        .theme-minecraft button:active {
          box-shadow:
            inset 2px 2px 0 0 #1e1e1e,
            inset -2px -2px 0 0 #7a7a7a;
          transform: translate(2px, 2px);
        }

        /* Text palette: chat off-white / light gray labels, Diamond Blue and
           Emerald Green for important + active states */
        .theme-minecraft [class~="text-white"] { color: #ffffff !important; }
        .theme-minecraft [class~="text-zinc-300"],
        .theme-minecraft [class~="text-zinc-400"],
        .theme-minecraft [class~="text-zinc-500"] { color: #aaaaaa !important; }
        .theme-minecraft [class*="text-emerald"],
        .theme-minecraft [class*="text-green"] { color: #55ff55 !important; }
        .theme-minecraft [class*="text-blue"],
        .theme-minecraft [class*="text-cyan"],
        .theme-minecraft [class*="text-violet"],
        .theme-minecraft [class*="text-indigo"] { color: #55ffff !important; }
        .theme-minecraft [class*="text-red"],
        .theme-minecraft [class*="text-rose"] { color: #ff5555 !important; }
        .theme-minecraft [class*="text-amber"],
        .theme-minecraft [class*="text-yellow"] { color: #ffff55 !important; }

        /* Headings, stat numbers and button labels lean on the pixel font
           at a slightly larger size so they read the way Minecraft's GUI
           text does (VT323 is narrow/small at 1:1) */
        .theme-minecraft h1, .theme-minecraft h2, .theme-minecraft h3,
        .theme-minecraft h4, .theme-minecraft button, .theme-minecraft [class*="text-2xl"],
        .theme-minecraft [class*="text-3xl"], .theme-minecraft [class*="text-xl"] {
          font-family: 'VT323', monospace !important;
          letter-spacing: 0.04em;
        }

        /* Scrollbar reskin so it doesn't look like a stray glassy sliver */
        .theme-minecraft ::-webkit-scrollbar-thumb {
          background-color: #6b6b6b !important;
          border-radius: 0 !important;
        }
      `}</style>

      {/* MOBILE SIDEBAR (Drawer Mode) — its own isolated tree; only ever exists in the DOM while isMobileSidebarOpen is true, and only below md.
          Entrance is transform+opacity only (slide-in panel, fade-in backdrop) — no animated width/left, so it's compositor-only. */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay — opacity-only fade, no animated blur radius */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-enter gpu-layer"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Actual Mobile Sidebar Panel — slides in via transform, not by animating width/left */}
          <aside className={cn(
            "relative w-56 h-full flex flex-col select-none gpu-layer modal-enter",
            theme !== 'light' ? 'bg-zinc-900 border-r border-zinc-800' : 'bg-white border-r border-zinc-200'
          )}>
            {<Sidebar isMobile={true} />}
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR (Permanent Layout) - FIXED HEIGHT, PINNED TO VIEWPORT
          Collapse/expand still animates `width` (scoped to just that property,
          not `transition-all`, so color/border changes elsewhere don't get
          swept into the same composited transition) because this sidebar sits
          in normal flow and pushes <main> over — a pure-transform collapse
          would need the sidebar taken out of flow (position: fixed/absolute,
          overlaying main) to avoid animating layout, which is a bigger
          structural change than this pass makes. transform-gpu still promotes
          it to its own layer so the width animation doesn't repaint siblings
          on every frame. */}
      <aside className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out select-none transform-gpu",
        theme !== 'light' ? 'bg-zinc-900 border-r border-zinc-800' : 'bg-white border-r border-zinc-200',
        sidebarCollapsed ? "w-[72px]" : "w-56"
      )}>
        {<Sidebar isMobile={false} />}
      </aside>

      {/* MAIN WORKSPACE - ISOLATED SCROLL */}
      <main ref={mainScrollRef} className={cn("flex-1 min-w-0 h-screen overflow-y-auto flex flex-col transition-colors duration-300", theme !== 'light' ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900')}>
        {/* MOBILE STICKY TOP BAR
            pt uses max(1rem, safe-area-inset-top) so on notched/Dynamic
            Island phones the bar's content clears the notch instead of
            sitting flush under it — falls back to a plain 1rem on devices
            without a safe-area inset (env() resolves to 0 there). */}
        <div
          className={cn(
            "md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 pb-3 border-b backdrop-blur-sm",
            theme !== 'light' ? 'bg-zinc-900/95 border-zinc-800' : 'bg-white/95 border-zinc-200'
          )}
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open menu"
            className={cn(
              "min-w-11 min-h-11 -ml-2 flex items-center justify-center rounded-lg transition-colors",
              theme !== 'light' ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            )}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <span className={cn("font-bold text-base uppercase tracking-wider", theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
            VSX
          </span>
          {/* Sign Out — placeholder placement; move this into Sidebar.tsx
              (both mobile drawer and desktop rail) once that file is in
              hand, so it's reachable from every screen the same way the
              rest of the nav is, not just the mobile top bar. */}
          <button
            type="button"
            onClick={() => signOutUser()}
            aria-label="Sign out"
            className={cn(
              "min-w-11 min-h-11 ml-auto flex items-center justify-center rounded-lg transition-colors",
              theme !== 'light' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            )}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* pb stacks a fixed floor (1rem desktop / 1.5rem mobile, matching
            the sm: bump already here) with the device's own home-indicator
            safe-area-inset-bottom, so on iPhones with a gesture bar the
            last row of content/buttons never sits underneath it, and on
            Android 3-button/gesture nav the same floor value still applies
            since env() resolves to 0 there. */}
        <div className="flex-1 flex flex-col px-4 pt-4 sm:px-6 sm:pt-6 pb-safe">
          {/* Only one screen is ever mounted here, so Suspense + lazy means the
              initial bundle only has to fetch/parse the screen the user lands
              on — every other screen's code streams in on first navigation
              to it instead of up front.
              We branch on `deferredView` (not `view`) so that switching to a
              screen whose chunk hasn't loaded yet doesn't unmount the
              current screen — React keeps it mounted/visible until the new
              one is ready, then swaps directly, so `fallback={null}` here is
              safe: the fallback essentially never actually gets used on a
              tab switch, only (very briefly) on the very first paint. */}
          <Suspense fallback={null}>
            {deferredView === 'dashboard' && <DashboardScreen />}
            {deferredView === 'trades' && <TradesScreen />}
            {deferredView === 'discipline' && <DisciplineScreen />}
            {deferredView === 'lifeDiscipline' && <LifeDisciplineScreen />}
            {deferredView === 'playbook' && <PlaybookScreen />}
            {deferredView === 'notices' && <NoticesScreen />}
            {deferredView === 'wiki' && <WikiScreen />}
            {deferredView === 'calendar' && <CalendarScreen />}
          </Suspense>
        </div>
      </main>

      {/*
        NOTE ON MODALS: each of these renders unconditionally here and relies
        on its OWN internal open/closed state (e.g. `showAddAccount`) to
        decide whether to return null. Lazy-loading still shrinks the initial
        bundle (each modal's code — and its own imports — moves into a
        separate chunk instead of shipping in the main one, so the main
        chunk the browser must fetch/parse/execute before first paint is
        smaller), but because every modal is present in the tree from the
        first render, its chunk starts fetching immediately alongside the
        shell rather than being deferred until the user actually opens it.
        Getting the stronger "don't fetch until opened" behavior would mean
        gating each one at this call site on its own show-flag (e.g.
        `{showAddAccount && <AccountModal />}`) instead of inside the
        component — a slightly bigger change since it moves that boolean
        check out of the modal component and into here, so it's left as-is
        for now to avoid touching modal-internal logic sight unseen.
        fallback={null}: closed modals resolve to null almost immediately
        and have no visible chrome, so there's nothing worth showing a
        spinner for while their chunk loads.
      */}
      <Suspense fallback={null}>
        {<AccountModal />}
        {<AddTradeModal />}
        {<EditTradeModal />}
        {<TradeDetailModal />}
        {<DisciplinePsychologyReviewModal />}
        {<RuleAdherenceReviewModal />}
        {<ExpandGalleryModal />}
        {<ManageRulesModal />}
        {<AddRuleModal />}
        {<AddPillarModal />}
        {<DeletePillarConfirm />}
        {<AddStrategyModal />}
        {<DeleteStepConfirm />}
        {<StrategyDetailModal />}
        {<AddNoticeModal />}
        {<DeleteNoticeStepConfirm />}
        {<AddWikiModal />}
        {<WikiDetailModal />}
        {<DeleteTradeConfirm />}
        {<DeleteAccountConfirm />}
        {<DeleteStrategyConfirm />}
        {<LightboxModal />}
        {<SettingsModal />}
        {<ChallengeConfigModal />}
        {<DayDetailsModal />}
      </Suspense>

      {isExportConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm backdrop-enter gpu-layer">
          <div className="w-full max-w-sm mx-4 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl gpu-layer modal-enter">
            <div className="p-5">
              <h2 className="text-base font-semibold text-white">
                Export Journal Backup?
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                This will create a backup file of your current journal data.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-zinc-800 px-5 py-3">
              <button
                onClick={() => setIsExportConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  exportBackup();
                  setIsExportConfirmOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg text-sm bg-zinc-100 text-zinc-900 hover:bg-white transition-colors font-medium"
              >
                Confirm Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// /preview/[user_id] — parsed from window.location.pathname since this app
// doesn't use a router (no react-router-dom / next.js routing anywhere in
// the codebase; `view` is plain component state, not a URL). This is a
// minimal manual "route" check: it runs once at mount, entirely outside
// AppProvider/AuthGate, so a viewer never needs a Supabase session (or even
// a signed-out flash of LoginPage) to reach the passcode gate — visiting
// the link is enough. Deep-linking to /preview/[id] works whether or not
// the visitor is separately signed into their own account in another tab.
// ============================================================================
function usePreviewRoute(): { userId: string | null; exit: () => void } {
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const match = window.location.pathname.match(/^\/preview\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  });

  useEffect(() => {
    const onPopState = () => {
      const match = window.location.pathname.match(/^\/preview\/([^/]+)\/?$/);
      setUserId(match ? decodeURIComponent(match[1]) : null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const exit = () => {
    window.history.pushState({}, '', '/');
    setUserId(null);
  };

  return { userId, exit };
}

export default function App() {
  const { userId: previewUserId, exit: exitPreview } = usePreviewRoute();

  // Preview is a fully separate, unauthenticated surface — it intentionally
  // sits outside <AppProvider> so a viewer's session never mixes with (or
  // requires) the journal owner's app state.
  if (previewUserId) {
    return <PreviewScreen userId={previewUserId} onExit={exitPreview} />;
  }

  return (
    <AppProvider>
      <AuthGate />
    </AppProvider>
  );
}

// ============================================================================
// AuthGate — reads the Supabase session from useAppState (via context) and
// decides which of three things to render:
//   1. authLoading  -> brief blank/spinner screen while the very first
//      supabase.auth.getSession() call resolves (avoids a flash of the
//      LoginPage for someone who's actually already signed in).
//   2. no session   -> LoginPage (Google OAuth + email sign in/up).
//   3. session      -> the real app (AppShell).
// Sits *inside* AppProvider (not outside it) because it needs
// useAppContext() to read `session`/`authLoading`, which live in
// useAppState alongside the rest of the app's state.
// ============================================================================
function AuthGate() {
  const { session, authLoading, theme } = useAppContext();

  if (authLoading) {
    return (
      <div className={cn(
        "h-screen w-full flex items-center justify-center",
        theme === 'light' ? 'bg-zinc-50' : 'bg-[#0d0f12]'
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full border-2 border-t-transparent animate-spin",
          theme === 'light' ? 'border-zinc-300' : 'border-zinc-700'
        )} />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return <AppShell />;
}
