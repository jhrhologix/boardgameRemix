"use client"

import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchInputProps {
  defaultValue?: string
}

export default function SearchInput({ defaultValue = "" }: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (term) {
        params.set("q", term)
      } else {
        params.delete("q")
      }
      startTransition(() => {
        router.push(`/browse?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  const debouncedSearch = useDebounce(handleSearch, 300)

  return (
    <div>
      <h3 className="font-semibold mb-2 text-[#FF6B35]">Search</h3>
      <Input
        type="search"
        placeholder="Search remixes..."
        className="w-full bg-black border-[#004E89]/20 focus-visible:ring-[#004E89]/20 placeholder:text-gray-500 text-gray-300"
        defaultValue={defaultValue}
        onChange={(e) => debouncedSearch(e.target.value)}
      />
    </div>
  )
} 