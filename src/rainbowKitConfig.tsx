"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { anvil, zksync } from "wagmi/chains"

export default getDefaultConfig({
    appName: "TSender",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [anvil, zksync],
    ssr: false //server-side rendering is not supported in this example because it will be a static page
})