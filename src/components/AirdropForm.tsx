"use client";
import { useState, useMemo, useEffect } from "react";
import InputField from "@/components/ui/InputField";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { calculateTotal } from "@/utils";
import { CgSpinner } from "react-icons/cg"


export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [tokenDetails, setTokenDetails] = useState<{ name?: string, symbol?: string, decimals?: number }>({});
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts])
    const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })
    const { data: tokenData } = useReadContracts({
        contracts: [
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "decimals",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "name",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "balanceOf",
                args: [account.address],
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "symbol",
            },
        ],
    })

    async function getApprovalAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address found, please use a supported chain");
            return 0;
        }
        // Read from the chain to see if we have approved enough tokens
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress as `0x${string}`],
        })
        return response as number;
    }
    function getButtonContent() {
        if (isPending)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Confirming in wallet...</span>
                </div>
            )
        if (isConfirming)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Waiting for transaction to be included...</span>
                </div>
            )
        if (error || isError) {
            console.log(error)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <span>Error, see console.</span>
                </div>
            )
        }
        if (isConfirmed) {
            return "Transaction confirmed."
        }
        return "Send Tokens (Unsafe)"
    }

    async function handleSubmit() {
        // 1a. If already approved, move to step 2
        // 1b. Approve our tsender contract to send out tokens
        // 2. Call the airdrop function on the tsender contract
        // 3. Wait for the transaction to be mined

        const tSenderAddress = chainsToTSender[chainId]["tsender"];
        // console.log("address: %s, chainId: %s", tSenderAddress, chainId)
        const approvedAmount = await getApprovalAmount(tSenderAddress)
        console.log("approved amount: %s", approvedAmount);

        if (approvedAmount < total) {
            // 1b. Approve our tsender contract to send out tokens
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tSenderAddress as `0x${string}`, BigInt(total)],
            });
            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash
            })
            console.log("Approval confirmed: ", approvalReceipt);
            // Call airdrop once approval is confirmed
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            }).then((hash) => {
                console.log("Airdrop transaction hash: %s", hash);
            }).catch((error) => {
                console.error("Error sending airdrop:", error);
            })
        } else {
            // Approval not needed, proceed with airdrop
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            }).then((hash) => {
                console.log("Airdrop transaction hash: %s", hash);
            })
        }
    }

    // Load saved values from localStorage on component mount
    useEffect(() => {
        const savedToken = localStorage.getItem("tokenAddress");
        const savedRecipients = localStorage.getItem("recipients");
        const savedAmounts = localStorage.getItem("amounts");
        if (savedToken) setTokenAddress(savedToken);
        if (savedRecipients) setRecipients(savedRecipients);
        if (savedAmounts) setAmounts(savedAmounts);
    }, []);

    useEffect(() => {
        localStorage.setItem("tokenAddress", tokenAddress);
    }, [tokenAddress]);

    useEffect(() => {
        localStorage.setItem("recipients", recipients);
    }, [recipients]);

    useEffect(() => {
        localStorage.setItem("amounts", amounts);
    }, [amounts]);

    // Grab token details
    useEffect(() => {
        async function fetchTokenDetails() {
            if (!tokenAddress) return setTokenDetails({});
            try {
                setTokenDetails({ name: tokenData?.[1].result as string, symbol: tokenData?.[3].result as string, decimals: tokenData?.[0].result as number });
            } catch {
                setTokenDetails({});
            }
        }
        fetchTokenDetails();
    }, [tokenAddress, config]);
    return (
        <div>
            <InputField
                label="Token Address"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
            />
            <InputField
                label="Recipients"
                placeholder="0x123...,0x456..."
                large={true}
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
            />
            <InputField
                label="Amount"
                placeholder="100, 200, 300..."
                large={true}
                value={amounts}
                onChange={(e) => setAmounts(e.target.value)}
            />
            {isPending && (
                <div className="flex items-center gap-2 mt-4">
                    <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Waiting for confirmation...</span>
                </div>
            )}
            <button
                onClick={handleSubmit}
                className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
                {/* Send Tokens */}
                {isPending || error || isConfirming
                    ? getButtonContent()
                    : "Send Tokens (Unsafe)"
                }
            </button>
            {tokenDetails.name && (
                <div className="mt-6 p-4 border rounded bg-gray-50 text-gray-700">
                    <div><strong>Name:</strong> {tokenDetails.name}</div>
                    <div><strong>Symbol:</strong> {tokenDetails.symbol}</div>
                    <div><strong>Decimals:</strong> {tokenDetails.decimals}</div>
                    <div>
                        <strong>Total Amount (tokens):</strong>{" "}
                        {tokenDetails.decimals !== undefined
                            ? Math.floor(total / Math.pow(10, tokenDetails.decimals))
                            : "N/A"}
                        {tokenDetails.symbol && <> {tokenDetails.symbol}</>}
                    </div>
                    <div>
                        <strong>Total (wei): </strong>{" "}
                        <>{total}</>
                    </div>

                </div>
            )}
        </div>
    )
}