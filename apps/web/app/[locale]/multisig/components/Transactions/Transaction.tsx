"use client";

import { useState } from "react";
import RadioButton from "@/components/buttons/RadioButton";
import VoteExisting from "./VoteExisting";
import ProposeNewTransaction from "./ProposeNewTransaction";

export default function Transaction() {
    const [transactionType, setTransactionType] = useState("vote");

    return (
        <div className="bg-primary-bg rounded-3 p-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <h2 className="text-20 font-bold text-primary-text">Select type</h2>
                    <div className="flex gap-3">
                        <RadioButton
                            isActive={transactionType === "vote"}
                            onClick={() => setTransactionType("vote")}
                            className="flex-1"
                        >
                            Vote existing transaction
                        </RadioButton>
                        <RadioButton
                            isActive={transactionType === "propose"}
                            onClick={() => setTransactionType("propose")}
                            className="flex-1"
                        >
                            Propose new transaction
                        </RadioButton>
                    </div>
                </div>
                <div className="border-t border-secondary-border pt-6">
                    {transactionType === "vote" && <VoteExisting />}
                    {transactionType === "propose" && <ProposeNewTransaction />}
                </div>
            </div>
        </div>
    );
}