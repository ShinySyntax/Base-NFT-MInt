import {
  Changa_One,
  Climate_Crisis,
  Varela_Round,
} from 'next/font/google';
import Image from 'next/image';

const climateCrisis = Climate_Crisis({ subsets: ["latin"] });
const changaOne = Changa_One({ weight: "400", subsets: ["latin"] });
const varelaRound = Varela_Round({ weight: "400", subsets: ["latin"] });

interface params {
  title: string;
  url: any;
  isActive?: boolean;
  control: boolean;
  price: number;
  count: {
    maxSupply: number;
    left: number;
    mintCount: number;
  };
  onPlus: () => void;
  onMinus: () => void;
  onChange: (e: any) => void;
}

export default function NftCard({
  title,
  url,
  isActive = true,
  control,
  price = 0,
  count,
  onPlus,
  onMinus,
  onChange,
}: params) {
  return (
    <div className="relative">
      {!isActive && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-800/70 blur-sm cursor-not-allowed rounded-[20px]"></div>
      )}
      <div className="p-0 lg:p-6 border-[1px] border-solid border-[#5b00da] outline-offset-0 outline-[#0fc] bg-[#000000c4] rounded-[20px] outline-[3px] w-full">
        <div
          className={`text-center mb-1 ml-0 mr-0 text-[42px] text-[#0fc] ${changaOne.className} lg:text-left`}
          style={{
            textShadow: "3px 3px 0 #5b00da",
            lineHeight: 1,
          }}
        >
          <p>{title}</p>
          <p
            className="text-[#ca69ff]"
            style={{
              textShadow: "3px 3px 0 #5b00da",
            }}
          >
            ‍Base Crate
          </p>
        </div>
        <div className="w-[250px] md:w-full lg:w-[250px] rounded-[20px] overflow-hidden m-auto aspect-square">
          {/* <video autoPlay loop muted>
            <source src={url} data-wf-ignore="true" />
          </video> */}
          <Image src={url} alt="mint image" />
        </div>
        <p
          className={`text-center text-white mx-0 py-[10px] text-[18px] leading-[20px] ${varelaRound.className}`}
        >
          {count.left}/{count.maxSupply} left
        </p>
        <div>
          <div className="flex items-center justify-evenly mb-[10px]">
            {control && (
              <div>
                <button
                  className={`w-10 h-10 text-black bg-[#668aff] rounded-[10px] text-[24px] leading-none
                ${climateCrisis.className} active:text-[#ffff00] active:bg-[#5b00da] active:text-[32px]`}
                  onClick={onMinus}
                >
                  -
                </button>
              </div>
            )}
            <div>
              {control ? (
                <input
                  type="text"
                  pattern="[0-9]*"
                  className={`h-[60px] w-[60px] text-center text-[#0fc] bg-black border-0 border-solid border-[#0fc] rounded-[10px] leading-[60px] text-[24px]
                  ${changaOne.className}`}
                  value={count.mintCount}
                  onChange={onChange}
                />
              ) : (
                <input
                  type="text"
                  pattern="[0-9]*"
                  className={`h-[60px] w-[60px] text-center text-[#0fc] bg-black border-0 border-solid border-[#0fc] rounded-[10px] leading-[60px] text-[24px]
                  ${changaOne.className}`}
                  value={count.mintCount}
                  disabled
                />
              )}
            </div>
            {control && (
              <div>
                <button
                  className={`w-10 h-10 text-black bg-[#668aff] rounded-[10px] text-[24px] leading-none
                ${climateCrisis.className} active:text-[#ffff00] active:bg-[#5b00da] active:text-[32px]`}
                  onClick={onPlus}
                >
                  +
                </button>
              </div>
            )}
          </div>
          <h1
            className={`text-[#0fc] text-center mt-0 text-[24px] ${changaOne.className}`}
          >
            {price.toFixed(2)} ETH
          </h1>
        </div>
      </div>
    </div>
  );
}
