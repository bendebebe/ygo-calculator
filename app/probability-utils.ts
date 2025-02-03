// Efficient binomial coefficient calculation using logarithms to avoid overflow
export function logBinomialCoefficient(n: number, k: number): number {
  let result = 0
  for (let i = 0; i < k; i++) {
    result += Math.log(n - i)
    result -= Math.log(i + 1)
  }
  return result
}

// Hypergeometric probability calculation
export function calculateHypergeometric(
  deckSize: number,
  handSize: number,
  successesInDeck: number,
  successesNeeded: number,
): number {
  if (successesNeeded > successesInDeck || successesNeeded > handSize) return 0
  if (successesNeeded < 0 || handSize < 0 || successesInDeck < 0) return 0
  if (deckSize < handSize) return 0

  const logNumerator =
    logBinomialCoefficient(successesInDeck, successesNeeded) +
    logBinomialCoefficient(deckSize - successesInDeck, handSize - successesNeeded)
  const logDenominator = logBinomialCoefficient(deckSize, handSize)

  return Math.exp(logNumerator - logDenominator) * 100
}

// Calculate probability for multiple conditions
export function calculateMultipleConditions(
  deckSize: number,
  handSize: number,
  conditions: { amount: number; min: number; max: number }[],
): number {
  // Validate inputs
  if (conditions.some((c) => c.min > c.amount || c.max > c.amount || c.min > c.max)) {
    return 0
  }

  let totalProbability = 0
  const generateCombinations = (index: number, remainingHand: number, probability: number) => {
    if (index === conditions.length) {
      if (remainingHand >= 0) {
        totalProbability += probability
      }
      return
    }

    const condition = conditions[index]
    for (let i = condition.min; i <= Math.min(condition.max, remainingHand, condition.amount); i++) {
      const currentProb = calculateHypergeometric(deckSize, remainingHand, condition.amount, i)
      if (currentProb > 0) {
        generateCombinations(index + 1, remainingHand - i, probability * (currentProb / 100))
      }
    }
  }

  generateCombinations(0, handSize, 1)
  return totalProbability * 100
}

