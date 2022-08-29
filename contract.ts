import {
  stark,
  defaultProvider,
  ec,
  json,
  Contract,
  Account,
  uint256,
} from "starknet";

import fs from "fs";
import { getWallet } from "./wallet";
import { ethers } from "ethers";

export { getErc20Contract, getBalance };

const ERC20Abi = json.parse(fs.readFileSync("./contracts/ERC20.json", "utf8"));

const getErc20Contract = async (address: string, account: Account) => {
  const contract = new Contract(ERC20Abi, address, account);

  return contract;
};

const getBalance = async (address: string, tokenAddress: string) => {
  const wallet = await getWallet();

  const tokenContract = await getErc20Contract(tokenAddress, wallet.account);

  const result = await tokenContract.balanceOf(address);

  const balance = ethers.utils.formatEther(
    uint256.uint256ToBN(result.balance).toString()
  );

  // log balance
  console.log(`Balance of ${address}: ${balance} tokens`);

  return balance;
};
