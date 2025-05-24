import Image from "next/image";

const NailLoader = () => {
  return (
    <div className="loader-overlay">
      <Image src="/aesthetic-nails.gif" alt="Nail Loader" width={400} height={400} />
    </div>
  );  
};

export default NailLoader;
