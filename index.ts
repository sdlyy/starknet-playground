import { defaultProvider, number, uint256 } from "starknet";

import fs from "fs";
import { getBalance, getErc20Contract } from "./contract";
import { getWallet } from "./wallet";
import { constants } from "./constants";
import { ethers, providers } from "ethers";
import { CONSTANT_POINTS } from "starknet/dist/constants";
import BigNumber from "bignumber.js";

const getUint256CalldataFromBN = (bn: number.BigNumberish) => ({
  type: "struct" as const,
  ...uint256.bnToUint256(bn),
});

const parseInputAmountToUint256 = (input: string) =>
  getUint256CalldataFromBN(input);

const run = async () => {
  try {
    const { keyPair, account, signer } = await getWallet();

    const hash =
      "0x00000000000000000000000000000000000000000000000000000000000000";

    const result = await account.getTransactionStatus(hash);
    const receipt = await account.getTransactionReceipt(hash);

    console.log(result);
    console.log(receipt);
  } catch (e) {
    console.dir(e, { depth: null, colors: true });
  }
};

async function getTxStatus(txHash: string): Promise<any> {
  const txStatus = await defaultProvider.getTransactionStatus(txHash);

  console.dir(txStatus, { depth: null });

  switch (txStatus.tx_status) {
    case "ACCEPTED_ON_L1":
    case "ACCEPTED_ON_L2":
    case "PENDING":
      return {
        txHash,
        chain: "STARKNET",
        status: OperationStatus.SUCCESS,
      };

    case "REJECTED":
      return {
        txHash,
        chain: "STARKNET",
        status: OperationStatus.ERROR,
      };

    case "NOT_RECEIVED":
    case "RECEIVED":
    default:
      return {
        txHash,
        chain: "STARKNET",
        status: OperationStatus.PENDING,
      };
  }
}

export enum OperationStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export const runNTimes = async (n: number) => {
  for (let i = 0; i < n; i++) {
    await run();
  }
};

runNTimes(1);
