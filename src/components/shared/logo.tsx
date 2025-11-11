import Image from "next/image";
import { FC } from "react";

import LogoImg from "../../../public/marsacars-logo2.png";

interface logoProps {
  width?: string;
  height?: string;
}

const Logo: FC<logoProps> = ({ width = "auto", height = "auto" }) => {
  return (
    <div className="relative" style={{width, height }}>
      <Image 
        src={LogoImg} 
        alt="Marsa Cars"
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
};

export default Logo;
