"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Coffee } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function TipJar() {
  const [amount, setAmount] = useState("3")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)

      // Reset after showing success message
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-white hover:bg-amber-50">
          <Coffee className="h-4 w-4 text-amber-600" />
          <span className="text-amber-700">Support Us</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-600" />
            Support Remix Games
          </DialogTitle>
          <DialogDescription>
            Your tips help us maintain the site and create more content for board game enthusiasts.
          </DialogDescription>
        </DialogHeader>
        {showSuccess ? (
          <div className="py-6 text-center">
            <h3 className="text-xl font-medium text-green-600 mb-2">Thank you for your support!</h3>
            <p className="text-gray-600">Your contribution helps us keep the games flowing.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tip-amount">Choose an amount</Label>
                <RadioGroup id="tip-amount" value={amount} onValueChange={setAmount} className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer">
                      $1
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer">
                      $3
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="r3" />
                    <Label htmlFor="r3" className="cursor-pointer">
                      $5
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10" id="r4" />
                    <Label htmlFor="r4" className="cursor-pointer">
                      $10
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Or enter a custom amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="custom-amount"
                    className="pl-7"
                    placeholder="Custom amount"
                    type="number"
                    min="1"
                    step="1"
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Input id="message" placeholder="Say something nice..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Support with $${amount}`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
