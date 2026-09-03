'use client'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-full animate-in fade-in duration-200">
      {children}
    </div>
  )
}
