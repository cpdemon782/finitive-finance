'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '../../lib/supabase'

interface SidebarProps {
  user: any
  portal: 'internal' | 'affiliate'
  activePage: string
  pendingApplications?: number
}

function NavItem({ href, label, active, badge = 0 }: { href: string, label: string, active: boolean, badge?: number }) {
  return (
    
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1 transition-all ${
        active
          ? 'text-white bg-[#c9a84c]/15 font-medium'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
      {badge > 0 && (
        <span className="ml-auto bg-[#c9a84c] text-[#1a1610] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </a>
  )
}

export default function Sidebar({ user, portal, activePage, pendingApplications = 0 }: SidebarProps) {
  const router =
