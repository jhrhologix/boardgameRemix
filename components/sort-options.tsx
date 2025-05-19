"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface SortOptionsProps {
  className?: string
}

export default function SortOptions({ className }: SortOptionsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "popular"

  const [selectedSort, setSelectedSort] = useState<string>(currentSort)

  const sortOptions = [
    { label: "Most Popular", value: "popular" },
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Most Upvoted", value: "upvotes" },
    { label: "Most Controversial", value: "controversial" },
  ]

  const handleSortChange = (value: string) => {
    setSelectedSort(value)

    const params = new URLSearchParams(searchParams)
    params.set("sort", value)

    router.push(`?${params.toString()}`)
  }

  const selectedLabel = sortOptions.find((option) => option.value === selectedSort)?.label || "Sort By"

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 bg-black text-[#FF6B35] border-[#004E89]/20 hover:bg-[#004E89]/20 hover:text-[#FF6B35]">
            {selectedLabel}
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-black border-[#004E89]/20">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`${
                selectedSort === option.value 
                  ? "bg-[#004E89]/20 font-medium text-[#FF6B35]" 
                  : "text-gray-300 hover:bg-[#004E89]/10 hover:text-[#FF6B35]"
              }`}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
