import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  loading: boolean
  isUploading: boolean
}

export function SubmitButton({ loading, isUploading }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      className="bg-halal-primary hover:bg-halal-primary/90 w-full font-bold text-black"
      disabled={loading || isUploading}
    >
      {loading || isUploading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isUploading ? 'Memproses File...' : 'Mendaftarkan...'}
        </>
      ) : (
        'Daftar Sekarang'
      )}
    </Button>
  )
}
