import { ArenaCursor } from '@/components/ui/arena-cursor'

export default function DoorprizeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="doorprize-arena">
      <ArenaCursor />
      {children}
    </div>
  )
}
