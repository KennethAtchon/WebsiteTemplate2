/**
 * Calculator Component Mapping
 *
 * Maps calculator types to their React components.
 * This allows dynamic rendering based on calculator configuration.
 * Uses dynamic imports for code splitting and performance optimization.
 */

import dynamic from "next/dynamic";
import type { CalculationType } from "../types/calculator.types";
import type { ComponentType } from "react";

// Dynamic imports with loading states for better performance
const MortgageCalculator = dynamic(
  () =>
    import("@/features/calculator/components/mortgage-calculator").then(
      (mod) => ({
        default: mod.MortgageCalculator,
      })
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading calculator...
        </div>
      </div>
    ),
    ssr: false,
  }
);

const LoanCalculator = dynamic(
  () =>
    import("@/features/calculator/components/loan-calculator").then((mod) => ({
      default: mod.LoanCalculator,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading calculator...
        </div>
      </div>
    ),
    ssr: false,
  }
);

const InvestmentCalculator = dynamic(
  () =>
    import("@/features/calculator/components/investment-calculator").then(
      (mod) => ({
        default: mod.InvestmentCalculator,
      })
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading calculator...
        </div>
      </div>
    ),
    ssr: false,
  }
);

const RetirementCalculator = dynamic(
  () =>
    import("@/features/calculator/components/retirement-calculator").then(
      (mod) => ({
        default: mod.RetirementCalculator,
      })
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading calculator...
        </div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Map of calculator types to their components
 * Add new calculators here when adding to CALCULATOR_CONFIG
 */
export const CALCULATOR_COMPONENT_MAP: Record<CalculationType, ComponentType> =
  {
    mortgage: MortgageCalculator,
    loan: LoanCalculator,
    investment: InvestmentCalculator,
    retirement: RetirementCalculator,
  } as const;

/**
 * Get calculator component by type
 */
export function getCalculatorComponent(type: CalculationType): ComponentType {
  return CALCULATOR_COMPONENT_MAP[type];
}
