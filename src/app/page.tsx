'use client';
import HomeContent from "@/components/HomeContent";
import {useAccount} from "wagmi";

export default function Home() {
  const {isConnected} = useAccount();
   return (
    <div>
      {isConnected ? (
        <HomeContent />
      ):(
        <div className="text-center mt-2">Please connect your wallet</div>
      )}
    </div>
  );
}
