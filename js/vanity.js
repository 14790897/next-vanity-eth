import secp256k1 from "secp256k1";
import keccak from "keccak";
import randomBytes from "randombytes";

export const checkBalance = async (address) => {
  const apiKey = "i60V-1aZ8TaC0yeV_ss4EHRNVdd1nHVD";
  const url = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const balance = parseInt(data.result, 16) / 1e18; // 转换为以太单位
    postMessage({
      type: "balance",
      message: `Balance of address ${address} is: ${balance} ETH`,
      balance,
    });
    return balance;
  } catch (error) {
    postMessage({
      type: "error",
      message: `Error checking balance: ${error.message}`,
    });
    return 0;
  }
};

const step = 50;

export const privateToAddress = (privateKey) => {
  const pub = secp256k1.publicKeyCreate(privateKey, false).slice(1);
  return keccak("keccak256")
    .update(Buffer.from(pub))
    .digest()
    .slice(-20)
    .toString("hex");
};

export const getRandomWallet = () => {
  const randbytes = randomBytes(32);
  return {
    address: privateToAddress(randbytes).toString("hex"),
    privKey: randbytes.toString("hex"),
  };
};

export const isValidVanityAddress = (address, prefix, suffix, isChecksum) => {
  const addressPrefix = address.substring(0, prefix.length);
  const addressSuffix = address.substring(40 - suffix.length);

  if (!isChecksum) {
    return prefix === addressPrefix && suffix === addressSuffix;
  }
  if (
    prefix.toLowerCase() !== addressPrefix ||
    suffix.toLowerCase() !== addressSuffix
  ) {
    return false;
  }

  return isValidChecksum(address, prefix, suffix);
};

const isValidChecksum = (address, prefix, suffix) => {
  const hash = keccak("keccak256").update(address).digest().toString("hex");

  for (let i = 0; i < prefix.length; i++) {
    if (
      prefix[i] !==
      (parseInt(hash[i], 16) >= 8 ? address[i].toUpperCase() : address[i])
    ) {
      return false;
    }
  }

  for (let i = 0; i < suffix.length; i++) {
    const j = i + 40 - suffix.length;
    if (
      suffix[i] !==
      (parseInt(hash[j], 16) >= 8 ? address[j].toUpperCase() : address[j])
    ) {
      return false;
    }
  }

  return true;
};

const toChecksumAddress = (address) => {
  const hash = keccak("keccak256").update(address).digest().toString("hex");
  let ret = "";
  for (let i = 0; i < address.length; i++) {
    ret += parseInt(hash[i], 16) >= 8 ? address[i].toUpperCase() : address[i];
  }
  return ret;
};

export const getVanityWallet = async (
  prefix,
  suffix,
  isChecksum,
  ischeckBalance,
) => {
  let wallet = getRandomWallet();
  let attempts = 1;

  const pre = isChecksum ? prefix : prefix.toLowerCase();
  const suf = isChecksum ? suffix : suffix.toLowerCase();

  while (!isValidVanityAddress(wallet.address, pre, suf, isChecksum)) {
    if (attempts >= step) {
      postMessage({ attempts });
      attempts = 0;
    }
    wallet = getRandomWallet();
    const checksumAddress = "0x" + toChecksumAddress(wallet.address);
    const privateKey = wallet.privKey;
    if (ischeckBalance) {
      const balance = await checkBalance(checksumAddress);
      if (balance > 0) {
        postMessage({
          type: "balanceFound",
          message: `Found an address with balance!`,
          address: checksumAddress,
          privKey: privateKey,
          balance,
        });
        return;
      }
    }
    attempts++;
  }

  postMessage({
    type: "addressFound",
    address: "0x" + toChecksumAddress(wallet.address),
    privKey: wallet.privKey,
    attempts,
  });
  return;
};

onmessage = function (event) {
  const input = event.data;
  try {
    getVanityWallet(
      input.prefix,
      input.suffix,
      input.checksum,
      input.checkBalance,
    );
  } catch (err) {
    self.postMessage({ type: "error", message: err.toString() });
  }
};
