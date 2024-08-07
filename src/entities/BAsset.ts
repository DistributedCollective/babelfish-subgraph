import { log, Address, BigInt, store } from '@graphprotocol/graph-ts';
import { BAsset } from '../../generated/schema';
import { ERC20 as ERC20TokenContract } from '../../generated/BasketManagerV3/ERC20';
import { getGlobal } from './Global';
import { RewardManager } from '../../generated/RewardManager1/RewardManager';
import { rewardManagerAddress3 } from '../utils/bAssets';

export function createAndReturnBAsset(tokenAddress: Address, symbol: string): BAsset {
  let token = BAsset.load(tokenAddress.toHex());
  if (token === null) {
    token = new BAsset(tokenAddress.toHex());
    let tokenContract = ERC20TokenContract.bind(tokenAddress);
    let assetNameResult = tokenContract.try_name();
    if (!assetNameResult.reverted) {
      token.name = assetNameResult.value;
    }
    let tokenSymbolResult = tokenContract.try_symbol();
    if (!tokenSymbolResult.reverted) {
      token.symbol = tokenSymbolResult.value;
    } else {
      token.symbol = symbol
    }
    let assetDecimalResult = tokenContract.try_decimals();
    if (!assetDecimalResult.reverted) {
      token.decimals = assetDecimalResult.value;
    } else {
      token.decimals = 18
    }
    token.paused = false;
    let global = getGlobal();
    token.global = global.id;
    token.save();
  }
  return token as BAsset;
}

export function removeBAsset(address: Address): void {
  let bAsset = BAsset.load(address.toHexString());
  if (bAsset !== null) {
    store.remove('BAsset', bAsset.id);
  }
}

export function togglePauseBAsset(address: Address, isPaused: boolean): void {
  let bAsset = BAsset.load(address.toHexString());
  if (bAsset !== null) {
    bAsset.paused = isPaused;
    bAsset.save();
  }
}

export function toggleTargetWeightBAsset(address: Address): void {
  let bAsset = BAsset.load(address.toHexString());
  let rewardManagerContract = RewardManager.bind(Address.fromString(rewardManagerAddress3.address));
  let targetWeightResult = rewardManagerContract.try_getTargetWeight(address);
  if (!targetWeightResult.reverted && bAsset !== null) {
    bAsset.targetWeight = targetWeightResult.value;
    bAsset.save();
  }
}
