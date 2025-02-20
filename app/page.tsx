"use client";

import {
  useEffect,
  useState,
} from 'react';

import { Changa_One } from 'next/font/google';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { createThirdwebClient } from 'thirdweb';
import { base } from 'thirdweb/chains';
import {
  ConnectButton,
  useActiveWallet,
  useSwitchActiveWalletChain,
} from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import {
  formatEther,
  formatUnits,
  parseEther,
} from 'viem';
import {
  useAccount,
  useBalance,
  useReadContracts,
  useWriteContract,
} from 'wagmi';

import GFestGen1ABI from '@/abis/GFestGen1.json';
import MintImage1 from '@/assets/images/crate-1.gif';
import MintImage2 from '@/assets/images/crate-2.gif';
import MintImage3 from '@/assets/images/crate-3.gif';
import BgImage from '@/assets/images/desktop-bg.jpg';
import LogoImage from '@/assets/images/ghostfest-logo-001.png';
import ModalLogoImage from '@/assets/images/ghostfest-logo-001_.png';
import MBgImage from '@/assets/images/mobile-bg.jpg';
import OpenSeaLogoImage
  from '@/assets/images/OpenSeaLogomark-Transparent-White.svg';
import NftCard from '@/components/nftCard';
import Spinner from '@/components/spinner';
import { Icon } from '@iconify/react/dist/iconify.js';

const changaOne = Changa_One({ weight: "400", subsets: ["latin"] });

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
}

const initialNftCards: params[] = [
  {
    title: "GhostFam",
    url: MintImage1,
    isActive: false,
    control: false,
    price: 0,
    count: {
      maxSupply: 500,
      mintCount: 0,
      left: 0,
    },
  },
  {
    title: "EarlyGhost",
    url: MintImage2,
    isActive: false,
    control: false,
    price: 0.01,
    count: {
      maxSupply: 750,
      mintCount: 0,
      left: 0,
    },
  },
  {
    title: "PublicMint",
    url: MintImage3,
    isActive: false,
    control: true,
    price: 0.02,
    count: {
      maxSupply: 1250,
      mintCount: 0,
      left: 0,
    },
  },
];

