import { BigNumber, utils } from 'ethers';

import { setupSystem } from '../setup';
import { xusdTransactionsQuery } from './queries';
import { FEE_PRECISION, standardFees } from '../utils/constants';
import { getSigners } from '../utils/evm';

describe('Transactions events', () => {
  let babelfish: Awaited<ReturnType<typeof setupSystem>>;

  beforeEach(async () => {
    babelfish = await setupSystem({ testName: 'masset' });
  });

  afterEach(async () => {
    await babelfish.stopSubgraph();
  });

  it('properly detect transactions quantity', async () => {
    const { masset, mockToken, syncSubgraph, subgraphName } = babelfish;
    const sum = utils.parseUnits('1024');

    await mockToken.approve(masset.address, sum);
    const firstTx = await (await masset.mint(mockToken.address, sum)).wait();

    await syncSubgraph({ targetBlockNumber: firstTx.blockNumber });

    await mockToken.approve(masset.address, sum);
    const secondTx = await (await masset.mint(mockToken.address, sum)).wait();

    await syncSubgraph({ targetBlockNumber: secondTx.blockNumber });

    const transactions = await xusdTransactionsQuery(subgraphName);
    expect(transactions).toHaveLength(2);
  });

  it('properly detect transaction type', async () => {
    const {
      masset,
      mockToken,
      basketManager,
      mockXusd,
      syncSubgraph,
      subgraphName,
    } = babelfish;

    const sum = BigNumber.from(123123).pow(BigNumber.from(2));
    const mintFee = sum.mul(standardFees.deposit).div(FEE_PRECISION);

    await mockToken.approve(masset.address, sum);
    const mintTx = await (await masset.mint(mockToken.address, sum)).wait();

    await syncSubgraph({ targetBlockNumber: mintTx.blockNumber });

    const calculated = await basketManager.convertBassetToMassetQuantity(
      mockToken.address,
      sum
    );

    let mintedMassets = calculated[0];

    mintedMassets = mintedMassets.sub(mintFee);

    await mockXusd.approve(masset.address, mintedMassets);

    const redeemTx = await (
      await masset.redeem(mockToken.address, mintedMassets)
    ).wait();

    await syncSubgraph({ targetBlockNumber: redeemTx.blockNumber });

    const transactions = await xusdTransactionsQuery(subgraphName);
    const firstTx = transactions[0];
    const secTx = transactions[1];

    expect(firstTx.event).toBe('Deposit');
    expect(secTx.event).toBe('Withdraw');
  });

  it('properly detect users addresses', async () => {
    const {
      provider,
      masset,
      mockToken,
      syncSubgraph,
      subgraphName,
    } = babelfish;
    const sum = utils.parseUnits('1024');

    const [deployer, user1, user2] = getSigners(provider);

    const user1Address = await user1.getAddress();
    const user2Address = await user2.getAddress();
    await mockToken.connect(deployer).transfer(user1Address, sum);
    await mockToken.connect(deployer).transfer(user2Address, sum);

    // ----- check user1 address

    await mockToken.connect(user1).approve(masset.address, sum);

    const user1Tx = await (
      await masset.connect(user1).mint(mockToken.address, sum)
    ).wait();

    await syncSubgraph({ targetBlockNumber: user1Tx.blockNumber });

    let transactions = await xusdTransactionsQuery(subgraphName);
    let addressOnTx = transactions[0].user;

    expect(user1Address.toLowerCase()).toEqual(addressOnTx.toLowerCase());

    // ----- check user2 address

    await mockToken.connect(user2).approve(masset.address, sum);

    const user2Tx = await (
      await masset.connect(user2).mint(mockToken.address, sum)
    ).wait();

    await syncSubgraph({ targetBlockNumber: user2Tx.blockNumber });

    transactions = await xusdTransactionsQuery(subgraphName);
    addressOnTx = transactions[1].user;

    expect(user2Address.toLowerCase()).toEqual(addressOnTx.toLowerCase());
  });
});
