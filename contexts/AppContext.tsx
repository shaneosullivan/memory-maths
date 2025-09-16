"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  AppState,
  Profile,
  Operation,
  Phase,
  Calculation,
  SessionStats,
} from "@/types";
import {
  LOCAL_STORAGE_CURRENT_PROFILE_KEY,
  LOCAL_STORAGE_PROFILES_KEY,
} from "@/lib/consts";
import { localStorage } from "@/utils/storage";

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  createProfile: (name: string, isGuest?: boolean) => void;
  switchProfile: (profile: Profile) => void;
  deleteProfile: (profileId: string) => void;
  setOperation: (operation: Operation) => void;
  setBaseNumber: (base: number) => void;
  setRangeMin: (min: number) => void;
  setRangeMax: (max: number) => void;
  setIsSquareNumbers: (isSquare: boolean) => void;
  generateCalculations: (params?: {
    operation?: Operation;
    baseNumber?: number;
    rangeMin?: number;
    rangeMax?: number;
    isSquareNumbers?: boolean;
  }) => void;
  moveToPhase: (phase: Phase) => void;
  submitAnswer: (answer: number, toasterCallback?: (category: 'correct' | 'wrong', x: number, y: number) => void) => void;
  skipQuestion: () => void;
  showMultipleChoice: () => void;
}

type AppAction =
  | { type: "SET_PROFILE"; payload: Profile | null }
  | { type: "SET_PROFILE_LOADING"; payload: boolean }
  | { type: "SET_PHASE"; payload: Phase }
  | { type: "SET_OPERATION"; payload: Operation }
  | { type: "SET_BASE_NUMBER"; payload: number }
  | { type: "SET_RANGE_MIN"; payload: number }
  | { type: "SET_RANGE_MAX"; payload: number }
  | { type: "SET_IS_SQUARE_NUMBERS"; payload: boolean }
  | { type: "SET_CALCULATIONS"; payload: Calculation[] }
  | { type: "SET_CURRENT_INDEX"; payload: number }
  | {
      type: "UPDATE_CALCULATION";
      payload: { index: number; calculation: Partial<Calculation> };
    }
  | { type: "INCREMENT_MISTAKES" }
  | { type: "RESET_SESSION" };

