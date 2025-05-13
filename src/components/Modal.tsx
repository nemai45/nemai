'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from './ui/dialog';

function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) {
        router.back();
      }
    }}>
      <DialogContent className='p-0 w-fit' style={{ borderRadius: "1rem", border: 0}}>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default Modal;