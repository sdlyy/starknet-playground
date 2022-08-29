import fs from "fs";
import {
  stark,
  defaultProvider,
  ec,
  Account,
  Signer,
  Provider,
} from "starknet";

export {
  getWallet,
  getKeyPair,
  getOrReadPrivateKey,
  getWalletAddress,
  getOrReadPublicKey,
};
export type { Wallet };

type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

interface Wallet {
  keyPair: UnpackPromise<ReturnType<typeof getKeyPair>>;
  account: Account;
  signer: Signer;
}

const getOrReadPrivateKey = async (): Promise<string> => {
  const privateKey = fs.existsSync("./private.key")
    ? fs.readFileSync("./private.key", "utf-8")
    : stark.randomAddress();

  return privateKey;
};

const getOrReadPublicKey = async (): Promise<string> => {
  const publicKey = fs.existsSync("./public.key")
    ? fs.readFileSync("./public.key", "utf-8")
    : ec.getStarkKey(await getKeyPair());

  console.log("Public Key: ", publicKey);

  return publicKey;
};

const getWalletAddress = async (): Promise<string> => {
  const walletContractAddress = fs.readFileSync("./account.address", "utf-8");

  return walletContractAddress;
};

const getKeyPair = async () => {
  const privateKey = await getOrReadPrivateKey();

  const keyPair = ec.getKeyPair(privateKey);

  return keyPair;
};

const getWallet = async (
  provider: Provider = defaultProvider
): Promise<Wallet> => {
  const keyPair = await getKeyPair();

  const walletAddress = await getWalletAddress();

  const mainnetProvider = new Provider({
    baseUrl: "https://alpha-mainnet.starknet.io",
    feederGatewayUrl: "feeder_gateway",
    gatewayUrl: "gateway",
  });

  const account = new Account(mainnetProvider, walletAddress, keyPair);

  const signer = new Signer(keyPair);

  return { keyPair, account, signer };
};