const initialState: AppState = {
  currentProfile: null,
  isProfileLoading: true,
  phase: "learning",
  operation: null,
  baseNumber: 2,
  rangeMin: 2,
  rangeMax: 10,
  calculations: [],
  currentCalculationIndex: 0,
  sessionMistakes: 0,
  isSquareNumbers: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, currentProfile: action.payload };
    case "SET_PROFILE_LOADING":
      return { ...state, isProfileLoading: action.payload };
    case "SET_PHASE":
      return { ...state, phase: action.payload };
    case "SET_OPERATION":
      return { ...state, operation: action.payload };
    case "SET_BASE_NUMBER":
      return { ...state, baseNumber: action.payload };
    case "SET_RANGE_MIN":
      return { ...state, rangeMin: action.payload };
    case "SET_RANGE_MAX":
      return { ...state, rangeMax: action.payload };
    case "SET_IS_SQUARE_NUMBERS":
      return { ...state, isSquareNumbers: action.payload };
    case "SET_CALCULATIONS":
      return { ...state, calculations: action.payload };
    case "SET_CURRENT_INDEX":
      return { ...state, currentCalculationIndex: action.payload };
    case "UPDATE_CALCULATION":
      const updatedCalculations = [...state.calculations];
      updatedCalculations[action.payload.index] = {
        ...updatedCalculations[action.payload.index],
        ...action.payload.calculation,
      };
      return { ...state, calculations: updatedCalculations };
    case "INCREMENT_MISTAKES":
      return { ...state, sessionMistakes: state.sessionMistakes + 1 };
    case "RESET_SESSION":
      return { ...state, sessionMistakes: 0, currentCalculationIndex: 0 };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Check URL for profile ID first
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get("profileId");

    if (profileId === "guest") {
      // Create guest profile automatically
      const guestProfile: Profile = {
        id: "guest",
        name: "Guest",
        isGuest: true,
        stats: [],
        createdAt: new Date(),
        lastUsed: new Date(),
      };
      dispatch({ type: "SET_PROFILE", payload: guestProfile });
    } else if (profileId) {
      // Try to find existing profile by ID
      const profiles = localStorage.getJSONItem<Profile[]>(LOCAL_STORAGE_PROFILES_KEY, []);
      const profile = profiles.find((p: Profile) => p.id === profileId);
      if (profile) {
        dispatch({ type: "SET_PROFILE", payload: profile });
      } else {
        // Profile ID specified but not found - remove it from URL to avoid confusion
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('profileId');
        window.history.replaceState({}, '', currentUrl.toString());
      }
    } else {
      // Fallback to saved profile
      const savedProfile = localStorage.getJSONItem<Profile | null>(
        LOCAL_STORAGE_CURRENT_PROFILE_KEY,
        null
      );
      if (savedProfile) {
        dispatch({ type: "SET_PROFILE", payload: savedProfile });
      }
    }

    // Always set loading to false after profile loading attempt
    dispatch({ type: "SET_PROFILE_LOADING", payload: false });
  }, []);

  const saveProfile = (profile: Profile) => {
    const profiles = localStorage.getJSONItem<Profile[]>(LOCAL_STORAGE_PROFILES_KEY, []);
    const existingIndex = profiles.findIndex(
      (p: Profile) => p.id === profile.id
    );

    if (existingIndex >= 0) {
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
    }

    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, profiles);
    if (!profile.isGuest) {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_PROFILE_KEY, profile);
    }
  };

  const createProfile = (name: string, isGuest = false) => {
    const profile: Profile = {
      id: Date.now().toString(),
      name: isGuest ? "Guest" : name,
      isGuest,
      stats: [],
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    if (!isGuest) {
      saveProfile(profile);
    }
    dispatch({ type: "SET_PROFILE", payload: profile });
  };

  const switchProfile = (profile: Profile) => {
    profile.lastUsed = new Date();
    if (!profile.isGuest) {
      saveProfile(profile);
    }
    dispatch({ type: "SET_PROFILE", payload: profile });
  };

  const deleteProfile = (profileId: string) => {
    const profiles = localStorage.getJSONItem<Profile[]>(LOCAL_STORAGE_PROFILES_KEY, []);
    const updatedProfiles = profiles.filter((p: Profile) => p.id !== profileId);
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, updatedProfiles);

    if (state.currentProfile?.id === profileId) {
      dispatch({ type: "SET_PROFILE", payload: null });
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_PROFILE_KEY);
    }
  };

  const setOperation = (operation: Operation) => {
    dispatch({ type: "SET_OPERATION", payload: operation });
  };

  const setBaseNumber = (base: number) => {
    dispatch({ type: "SET_BASE_NUMBER", payload: base });
  };

  const setRangeMin = (min: number) => {
    dispatch({ type: "SET_RANGE_MIN", payload: min });
  };

  const setRangeMax = (max: number) => {
    dispatch({ type: "SET_RANGE_MAX", payload: max });
  };

  const setIsSquareNumbers = (isSquare: boolean) => {
    dispatch({ type: "SET_IS_SQUARE_NUMBERS", payload: isSquare });
  };

  const generateCalculations = (params?: {
    operation?: Operation;
    baseNumber?: number;
    rangeMin?: number;
    rangeMax?: number;
    isSquareNumbers?: boolean;
  }) => {
    // Use params if provided, otherwise fall back to state
    const operation = params?.operation || state.operation;
    const baseNumber = params?.baseNumber || state.baseNumber;
    const rangeMin = params?.rangeMin || state.rangeMin;
    const rangeMax = params?.rangeMax || state.rangeMax;
    const isSquareNumbers = params?.isSquareNumbers ?? state.isSquareNumbers;

    if (!operation) return;

    const calculations: Calculation[] = [];

    for (let i = rangeMin; i <= rangeMax; i++) {
      let operand1: number, operand2: number, answer: number;

      switch (operation) {
        case "addition":
          operand1 = baseNumber;
          operand2 = i;
          answer = operand1 + operand2;
          break;
        case "subtraction":
          operand1 = baseNumber + i;
          operand2 = baseNumber;
          answer = i;
          break;
        case "multiplication":
          if (isSquareNumbers) {
            operand1 = i;
            operand2 = i;
            answer = operand1 * operand2;
          } else {
            operand1 = baseNumber;
            operand2 = i;
            answer = operand1 * operand2;
          }
          break;
        case "division":
          operand1 = baseNumber * i;
          operand2 = baseNumber;
          answer = i;
          break;
      }

      calculations.push({
        id: `${operation}-${baseNumber}-${i}-${operand1}-${operand2}`,
        operation: operation,
        operand1,
        operand2,
        answer,
        showAnswer: true,
      });
    }

    dispatch({ type: "SET_CALCULATIONS", payload: calculations });
  };

  const moveToPhase = (phase: Phase) => {
    dispatch({ type: "SET_PHASE", payload: phase });
    dispatch({ type: "RESET_SESSION" });

    if (phase === "practice" || phase === "test") {
      // Only shuffle if we have calculations, otherwise they'll be generated from URL
      if (state.calculations.length > 0) {
        const shuffledCalculations = [...state.calculations]
          .map((calc) => ({
            ...calc,
            showAnswer: false,
            userAnswer: undefined,
            isCorrect: undefined,
            skipped: undefined,
          }))
          .sort(() => Math.random() - 0.5);
        dispatch({ type: "SET_CALCULATIONS", payload: shuffledCalculations });
      }
    }
  };

  const submitAnswer = (answer: number, toasterCallback?: (category: 'correct' | 'wrong', x: number, y: number) => void) => {
    const currentCalc = state.calculations[state.currentCalculationIndex];
    // For division, allow small rounding errors
    const isCorrect =
      state.operation === "division"
        ? Math.abs(answer - currentCalc.answer) < 0.01
        : answer === currentCalc.answer;

    if (!isCorrect) {
      dispatch({ type: "INCREMENT_MISTAKES" });
    }

    // Trigger toaster animation if callback provided
    if (toasterCallback) {
      // Get the submit button position or use a default
      const submitButton = document.querySelector('[data-keypad-enter]') as HTMLElement;
      if (submitButton) {
        const rect = submitButton.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        toasterCallback(isCorrect ? 'correct' : 'wrong', x, y);
      }
    }

    dispatch({
      type: "UPDATE_CALCULATION",
      payload: {
        index: state.currentCalculationIndex,
        calculation: { userAnswer: answer, isCorrect },
      },
    });

    if (state.currentCalculationIndex < state.calculations.length - 1) {
      dispatch({
        type: "SET_CURRENT_INDEX",
        payload: state.currentCalculationIndex + 1,
      });
    }
  };

  const skipQuestion = () => {
    dispatch({ type: "INCREMENT_MISTAKES" });
    dispatch({
      type: "UPDATE_CALCULATION",
      payload: {
        index: state.currentCalculationIndex,
        calculation: { skipped: true },
      },
    });

    if (state.currentCalculationIndex < state.calculations.length - 1) {
      dispatch({
        type: "SET_CURRENT_INDEX",
        payload: state.currentCalculationIndex + 1,
      });
    }
  };

  const showMultipleChoice = () => {
    // This will be implemented in the Practice phase component
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        createProfile,
        switchProfile,
        deleteProfile,
        setOperation,
        setBaseNumber,
        setRangeMin,
        setRangeMax,
        setIsSquareNumbers,
        generateCalculations,
        moveToPhase,
        submitAnswer,
        skipQuestion,
        showMultipleChoice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
