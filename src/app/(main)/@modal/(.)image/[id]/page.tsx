import Modal from '@/components/Modal';
import { getImage } from '@/lib/user';
import Image from 'next/image';

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const result = await getImage(id);
  if ('error' in result) {
    return <div>{result.error}</div>;
  }
  return (
    <Modal>
      <div className='m-3 flex justify-center items-center'>
        <Image
          src={result.data.startsWith("images/") ? `https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${result.data}` : result.data || "/placeholder.svg"}
          alt={result.data || "Image"}
          className='w-full h-full object-cover'
          width={100}
          height={100}
          unoptimized
        />
      </div>
    </Modal>
  )
}

export default page