const client = createThirdwebClient({
  secretKey: process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY!,
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("app.backpack"),
  createWallet("io.magiceden.wallet"),
];

const customModalStyles = {
  content: {
    maxWidth: "800px",
    margin: "auto",
    zIndex: 50,
    borderRadius: "30px",
    border: "2px solid #4E07B1",
    backgroundColor: "#000b",
    inset: "20px",
    maxHeight: "800px",
  },
  overlay: {
    backgroundColor: "#000000a0",
    zIndex: 1500,
  },
};

export default function Home() {
  const [nftCards, setNftCards] = useState<params[]>(initialNftCards);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const { address, isConnected, chain, chainId } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address: address,
  });
  const [isMinting, setIsMinting] = useState<boolean>(false);

  const { writeContractAsync } = useWriteContract();
  const [totalCost, setTotalCost] = useState<number>(0);
  const [announce, setAnnounce] = useState<string>("");
  const GFestGen1Contract = {
    abi: GFestGen1ABI,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS! as `0x${string}`,
  } as const;

  const wallet = useActiveWallet();

  const switchChain = useSwitchActiveWalletChain();

  useEffect(() => {
    console.log("chain id", chainId);
    if (wallet && chainId && chainId !== Number(process.env.NEXT_PUBLIC_CHAIN_ID)) {
      switchChain(base).catch((err: any) => {
        console.error("Failed to switch chain:", err);
      });
    }
  }, [chainId, switchChain]);

  const result = useReadContracts({
    contracts: [
      {
        ...GFestGen1Contract,
        functionName: "maxSupplyFreeMint",
      },
      {
        ...GFestGen1Contract,
        functionName: "maxSupplyEarlyGhost",
      },
      {
        ...GFestGen1Contract,
        functionName: "maxSupply",
      },
      {
        ...GFestGen1Contract,
        functionName: "earlyGhostPrice",
      },
      {
        ...GFestGen1Contract,
        functionName: "salePrice",
      },
      {
        ...GFestGen1Contract,
        functionName: "isFreeMintTime",
      },
      {
        ...GFestGen1Contract,
        functionName: "isEarlyGhostTime",
      },
      {
        ...GFestGen1Contract,
        functionName: "isSaleTime",
      },
      {
        ...GFestGen1Contract,
        functionName: "freeMintTokensLeft",
        args: [address],
      },
      {
        ...GFestGen1Contract,
        functionName: "earlyGhostTokensLeft",
        args: [address],
      },
      {
        ...GFestGen1Contract,
        functionName: "totalSupply",
      },
    ],
  });
  

  const [showModal, setShowModal] = useState(false);

  const onMintNFT = async () => {
    console.log("chain Id", chainId, process.env.NEXT_PUBLIC_CHAIN_ID?.toString());
    try {
      if (
        chainId != process.env.NEXT_PUBLIC_CHAIN_ID?.toString()
      ) {
        toast.error("Wrong Network!");
        return;
      }

      console.log("result", result);

      if (!result?.data || !nftCards.length || currentStep == -1) return;
      if (
        nftCards[currentStep].control &&
        (nftCards[currentStep].count.mintCount >
          nftCards[currentStep].count.left ||
          nftCards[currentStep].count.mintCount == 0)
      ) {
        toast.error("Wrong count!");
        return;
      }
      const totalSupply = parseInt(
        formatUnits(result.data[10].result as bigint, 0)
      );
      const balance: number = parseFloat(data?.formatted || "");
      setIsMinting(true);
      if (result.data[5].result) {
        if (totalSupply + 1 > 500) {
          toast.error("Max Supply reached!");
          return;
        }
        if (nftCards[0].count.mintCount == 0) {
          toast.error("You can't mint nft!");
          return;
        }
        const res = await writeContractAsync({
          ...GFestGen1Contract,
          functionName: "mintFreemint",
        });
        setShowModal(true);
      }
      if (result.data[6].result) {
        if (totalSupply + 1 > 1250) {
          toast.error("Max Supply reached!");
          return;
        }
        const value = nftCards[1].price;
        if (value > balance) {
          toast.error("Insufficient balance!");
          return;
        }
        if (nftCards[1].count.mintCount == 0) {
          toast.error("You can't mint nft!");
          return;
        }
        const res = await writeContractAsync({
          ...GFestGen1Contract,
          functionName: "mintEarlyGhost",
          value: parseEther(value.toString()),
        });
        setShowModal(true);
      }
      if (result.data[7].result) {
        if (totalSupply + nftCards[2].count.mintCount > 1250) {
          toast.error("Max Supply reached!");
          return;
        }
        const value = nftCards[2].count.mintCount * nftCards[2].price;
        if (value > balance) {
          toast.error("Insufficient balance!");
          return;
        }
        const res = await writeContractAsync({
          ...GFestGen1Contract,
          functionName: "mintSale",
          args: [nftCards[2].count.mintCount],
          value: parseEther(value.toString()),
        });
        setShowModal(true);
      }
    } catch (e: any) {
      console.log(e);
    } finally {
      setIsMinting(false);
    }
  };

  const onPlus = () => {
    const cards = [...nftCards];
    if (!isConnected || currentStep != 2) return;
    const card = cards[2].count;
    if (card.mintCount >= card.left) {
      return;
    }
    cards[2].count.mintCount++;
    setNftCards(cards);
  };

  const onMinus = () => {
    const cards = [...nftCards];
    if (!isConnected || currentStep != 2) return;
    const card = cards[2].count;
    if (card.mintCount <= 0) {
      return;
    }
    cards[2].count.mintCount--;
    setNftCards(cards);
  };

  const onChange = (e: any) => {
    if (!isConnected || currentStep != 2) return;
    const left = e.target.value || 0;
    const cards = [...nftCards];
    const card = cards[2].count;
    if (left < 0 || left > card.left) {
      return;
    }
    cards[2].count.mintCount = parseInt(left) || 0;
    setNftCards(cards);
  };

  const setCardInfo = (res: any, mintCount: number) => {
    const cards = [
      {
        ...initialNftCards[0],
        price: 0,
        isActive: res[5].result,
        count: {
          maxSupply: 500,
          left: mintCount > 2000 ? 2500 - mintCount: 0,
          mintCount: res[8]?.result || 0,
        },
      },
      {
        ...initialNftCards[1],
        price: parseFloat(formatEther(res[3].result as bigint)),
        isActive: res[6].result,
        count: {
          maxSupply: 750,
          left: mintCount > 1250 ? 2000 - mintCount: 0,
          mintCount: res[9]?.result || 0,
        },
      },
      {
        ...initialNftCards[2],
        price: parseFloat(formatEther(res[4].result as bigint)),
        isActive: res[7].result,
        count: {
          maxSupply: 1250,
          left: mintCount <= 1250 ? 1250 - mintCount : 0,
          mintCount: parseFloat(formatUnits(res[10]?.result || 0, 0)),
        },
      },
    ];
    setNftCards([...cards]);
  };

  useEffect(() => {
    if (!isConnected) {
      setNftCards([...initialNftCards]);
    } else {
      if (!result.data) return;
      const res = result.data;
      const mintCount = parseInt(formatUnits(res[10].result as bigint, 0));

      console.log("mint count", mintCount);

      setCardInfo(res, mintCount);
    }
  }, [isConnected, result.data]);

  useEffect(() => {
    try {
      if (!result.data) return;
      const res = result.data;
      const mintCount = parseInt(formatUnits(res[10].result as bigint, 0));
      setCardInfo(res, mintCount);

      if (res[5].result) {
        setCurrentStep(0);
        setAnnounce("LiveNow: GhostFam.");
      } else if (res[6].result) {
        setCurrentStep(1);
        setAnnounce("LiveNow: EarlyGhost.");
      } else if (res[7].result) {
        setCurrentStep(2);
        setAnnounce("LiveNow: PublicMint.");
      } else {
        setCurrentStep(-1);
        setAnnounce("Not available yet.");
      }
    } catch (e) {
      console.log(e);
    }
  }, [result.data]);

  useEffect(() => {
    if (currentStep == -1) return;
    if (currentStep == 2) {
      setTotalCost(
        (nftCards[currentStep].count.mintCount *
          (nftCards[currentStep].price * 10000)) /
          10000 || 0
      );
    } else {
      setTotalCost(nftCards[currentStep].price || 0);
    }
  }, [currentStep, nftCards]);

  return (
    <div className={`w-full h-full`}>
      {isMinting && <Spinner />}
      <Image
        src={BgImage}
        alt="Background Image"
        className="hidden sm:block"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      />
      <Image
        src={MBgImage}
        alt="Background Image"
        className="block sm:hidden"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      />
      <div className="relative max-w-[960px] m-auto px-4">
        <div className="mt-[90px] mb-5 sm:mt-0">
          <Image
            src={LogoImage}
            alt="Logo Image"
            width={350}
            className="m-auto sm:ml-auto sm:mr-0"
          />
        </div>
        <div className="fixed block w-full min-h-[90px] z-40 text-center bg-[#000000d9] rounded-br-[20px] rounded-bl-[20px] pt-[30px] pb-[20px] top-0 left-0 sm:hidden">
          <div className="flex justify-center">
            <ConnectButton
              client={client}
              wallets={wallets}
              connectModal={{
                size: "wide",
                title: "Ghost Festival Mint",
                showThirdwebBranding: false,
              }}
              connectButton={{
                label: "Connect",
                className: `connectWallet !font-climate-crisis`,
              }}
              chain={base}
              chains={[base]}
              detailsButton={{
                className: "connectedWallet",
                connectedAccountAvatarUrl: `https://api.dicebear.com/6.x/adventurer/svg?seed=${
                  Math.random() % 100
                }`,
              }}
            />
          </div>
        </div>
        <section className="flex items-center justify-between">
          <p
            className={`hidden text-[#0fc] text-[60px] font-climate-crisis sm:block`}
            style={{
              WebkitTextStrokeWidth: "2px",
              WebkitTextStrokeColor: "#6cc",
              textShadow: "5px 5px 0 #5b00da",
              WebkitTextFillColor: "inherit",
              backgroundClip: "border-box",
              lineHeight: 1,
            }}
          >
            Mint on Base
          </p>
          <p
            className={`block text-[#0fc] text-[60px] font-climate-crisis sm:hidden`}
            style={{
              WebkitTextStrokeWidth: "2px",
              WebkitTextStrokeColor: "#5b00da",
              textShadow: "5px 5px 0 #5b00da",
              WebkitTextFillColor: "inherit",
              backgroundClip: "border-box",
              lineHeight: 1,
            }}
          >
            Mint on Base
          </p>
          <div className="hidden sm:block">
            <ConnectButton
              client={client}
              wallets={wallets}
              connectModal={{
                size: "wide",
                title: "Ghost Festival Mint",
                showThirdwebBranding: false,
              }}
              connectButton={{
                label: "Connect",
                className: `connectWallet !font-climate-crisis`,
              }}
              detailsButton={{
                className: "connectedWallet",
                connectedAccountAvatarUrl: `https://api.dicebear.com/6.x/adventurer/svg?seed=${
                  Math.random() % 100
                }`,
              }}
            />
          </div>
        </section>

        <div
          className={`text-center mb-1 ml-0 mr-0 text-[42px] text-[#ca69ff] ${changaOne.className} lg:text-left bg-[#000000c4] rounded-[30px] px-8 py-2 mt-5`}
          style={{
            lineHeight: 1,
          }}
        >
          {announce}
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 mb-[200px] gap-2 sm:mb-0 mt-3">
          {nftCards.map((card, index) => (
            <div key={index}>
              <NftCard
                title={card.title}
                url={card.url}
                isActive={card.isActive}
                price={card.price}
                control={card.control}
                count={card.count}
                onPlus={onPlus}
                onMinus={onMinus}
                onChange={onChange}
              />
            </div>
          ))}
        </section>
        <section className="hidden items-center justify-center my-[30px] sm:flex">
          <div
            className={`flex mt-0 mr-[59px] w-[350px] text-white items-center outline-[3px] rounded-[10px] bg-[#000000db] text-center outline-[#5b00da] border-[3px] border-solid border-[#5b00da] text-[28px] ${changaOne.className}`}
          >
            <p className="flex-1 text-[#0fc] text-center">Total:</p>
            <p className="flex-1 text-center">{totalCost} ETH</p>
          </div>
          <button
            className={`py-1 px-[35px] text-[32px] text-center text-[#ffff00] border-[3px] border-solid border-[#ffff00] bg-[#5b00da] rounded-[10px]
              outline-[2px] outline-[#0f9] font-climate-crisis ${
                isConnected ? "cursor-pointer" : "cursor-not-allowed"
              }`}
            disabled={!isConnected}
            onClick={onMintNFT}
          >
            MINT!
          </button>
        </section>
        <section className="fixed flex flex-col items-center justify-center w-full z-40 text-center bg-[#000000d9] rounded-tr-[20px] rounded-tl-[20px] p-[20px] bottom-0 left-0 sm:hidden">
          <div
            className={`flex mb-5 w-[280px] text-white items-center outline-[3px] rounded-[10px] bg-[#000000db] text-center outline-[#5b00da] border-[3px] border-solid border-[#5b00da] text-[24px] ${changaOne.className}`}
          >
            <p className="flex-1 text-[#0fc] text-center">Total:</p>
            <p className="flex-1 text-center">{totalCost} ETH</p>
          </div>
          <button
            className={`py-2 px-[35px] text-[28px] text-center text-[#0fc] border-[3px] border-solid border-[#0fc] bg-[#5b00da] rounded-[10px]
            outline-[2px] outline-[#0f9] font-climate-crisis ${
              isConnected ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            disabled={!isConnected}
            onClick={onMintNFT}
          >
            MINT!
          </button>
        </section>

        <Modal
          isOpen={showModal}
          style={customModalStyles}
          onRequestClose={() => setShowModal(false)}
        >
          <button
            className="absolute top-5 right-5 block"
            onClick={() => setShowModal(false)}
          >
            <Icon
              icon="material-symbols:close-rounded"
              className="text-2xl text-white"
            />
          </button>
          <div className="flex flex-wrap justify-center m-auto text-center">
            <Image
              src={ModalLogoImage}
              alt="modalLogo"
              className="w-[200px] md:w-[350px] mt-10"
            />
            <div
              className={`text-center mb-1 ml-0 mr-0 text-[42px] text-[#0fc] lg:text-left`}
            >
              <p
                className="text-center text-4xl md:text-7xl font-400 font-climate-crisis mt-7"
                style={{
                  textShadow: "3px 3px 0 #5b00da",
                }}
              >
                Congrats!
              </p>
              <p className="text-[#ca69ff] font-thin  font-climate-crisis text-center text-2xl md:text-4xl mt-5">
                Your mint was successful.
              </p>
              <a
                className={`mt-10 modal_button w-[250px] py-3 px-[10px] text-[18px] text-center text-white  bg-[#5b00da] rounded-[10px]
              outline-[2px] outline-[#0f9] font-climate-crisis cursor-pointer m-auto flex justify-center items-center align-middle"
              }`}
                href="https://opensea.io"
                target="_blank"
              >
                <Image
                  alt="openseaLogo"
                  src={OpenSeaLogoImage}
                  className="w-[60px]"
                />
                <p className="font-thin  font-climate-crisis">
                  Check on Opensea
                </p>
              </a>
              <button
                className={`modal_button w-[150px] py-3 px-[5px] text-[16px] text-center text-white  bg-[#5b00da] rounded-[10px]
              outline-[2px] outline-[#0f9] font-climate-crisis cursor-pointer m-auto flex justify-center items-center align-middle "
              }`}
                style={{ marginTop: 20 }}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
