"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { calculateMultipleConditions } from "./probability-utils"

interface CardEntry {
  name: string
  amount: number
  min: number
  max: number
}

const calculateMiscellaneous = (cardEntries: CardEntry[], deckSize: number, handSize: number) => {
  const totalAmount = cardEntries.reduce((sum, entry) => sum + entry.amount, 0)
  const miscAmount = Math.max(0, deckSize - totalAmount)
  const miscMin = Math.max(0, handSize - cardEntries.reduce((sum, entry) => sum + entry.max, 0))
  const miscMax = handSize - cardEntries.reduce((sum, entry) => sum + entry.min, 0)
  return { amount: miscAmount, min: miscMin, max: Math.max(miscMax, miscMin) }
}

export default function Calculator() {
  const [deckSize, setDeckSize] = useState(40)
  const [handSize, setHandSize] = useState(5)
  const [cardEntries, setCardEntries] = useState<CardEntry[]>([])
  const [probability, setProbability] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addCardEntry = () => {
    setCardEntries([...cardEntries, { name: "", amount: 1, min: 1, max: 1 }])
  }

  const removeCardEntry = (index: number) => {
    setCardEntries(cardEntries.filter((_, i) => i !== index))
  }

  const updateCardEntry = (index: number, field: keyof CardEntry, value: string | number) => {
    const newEntries = [...cardEntries]
    newEntries[index] = {
      ...newEntries[index],
      [field]: typeof value === "string" ? value : Math.max(0, Math.min(Number(value), deckSize)),
    }
    setCardEntries(newEntries)
  }

  const calculateProbability = useCallback(() => {
    setError(null)

    // Validation checks
    if (deckSize <= 0) {
      setError("Deck size must be greater than 0.")
      return null
    }
    if (handSize <= 0 || handSize > deckSize) {
      setError("Hand size must be between 1 and the deck size.")
      return null
    }

    const misc = calculateMiscellaneous(cardEntries, deckSize, handSize)
    const allEntries = [...cardEntries, { name: "Miscellaneous", ...misc }]

    for (const entry of allEntries) {
      if (entry.amount < 0 || entry.min < 0 || entry.max < 0) {
        setError("All values must be non-negative.")
        return null
      }
      if (entry.min > entry.amount) {
        setError("The min column cannot exceed the amount of cards entered.")
        return null
      }
      if (entry.max > entry.amount) {
        setError("The max column cannot exceed the amount of cards entered.")
        return null
      }
      if (entry.min > entry.max) {
        setError("The min value cannot be greater than the max value.")
        return null
      }
    }

    const totalCards = allEntries.reduce((sum, entry) => sum + entry.amount, 0)
    if (totalCards !== deckSize) {
      setError("Total amount of cards must equal deck size.")
      return null
    }

    try {
      const probability = calculateMultipleConditions(
        deckSize,
        handSize,
        allEntries.map(({ amount, min, max }) => ({ amount, min, max })),
      )
      return probability
    } catch (e) {
      setError("Error calculating probability. Please check your inputs.")
      return null
    }
  }, [cardEntries, deckSize, handSize])

  useEffect(() => {
    const newProbability = calculateProbability()
    setProbability(newProbability)
  }, [calculateProbability])

  const getProbabilityColor = (prob: number) => {
    if (prob >= 75) return "text-green-400"
    if (prob >= 50) return "text-yellow-400"
    if (prob >= 25) return "text-orange-400"
    return "text-red-600"
  }

  const misc = calculateMiscellaneous(cardEntries, deckSize, handSize)

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <Card className="max-w-4xl mx-auto bg-black border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold text-white">
            Yu-Gi-Oh Deck Probability Calculator
          </CardTitle>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            A simple hypergeometric calculator for calculating the probability
            of opening any combo of cards from your deck. You're one step closer
            to having a better deck with this tool.
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="mb-8">
            <AccordionItem value="examples">
              <AccordionTrigger className="text-white hover:text-white/90">Examples</AccordionTrigger>
              <AccordionContent className="text-gray-300">
                <div className="space-y-6">
                  <div>
                    <p className="mb-2">
                      To find the chance of opening your only copy of Allure of Darkness along with at least 1 of your
                      10 DARK monsters, use the following:
                    </p>
                    <Table className="border border-white/20">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-white">Name</TableHead>
                          <TableHead className="text-white">Amount</TableHead>
                          <TableHead className="text-white">Min</TableHead>
                          <TableHead className="text-white">Max</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Allure</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>1</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>DARK</TableCell>
                          <TableCell>10</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>4</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <p className="mb-2">
                      To find the chance of opening one of your 5 copies of Dragon Ravine along with at least 1
                      Dragunity Dux or Dragunity Phalanx (both of which you run at 3) use:
                    </p>
                    <Table className="border border-white/20">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-white">Name</TableHead>
                          <TableHead className="text-white">Amount</TableHead>
                          <TableHead className="text-white">Min</TableHead>
                          <TableHead className="text-white">Max</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Ravine</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>5</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Dux or Phalanx</TableCell>
                          <TableCell>6</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>6</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <Label htmlFor="deckSize" className="text-white">
                Deck Size
              </Label>
              <Input
                id="deckSize"
                type="number"
                value={deckSize}
                onChange={(e) => setDeckSize(Math.max(1, Number.parseInt(e.target.value) || 0))}
                className="bg-black border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="handSize" className="text-white">
                Hand Size
              </Label>
              <Input
                id="handSize"
                type="number"
                value={handSize}
                onChange={(e) => setHandSize(Math.max(0, Number.parseInt(e.target.value) || 0))}
                className="bg-black border-white/20 text-white"
              />
            </div>
          </div>

          <Table className="border border-white/20 mb-4">
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Card Name</TableHead>
                <TableHead className="text-white">Amount</TableHead>
                <TableHead className="text-white">Min</TableHead>
                <TableHead className="text-white">Max</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-gray-500">
                <TableCell>Miscellaneous</TableCell>
                <TableCell>{misc.amount}</TableCell>
                <TableCell>{misc.min}</TableCell>
                <TableCell>{misc.max}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              {cardEntries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={entry.name}
                      onChange={(e) => updateCardEntry(index, "name", e.target.value)}
                      placeholder="Card Name"
                      className="bg-black border-white/20 text-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={entry.amount}
                      onChange={(e) => updateCardEntry(index, "amount", Number.parseInt(e.target.value))}
                      className="bg-black border-white/20 text-white w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={entry.min}
                      onChange={(e) => updateCardEntry(index, "min", Number.parseInt(e.target.value))}
                      className="bg-black border-white/20 text-white w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={entry.max}
                      onChange={(e) => updateCardEntry(index, "max", Number.parseInt(e.target.value))}
                      className="bg-black border-white/20 text-white w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCardEntry(index)}
                      className="text-white hover:text-white/80 hover:bg-white/20"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end mb-8">
            <Button
              onClick={addCardEntry}
              variant="outline"
              className="border-white/20 bg-white/20 text-white hover:bg-transparent hover:text-gray-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>

          <div className="text-center p-4 border border-white/20 rounded-lg">
            <p className="text-xl font-semibold text-white">
              {error ? (
                <span className="text-red-500">Unable to calculate percentage. {error}</span>
              ) : probability !== null ? (
                <>
                  You have a <span className={getProbabilityColor(probability)}>{probability.toFixed(2)}%</span> chance
                  to open this hand.
                </>
              ) : (
                <span className="text-yellow-500">Calculating probability...</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
      <footer className="min-h-screen bg-black text-white p-4 md:p-8">
        <p className="text-gray-300">Inspired by yugioh.party, which at the time of this tool's creation is down.
        </p>
      </footer>
    </div>
    
  )
}

