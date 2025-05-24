import { getImage } from '@/lib/user';
import Image from 'next/image';

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const result = await getImage(id);
  if ('error' in result) {
    return <div>{result.error}</div>;
  }
  return (
    <div className='relative w-full h-full flex items-center justify-center'>
      <div className='responsive-image-container'>
        <Image
          src={`https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${result.data}` || "/placeholder.svg"}
          alt={result.data || "Image"}
          className='aspect-auto w-full h-full max-w-[80vw] max-h-[80vh]'
          unoptimized
          width={100}
          height={100}
        />
      </div>
    </div>
  )
}

export default page