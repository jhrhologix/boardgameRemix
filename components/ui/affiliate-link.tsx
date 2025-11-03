"use client"

import React from 'react'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AffiliateLinkProps {
  productId: string
  children: React.ReactNode
  className?: string
}

export function AffiliateLink({ productId, children, className }: AffiliateLinkProps) {
  const affiliateId = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID

  const buildAffiliateUrl = (productId: string) => {
    // Amazon affiliate temporarily disabled - using non-affiliate link
    // return `https://www.amazon.com/dp/${productId}?tag=${affiliateId}`
    return `https://www.amazon.com/dp/${productId}`
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className || ''}`}>
      <a
        href={buildAffiliateUrl(productId)}
        target="_blank"
        rel="nofollow noopener noreferrer sponsored"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info size={16} className="text-gray-400 hover:text-gray-600" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              Amazon affiliate links temporarily disabled.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  )
} 