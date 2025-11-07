import Image from "next/image";
import { FC } from "react";

import LogoImg from "../../../public/main-logo.png";

interface logoProps {
  width: string;
  height: string;
}

const Logo: FC<logoProps> = ({ width, height }) => {
  return (
    <div className="z-50" style={{width:width, height:height }}>
      <Image src={LogoImg} 
       alt="jauma cars"
      className="w-full h-full object-cover overflow-visible"/>
    </div>
  );
};

export default Logo;
