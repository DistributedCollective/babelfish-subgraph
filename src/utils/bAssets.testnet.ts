class BAsset {
  address: string;
  symbol: string;
  constructor(address: string, symbol: string) {
    this.address = address.toLowerCase();
    this.symbol = symbol;
  }
}

export const bassets: BAsset[] = [
  new BAsset('0xCb46C0DdC60d18eFEB0e586c17AF6Ea36452DaE0', 'DOC'),
  new BAsset('0x8C9abb6C9D8D15ddb7aDA2e50086E1050AB32688', 'bsBUSD'),
  new BAsset('0xC3De9f38581F83e281F260D0ddBAac0E102Ff9F8', 'rDOC'),
  new BAsset('0x407ff7d4760D3a81B4740d268eb04490C7dfe7f2', 'bsDAI'),
  new BAsset('0x10C5A7930fC417e728574E334b1488b7895c4B81', 'USDTes'),
  new BAsset('0xcc8Eec21ae75F1A2dE4aC7b32A7de888a45cF859', 'USDCes'),
  new BAsset('0x43bC3F0FFFF6c9BBf3C2EAFE464c314d43f561De', 'bsUSDT'),
  new BAsset('0x4D5a316D23eBE168d8f887b4447bf8DbFA4901CC', 'USDT'),
  new BAsset('0x3E2CF87e7fF4048A57f9cDdE9368c9F4BFB43ADF', 'bsUSDC'),
];