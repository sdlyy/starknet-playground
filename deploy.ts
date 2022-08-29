import { stark, defaultProvider, ec, json, Contract } from "starknet";
import fs from "fs";

const deploy = async () => {
  const privateKey = fs.existsSync("./private.key")
    ? fs.readFileSync("./private.key", "utf-8")
    : stark.randomAddress();

  const keyPair = ec.getKeyPair(privateKey);

  const publicKey = fs.existsSync("./public.key")
    ? fs.readFileSync("./public.key", "utf-8")
    : ec.getStarkKey(keyPair);

  console.log(publicKey);

  fs.writeFileSync("./private.key", privateKey);
  fs.writeFileSync("./public.key", publicKey);

  const compiledWallet = json.parse(
    fs.readFileSync("./contracts/ArgentAccount.json").toString("ascii")
  );

  const accountResponse = await defaultProvider.deployContract({
    contract: compiledWallet,
    addressSalt: publicKey,
  });

  console.log(
    "Waiting for Tx to be Accepted on Starknet - Argent Account Deployment..."
  );

  await defaultProvider.waitForTransaction(accountResponse.transaction_hash);

  const accountContract = new Contract(
    compiledWallet.abi,
    accountResponse.address!
  );

  // write account address to file
  fs.writeFileSync("./account.address", accountResponse.address!);

  // Initialize argent account
  console.log("Invoke Tx - Initialize Argent Account...");
  const initializeResponse = await accountContract.initialize(publicKey, "0");

  console.log(
    "Waiting for Tx to be Accepted on Starknet - Initialize Account..."
  );
  await defaultProvider.waitForTransaction(initializeResponse.transaction_hash);

  // print deploy summary
  console.log("\n\n");
  console.log("Argent Account Deployment Summary");
  console.log("---------------------------------");
  console.log("Public key:", publicKey);
  console.log("Private key:", privateKey);
  console.log("Account address:", accountResponse.address);
  console.log("Transaction Hash:", accountResponse.transaction_hash);
  console.log("\n\n");
};

deploy()
  .then(() => {
    console.log("Done!");
  })
  .catch((e) => {
    console.log("Failed!");
    console.log(e);
  });
