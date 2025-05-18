"use client"

import { Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"

export default function TipJar() {
  const [activeQR, setActiveQR] = useState<'kofi' | 'coffee' | null>(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
          <Coffee className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Buy me a coffee</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-black">Support Remix Games</DialogTitle>
          <DialogDescription className="text-gray-600">
            Help keep this project running by buying me a coffee. Your support means a lot!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-48">
              <img 
                src="/images/ko-fi.png"
                alt="Ko-fi QR Code"
                className={`absolute top-0 left-0 w-full h-full rounded-lg bg-white shadow-md transition-opacity duration-300 ${activeQR === 'kofi' ? 'opacity-100' : 'opacity-0'}`}
              />
              <img 
                src="/images/buymeacoffee.png"
                alt="Buy Me a Coffee QR Code"
                className={`absolute top-0 left-0 w-full h-full rounded-lg bg-white shadow-md transition-opacity duration-300 ${activeQR === 'coffee' ? 'opacity-100' : 'opacity-0'}`}
              />
              <div className={`absolute top-0 left-0 w-full h-full rounded-lg bg-white shadow-md flex items-center justify-center text-gray-400 transition-opacity duration-300 ${!activeQR ? 'opacity-100' : 'opacity-0'}`}>
                Hover over a button to show QR code
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.open('https://ko-fi.com/remixgames', '_blank')}
                variant="outline"
                className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
                onMouseEnter={() => setActiveQR('kofi')}
                onMouseLeave={() => setActiveQR(null)}
              >
                <Coffee className="h-4 w-4 mr-2" />
                Ko-fi
              </Button>
              <Button
                onClick={() => window.open('https://buymeacoffee.com/remixgames', '_blank')}
                variant="outline"
                className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
                onMouseEnter={() => setActiveQR('coffee')}
                onMouseLeave={() => setActiveQR(null)}
              >
                <Coffee className="h-4 w-4 mr-2" />
                Buy Me a Coffee
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
