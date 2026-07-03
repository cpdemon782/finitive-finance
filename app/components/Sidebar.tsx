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
  const base = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1 transition-all '
  const cls = base + (active ? 'text-white bg-[#c9a84c]/15 font-medium' : 'text-white/50 hover:text-white hover:bg-white/5')
  return (
    <a href={href} className={cls}>
      {label}
      {badge > 0 && <span className="ml-auto bg-[#c9a84c] text-[#1a1610] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
    </a>
  )
}
      )}
    </a>
  )
}

export default function Sidebar({ user, portal, activePage, pendingApplications = 0 }: SidebarProps) {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const initials = user?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'

  return (
    <div className="w-52 bg-[#1a1610] flex flex-col flex-shrink-0 fixed h-full">
      <div className="p-4 border-b border-[#c9a84c]/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#c9a84c] rounded-lg flex items-center justify-center text-xs font-bold text-[#1a1610]">FF</div>
          <div>
            <div className="text-sm font-semibold text-white">Finitive Finance</div>
            <div className="text-[10px] text-[#c9a84c]/60 font-mono">
              {portal === 'internal' ? 'DEAL PLATFORM' : 'AFFILIATE PORTAL'}
            </div>
          </div>
        </div>
      </div>

      <nav className="p-2 flex-1 overflow-y-auto">
        {portal === 'internal' ? (
          <>
            <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest">MAIN</div>
            <NavItem href="/dashboard" label="Dashboard" active={activePage === 'dashboard'} />
            <NavItem href="/dashboard/pipeline" label="Pipeline" active={activePage === 'pipeline'} />
            <NavItem href="/dashboard/leads" label="All Leads" active={activePage === 'leads'} />
            <NavItem href="/dashboard/tasks" label="Tasks" active={activePage === 'tasks'} />
            <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">MANAGEMENT</div>
            <NavItem href="/dashboard/affiliates" label="Affiliates" active={activePage === 'affiliates'} />
            <NavItem href="/dashboard/applications" label="Applications" active={activePage === 'applications'} badge={pendingApplications} />
            <NavItem href="/dashboard/team" label="Team" active={activePage === 'team'} />
            <NavItem href="/dashboard/reports" label="Reports" active={activePage === 'reports'} />
          </>
        ) : (
          <>
            <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest">MY PORTAL</div>
            <NavItem href="/affiliate/dashboard" label="Dashboard" active={activePage === 'dashboard'} />
            <NavItem href="/affiliate/leads" label="My Leads" active={activePage === 'leads'} />
            <NavItem href="/affiliate/submit" label="Submit Lead" active={activePage === 'submit'} />
            <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">FINANCIALS</div>
            <NavItem href="/affiliate/commissions" label="Commissions" active={activePage === 'commissions'} />
            <div className="text-[10px] text-[#c9a84c]/40 font-mono px-2 py-2 tracking-widest mt-2">ACCOUNT</div>
            <NavItem href="/affiliate/profile" label="My Profile" active={activePage === 'profile'} />
            <NavItem href="/affiliate/support" label="Support" active={activePage === 'support'} />
          </>
        )}
      </nav>

      <div className="p-3 border-t border-[#c9a84c]/20">
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer"
          onClick={handleSignOut}
        >
          <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center text-xs font-bold text-[#1a1610]">
            {initials}
          </div>
          <div>
            <div className="text-xs font-medium text-white">{user?.full_name}</div>
            <div className="text-[10px] text-white/40">Sign out</div>
          </div>
        </div>
      </div>
    </div>
  )
}
