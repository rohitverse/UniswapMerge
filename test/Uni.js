const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Uniswap Contract', async () => {
  let tokenA;
  let tokenB;
  let weth;
  let UniswapV2Pair;
  let uniswapV2Pair;
  let uniswapV2Factory;
  let uniswapV2Router02;
  let taxableToken;
  let amountETHMin=ethers.parseEther("1");
  let amountAMin=ethers.parseEther("1");
  let amountBMin=ethers.parseEther("1");
  let amountOut = ethers.parseEther("1");
  let amountIn = ethers.parseEther("10");
  let amountInMax = ethers.parseEther("100")
  const ETH_AMOUNT = ethers.parseEther('100');
  let TOKEN_A_AMOUNT = ethers.parseEther('100');
  let TOKEN_B_AMOUNT = ethers.parseEther('100');
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  async function _addLiquidity(){
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target, TOKEN_A_AMOUNT);
    await tokenB.connect(signer[0]).approve(uniswapV2Router02.target, TOKEN_B_AMOUNT);
    console.log(`TOKEN_A_AMOUNT : ${TOKEN_A_AMOUNT} \n    TOKEN_B_AMOUNT : ${TOKEN_B_AMOUNT}`);
     // function addLiquidity(address tokenA,address tokenB, uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline)
    await uniswapV2Router02.connect(signer[0]).addLiquidity(tokenA.target,tokenB.target,TOKEN_A_AMOUNT,TOKEN_B_AMOUNT,amountAMin,amountBMin,signer[0].address,deadline);
  }
  async function _addLiquidityETH(){
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target, TOKEN_A_AMOUNT);
    console.log(`TOKEN_A_AMOUNT : ${TOKEN_A_AMOUNT} \n    ETH_AMOUNT : ${ETH_AMOUNT}`);
    // function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline)
    await uniswapV2Router02.connect(signer[0]).addLiquidityETH(tokenA.target,TOKEN_A_AMOUNT,amountETHMin,ETH_AMOUNT,signer[0].address,deadline,{ value: ETH_AMOUNT });
  }
  async function _addTaxableLiquidity(){
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target, TOKEN_A_AMOUNT);
    await taxableToken.connect(signer[0]).approve(uniswapV2Router02.target, TOKEN_B_AMOUNT);
    console.log(`TOKEN_A_AMOUNT : ${TOKEN_A_AMOUNT} \n    TaxableAmount : ${TOKEN_B_AMOUNT}`);
     // function addLiquidity(address tokenA,address tokenB, uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline)
    await uniswapV2Router02.connect(signer[0]).addLiquidity(tokenA.target,taxableToken.target,TOKEN_A_AMOUNT,TOKEN_B_AMOUNT,amountAMin,amountBMin,signer[0].address,deadline);
  }
  async function _addTaxableLiquidityETH(){
    await taxableToken.connect(signer[0]).approve(uniswapV2Router02.target,TOKEN_B_AMOUNT);
     // function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline)
    await uniswapV2Router02.connect(signer[0]).addLiquidityETH(taxableToken.target,TOKEN_B_AMOUNT,1,ETH_AMOUNT,signer[0].address,1764541741,{value:ETH_AMOUNT});
};
  beforeEach(async () => {
    signer = await ethers.getSigners();

    const TokenA = await ethers.getContractFactory('TokenA');
    tokenA = await TokenA.connect(signer[0]).deploy();

    const TokenB = await ethers.getContractFactory('TokenB');
    tokenB = await TokenB.connect(signer[0]).deploy();

    const Weth = await ethers.getContractFactory('WETH9');
    weth = await Weth.connect(signer[0]).deploy();

    const UniswapV2Factory = await ethers.getContractFactory('UniswapV2Factory');
    uniswapV2Factory = await UniswapV2Factory.connect(signer[0]).deploy(signer[0].address);

    const UniswapV2Router02 = await ethers.getContractFactory('UniswapV2Router02');
    uniswapV2Router02 = await UniswapV2Router02.connect(signer[0]).deploy(uniswapV2Factory.target,weth.target);

    UniswapV2Pair = await ethers.getContractFactory('UniswapV2Pair');
    uniswapV2Pair = await UniswapV2Pair.connect(signer[0]).deploy();

    const TaxableToken = await ethers.getContractFactory("taxableToken");
    taxableToken = await TaxableToken.connect(signer[0]).deploy();

    const GetInit = await ethers.getContractFactory('CalHash');
    getInit = await GetInit.deploy();
    initHash = await getInit.connect(signer[0]).getInitHash();
  });
  it('  *** Check The ethers Version & Contract address *** \n  ', async () => {
    const version = ethers.version;
    console.log(`Ethers Version : v${version}
    Token A Contract Address : ${await tokenA.target}
    Token B Contract Address : ${await tokenB.target}
    UniswapV2Factory Contract Address : ${await uniswapV2Factory.target}
    UniswapV2Router02 Contract Address : ${await uniswapV2Router02.target}
    WETH9 Contract Address : ${await weth.target}`);
  });
  it('  *** Token A : Check Name , Symbol and Totalsupply *** \n  ', async () => {
    console.log(`Name of the Token A : ${await tokenA.name()}`);
    expect(await tokenA.name()).to.be.equal('TokenA');
    console.log(`Symbol of the Token A : ${await tokenA.symbol()}`);
    expect(await tokenA.symbol()).to.be.equal('TA');
    console.log(`TotalSupply of the Token A : ${await tokenA.totalSupply()}`);
    expect(await tokenA.totalSupply()).to.be.equal(ethers.parseEther('10000000'));
    console.log(`Signer Balance of TokenA  : ${await tokenA.balanceOf(signer[0].address)}`);
  });
  it('  *** Token B : Check Name , Symbol and Totalsupply  *** \n ', async () => {
    console.log(`Name of the Token B : ${await tokenB.name()}`);
    expect(await tokenB.name()).to.be.equal('TokenB');
    console.log(`Symbol of the Token B : ${await tokenB.symbol()}`);
    expect(await tokenB.symbol()).to.be.equal('TB');
    console.log(`TotalSupply of the Token B : ${await tokenB.totalSupply()}`);
    expect(await tokenB.totalSupply()).to.be.equal(ethers.parseEther('10000000'));
    console.log(`Signer Balance of TokenB  : ${await tokenB.balanceOf(signer[0].address)}`);
  });
  it('  *** Check AddLiquidity ***  ', async () => {
    console.log(`Init Hash : ${initHash}`);
    await _addLiquidity();
    // function addLiquidity(address tokenA,address tokenB, uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline)
    console.log(`Contract Address of Uniswap Pair: ${uniswapV2Pair.target}`);
    let pair = await uniswapV2Factory.getPair(tokenA.target, tokenB.target);
    console.log(`Pair Address : ${pair}`);
    let uniswapV2PairAt = await uniswapV2Pair.connect(signer[0]).attach(pair);
    console.log(`Balance Of Attached Uniswap Pair : ${await uniswapV2PairAt.balanceOf(signer[0].address)}`);
    console.log(`reserve ${await uniswapV2PairAt.getReserves()}`);
  });
  it('  *** Check AddLiquidityETH ***  ', async () => {
    // console.log(`Init Hash : ${initHash}`);
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target, TOKEN_A_AMOUNT);
    // function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline
    await uniswapV2Router02.connect(signer[0]).addLiquidityETH(tokenA.target,TOKEN_A_AMOUNT,1,amountETHMin,signer[0].address,deadline,{ value: ETH_AMOUNT });

    console.log(`Contract Address of Uniswap Pair Contract: ${uniswapV2Pair.target}`);
    pair = await uniswapV2Factory.getPair(tokenA.target, weth.target);
    console.log(`Pair Address Of Token/Weth via Factory: ${pair}`);
    let uniswapV2PairAt = await uniswapV2Pair.connect(signer[0]).attach(pair);
    let liquidity = await uniswapV2PairAt.balanceOf(signer[0].address);
    console.log(`Liquidity After addLiquidityETH Function : ${liquidity}`);
    console.log(`Reserve After addLiquidityETH: ${await uniswapV2PairAt.getReserves()}`);
  });
  it('  *** Check RemoveLiquidity ***  ', async () => {
    // console.log(`Init Hash : ${initHash}`);
    await _addLiquidity();

    console.log(`Contract Address of Uniswap Pair Contract: ${uniswapV2Pair.target}`);
    pair = await uniswapV2Factory.getPair(tokenA.target, tokenB.target);
    console.log(`Pair Address Of TokenA/TokenB via Factory: ${pair}`);
    let uniswapV2PairAt = await uniswapV2Pair.connect(signer[0]).attach(pair);
    console.log(`Liquidity After Add Liquidity Function : ${await uniswapV2PairAt.balanceOf(signer[0].address)}`);
    let liquidity = await uniswapV2PairAt.balanceOf(signer[0].address);
    console.log(`Reserve After Add Liquidity: ${await uniswapV2PairAt.getReserves()}`);
    await uniswapV2PairAt.connect(signer[0]).approve(uniswapV2Router02.target, liquidity);
    await uniswapV2Router02.connect(signer[0]).removeLiquidity(tokenA.target,tokenB.target,liquidity,amountAMin,amountBMin,signer[0].address,deadline);
    console.log(`Liquidity After Remove Liquidity Function : ${await uniswapV2PairAt.balanceOf(signer[0].address)}`);
    console.log(`Reserve After Remove Liquidity: ${await uniswapV2PairAt.getReserves()}`);
  });
  it('  *** Check removeLiquidityETH ***  ', async () => {
    // console.log(`Init Hash : ${initHash}`);
    await _addLiquidityETH();

    console.log(`Contract Address of Uniswap Pair Contract: ${uniswapV2Pair.target}`);
    pair = await uniswapV2Factory.getPair(tokenA.target, weth.target);
    console.log(`Pair Address Of Token/Weth via Factory: ${pair}`);
    let uniswapV2PairAt = await uniswapV2Pair.connect(signer[0]).attach(pair);
    let liquidity = await uniswapV2PairAt.balanceOf(signer[0].address);
    console.log(`Liquidity After addLiquidityETH Function : ${liquidity}`);
    console.log(`Reserve After addLiquidityETH: ${await uniswapV2PairAt.getReserves()}`);

    await uniswapV2PairAt.connect(signer[0]).approve(uniswapV2Router02.target, liquidity);
    await uniswapV2Router02.connect(signer[0]).removeLiquidityETH(tokenA.target,liquidity,amountAMin,amountETHMin,signer[1].address,deadline);
    console.log(`Liquidity After removeLiquidityETH Function : ${await uniswapV2PairAt.balanceOf(signer[1].address)}`);
    console.log(`Reserve After removeLiquidityETH: ${await uniswapV2PairAt.getReserves()}`);
  });
  it("  *** swapExactTokensForTokens function  *** ", async ()=> {                
    await _addLiquidity();

    console.log(`Contract Address of Uniswap Pair Contract: ${uniswapV2Pair.target}`);
    pair = await uniswapV2Factory.getPair(tokenA.target, tokenB.target);
    console.log(`Pair Address Of TokenA/TokenB via Factory: ${pair}`);
    let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    // let liquidity = await uniswapV2PairAt.balanceOf(signer[0].address);
    let liquidity =await uniswapV2PairAt.balanceOf(signer[0].address);
    console.log(`Liquidity After addLiquidity Function : ${liquidity}`);
    console.log(`Reserve After addLiquidity: ${(await uniswapV2PairAt.getReserves())}`);
    await uniswapV2PairAt.connect(signer[0]).approve(uniswapV2Router02.target, liquidity);
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target,TOKEN_A_AMOUNT);
    let iniBalT1 = await tokenA.balanceOf(signer[0].address);
    let iniBalT2 = await tokenB.balanceOf(signer[0].address);
    // const amountIn = ethers.parseEther("100");
    await uniswapV2Router02.connect(signer[0]).swapExactTokensForTokens(amountIn,1,[tokenA.target,tokenB.target],signer[0].address, deadline);

    console.log(`Liquidity After swap Function : ${liquidity}`);
    console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);

    let fnlBalT1 = await tokenA.balanceOf(signer[0].address);
    let fnlBalT2 = await tokenB.balanceOf(signer[0].address);
    // let fnlBalT3 = await tokenA.balanceOf(signer[4].address);
    expect(iniBalT1).to.be.greaterThan(fnlBalT1);
    expect(fnlBalT2).to.be.greaterThan(iniBalT2);
    // expect(fnlBalT3).to.equal(0.3);
    console.log(`
    Initial Balance of Token A : ${iniBalT1}
    Initial Balance of Token B : ${iniBalT2}
    Final Balance of Token A   : ${fnlBalT1}
    Final Balance of Token B   : ${fnlBalT2}
    `);
    // await _addLiquidity();
    // console.log(`Contract Address of Uniswap Pair Contract: ${uniswapV2Pair.target}`);
    // pair = await uniswapV2Factory.getPair(tokenA.target, tokenB.target);
    // console.log(`Pair Address Of TokenA/TokenB via Factory: ${pair}`);
    // uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    // // let liquidity = await uniswapV2PairAt.balanceOf(signer[0].address);
    //  liquidity =await uniswapV2PairAt.balanceOf(signer[0].address);
    // console.log(`Liquidity After addLiquidity Function : ${liquidity}`);
    // console.log(`Reserve After addLiquidity: ${(await uniswapV2PairAt.getReserves())}`);
    // iniBalT1 = await tokenA.balanceOf(signer[0].address);
    // iniBalT2 = await tokenB.balanceOf(signer[0].address);
    // console.log(`
    // Initial Balance of Token A : ${iniBalT1}
    // Initial Balance of Token B : ${iniBalT2}
    // `);
  });
  it("  *** swapTokensForExactTokens  *** ", async ()=>{
    await _addLiquidity();

    // console.log(`Contract Address of Uniswap Pair Contract: ${uniswapV2Pair.target}`);
    // pair = await uniswapV2Factory.getPair(tokenA.target, tokenB.target);
    // console.log(`Pair Address Of TokenA/TokenB via Factory: ${pair}`);
    // let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    // // let liquidity = await uniswapV2PairAt.balanceOf(signer[0].address);
    // let liquidity =await uniswapV2PairAt.balanceOf(signer[0].address);
    // console.log(`Liquidity After addLiquidity Function : ${liquidity}`);
    // console.log(`Reserve After addLiquidity: ${(await uniswapV2PairAt.getReserves())}`);
    // await uniswapV2PairAt.connect(signer[0]).approve(uniswapV2Router02.target, liquidity);
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target,TOKEN_A_AMOUNT);
    let iniBalT1 = await tokenA.balanceOf(signer[0].address);
    let iniBalT2 = await tokenB.balanceOf(signer[0].address);
     amountOut=ethers.parseEther("10");
    await uniswapV2Router02.connect(signer[0]).swapTokensForExactTokens(amountOut,TOKEN_A_AMOUNT,[tokenA.target,tokenB.target],signer[0].address, deadline);

    // console.log(`Liquidity After swap Function : ${liquidity}`);
    // console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);

    let fnlBalT1 = await tokenA.balanceOf(signer[0].address);
    let fnlBalT2 = await tokenB.balanceOf(signer[0].address);
    console.log(`
    Initial Balance of Token A : ${iniBalT1}
    Initial Balance of Token B : ${iniBalT2}
    Final Balance of Token A  : ${fnlBalT1}
    Final Balance of Token B  : ${fnlBalT2}
    `);
  })
  it("  *** swapExactETHForTokens  *** ",async ()=>{
    await _addLiquidityETH();

    pair = await uniswapV2Factory.getPair(tokenA.target, weth.target);
    console.log(`Pair Address Of TokenA/weth via Factory: ${pair}`);
    let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    let iniBalT1 = ((await tokenA.balanceOf(signer[0].address)));
    console.log(`Reserve Before swap: ${(await uniswapV2PairAt.getReserves())}`);
    await uniswapV2Router02.connect(signer[0]).swapExactETHForTokens(1,[weth.target,tokenA.target],signer[0].address, deadline,{value:ETH_AMOUNT});

    let fnlBalT1 = ((await tokenA.balanceOf(signer[0].address)));
    console.log(`
    Initial Balance of Token A : ${iniBalT1}
    Final Balance of Token A  : ${fnlBalT1}
    `);
    console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);
  })
  // it("swapTokensForExactETH",async ()=>{
  //   await _addLiquidityETH();

  //   pair = await uniswapV2Factory.getPair(tokenA.target, weth.target);
  //   console.log(`Pair Address Of TokenA/weth via Factory: ${pair}`);
  //   let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
  //   let iniBalT1 = ((await tokenA.balanceOf(signer[0].address)));
  //   console.log(`Reserve Before swap: ${(await uniswapV2PairAt.getReserves())}`);
  //   amountOut=ethers.parseEther("10");
  //   await tokenA.connect(signer[0]).approve(uniswapV2Router02.target,amountInMax);
  //   await uniswapV2Router02.connect(signer[0]).swapTokensForExactETH(
  //     amountOut, amountInMax, [tokenA.target,weth.target], signer[0].address, deadline
  //   )
  //   let fnlBalT1 = ((await tokenA.balanceOf(signer[0].address)));
  //   console.log(`
  //   Initial Balance of Token A : ${iniBalT1}
  //   Final Balance of Token A  : ${fnlBalT1}
  //   `);
  //   console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);
  // })
  it("  *** swapTokensForExactETH function  *** ", async ()=>{
    await _addLiquidityETH();

    pair = await uniswapV2Factory.getPair(tokenA.target, weth.target);
    console.log(`Pair Address Of TokenA/weth via Factory: ${pair}`);
    let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    console.log(`Reserve Before swap: ${(await uniswapV2PairAt.getReserves())}`);
    let iniBalToken =await tokenA.balanceOf(signer[0].address);
    // amountOut=ethers.parseEther("10");
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target,amountInMax);
    await uniswapV2Router02.connect(signer[0]).swapTokensForExactETH(amountOut,amountInMax,[tokenA.target,weth.target],signer[0].address,deadline);

    let fnlBalToken =await tokenA.balanceOf(signer[0].address);
    console.log(`
      Initial Balance of Token A : ${iniBalToken}
      Final Balance of Token A  : ${fnlBalToken}
    `);
    console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);
  });
  it("  *** swapExactTokensForETH function  *** ", async function () {
    await _addLiquidityETH();
    
    pair = await uniswapV2Factory.getPair(tokenA.target, weth.target);
    console.log(`Pair Address Of TokenA/weth via Factory: ${pair}`);
    let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    console.log(`Reserve Before swap: ${(await uniswapV2PairAt.getReserves())}`);
    let iniBalToken = ((await tokenA.balanceOf(signer[0].address)));
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target,amountInMax);
    // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
    await uniswapV2Router02.connect(signer[0]).swapExactTokensForETH(amountInMax,amountOut,[tokenA.target,weth.target],signer[0].address,deadline);

    let fnlBalToken = ((await tokenA.balanceOf(signer[0].address)));
    console.log(`
      Initial Balance of Token A : ${iniBalToken}
      Final Balance of Token A  : ${fnlBalToken}
    `);
    console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);
  });
  it("  *** swapETHForExactTokens function  *** ", async ()=>{
    await _addLiquidityETH();
    
    pair = await uniswapV2Factory.getPair(tokenA.target, weth.target);
    console.log(`Pair Address Of TokenA/weth via Factory: ${pair}`);
    let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    console.log(`Reserve Before swap: ${(await uniswapV2PairAt.getReserves())}`);
    let iniBalToken = await tokenA.balanceOf(signer[0].address);
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target,TOKEN_A_AMOUNT);
    // (uint amountOut, address[] calldata path, address to, uint deadline)
    amountOut=ethers.parseEther("1");
    await uniswapV2Router02.connect(signer[0]).swapETHForExactTokens(amountOut,[weth.target,tokenA.target],signer[0].address,deadline,{value:amountIn});

    let fnlBalToken = await tokenA.balanceOf(signer[0].address);
    console.log(`
      Initial Balance of Token A : ${iniBalToken}
      Final Balance of Token A  : ${fnlBalToken}
    `);
    console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);
  });
  it("  *** swapExactTokensForTokensSupportingFeeOnTransferTokens function  *** ", async ()=> {

    await _addTaxableLiquidity();
    pair = await uniswapV2Factory.getPair(tokenA.target, taxableToken.target);
    // console.log(`Pair Address Of TokenA/weth via Factory: ${pair}`);
    let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    console.log(`Reserve Before swap: ${(await uniswapV2PairAt.getReserves())}`);
    let iniBalT1 = await tokenA.balanceOf(signer[0].address);
    let iniBalT2 = await taxableToken.balanceOf(signer[0].address);
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target,TOKEN_A_AMOUNT);
    // (uint amountOut, address[] calldata path, address to, uint deadline)
    amountOutMin=ethers.parseEther("1");
    await uniswapV2Router02.connect(signer[0]).swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn,amountOutMin,[tokenA.target,taxableToken.target],signer[0].address, deadline);
    // function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline
  // ) 
  let fnlBalT1 = await tokenA.balanceOf(signer[0].address);
  let fnlBalT2 = await taxableToken.balanceOf(signer[0].address);
  console.log(`
    Initial Balance of Token A : ${iniBalT1}
    Initial Balance of TaxableToken : ${iniBalT2}
    Final Balance of Token A  : ${fnlBalT1}
    Final Balance of TaxableToken  : ${fnlBalT2}
  `);
    console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);
  });
  it("  *** swapExactETHForTokensSupportingFeeOnTransferTokens  *** ",async ()=>{
    await _addTaxableLiquidityETH();

    pair = await uniswapV2Factory.getPair(taxableToken.target, weth.target);
    console.log(`Pair Address Of TokenA/weth via Factory: ${pair}`);
    let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    let iniBalT1 = ((await taxableToken.balanceOf(signer[0].address)));
    console.log(`Reserve Before swap: ${(await uniswapV2PairAt.getReserves())}`);
    await uniswapV2Router02.connect(signer[0]).swapExactETHForTokensSupportingFeeOnTransferTokens(1,[weth.target,taxableToken.target],signer[0].address, deadline,{value:amountIn});

    let fnlBalT1 = ((await taxableToken.balanceOf(signer[0].address)));
    console.log(`
    Initial Balance of Token A : ${iniBalT1}
    Final Balance of Token A  : ${fnlBalT1}
    `);
    console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);
  })
  it("  *** swapExactTokensForETHSupportingFeeOnTransferTokens function  *** ", async ()=> {
    await _addTaxableLiquidityETH();
    
    pair = await uniswapV2Factory.getPair(taxableToken.target, weth.target);
    console.log(`Pair Address Of TokenA/weth via Factory: ${pair}`);
    let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    console.log(`Reserve Before swap: ${(await uniswapV2PairAt.getReserves())}`);
    let iniBalToken = ((await taxableToken.balanceOf(signer[0].address)));
    await taxableToken.connect(signer[0]).approve(uniswapV2Router02.target,amountInMax);
    // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
    await uniswapV2Router02.connect(signer[0]).swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn,amountOut,[taxableToken.target,weth.target],signer[0].address,deadline);

    let fnlBalToken = ((await taxableToken.balanceOf(signer[0].address)));
    console.log(`
      Initial Balance of Token A : ${iniBalToken}
      Final Balance of Token A  : ${fnlBalToken}

    `);
    console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);

  });
  it('  *** Check removeLiquidityETHSupportingFeeOnTransferTokens ***  ', async () => {
    // console.log(`Init Hash : ${initHash}`);
    await _addTaxableLiquidityETH();
    // function removeLiquidityETHSupportingFeeOnTransferTokens(address token,uint liquidity,uint amountTokenMin,uint amountETHMin,address to,uint deadline
    console.log(`Contract Address of Uniswap Pair Contract: ${uniswapV2Pair.target}`);
    pair = await uniswapV2Factory.getPair(taxableToken.target, weth.target);
    console.log(`Pair Address Of Token/Weth via Factory: ${pair}`);
    let uniswapV2PairAt = await uniswapV2Pair.connect(signer[0]).attach(pair);
    let liquidity = await uniswapV2PairAt.balanceOf(signer[0].address);
    console.log(`Liquidity After addLiquidityETH Function : ${liquidity}`);
    console.log(`Reserve After addLiquidityETH: ${await uniswapV2PairAt.getReserves()}`);

    await uniswapV2PairAt.connect(signer[0]).approve(uniswapV2Router02.target, liquidity);
    await uniswapV2Router02.connect(signer[0]).removeLiquidityETHSupportingFeeOnTransferTokens(taxableToken.target,liquidity,amountAMin,amountETHMin,signer[1].address,deadline);
    console.log(`Liquidity After removeLiquidityETH Function : ${await uniswapV2PairAt.balanceOf(signer[1].address)}`);
    console.log(`Reserve After removeLiquidityETH: ${await uniswapV2PairAt.getReserves()}`);
  });
  // removeLiquidityWithPermit()
  // removeLiquidityETHWithPermit()
  // removeLiquidityETHWithPermitSupportingFeeOnTransferTokens
  it("  *** Not Working/ reverse token/taxable  swapExactTokensForTokens function  *** ", async ()=> {                
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target, TOKEN_A_AMOUNT);
    await taxableToken.connect(signer[0]).approve(uniswapV2Router02.target, TOKEN_B_AMOUNT);
    console.log(`TOKEN_A_AMOUNT : ${TOKEN_A_AMOUNT} \n    TOKEN_TAXABLE_AMOUNT : ${TOKEN_B_AMOUNT}`);
     // function addLiquidity(address tokenA,address tokenB, uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline)
    await uniswapV2Router02.connect(signer[0]).addLiquidity(taxableToken.target,tokenA.target,TOKEN_B_AMOUNT,TOKEN_A_AMOUNT,amountAMin,amountBMin,signer[0].address,deadline);


    console.log(`Contract Address of Uniswap Pair Contract: ${uniswapV2Pair.target}`);
    pair = await uniswapV2Factory.getPair( tokenA.target,taxableToken.target);
    console.log(`Pair Address Of TokenA/TaxableToken via Factory: ${pair}`);

    let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    console.log(`Reserve After addLiquidity: ${(await uniswapV2PairAt.getReserves())}`);

    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target,TOKEN_A_AMOUNT);
    let iniBalT1 = await taxableToken.balanceOf(signer[0].address);
    let iniBalT2 = await tokenA.balanceOf(signer[0].address);
    // const amountIn = ethers.parseEther("100");
    await uniswapV2Router02.connect(signer[0]).swapExactTokensForTokens(amountIn,1,[tokenA.target,taxableToken.target],signer[0].address, deadline);

    console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);

    let fnlBalT1 = await taxableToken.balanceOf(signer[0].address);
    let fnlBalT2 = await tokenA.balanceOf(signer[0].address);
    console.log(`
    Initial Balance of Token Taxable : ${iniBalT1}
    Initial Balance of Token A : ${iniBalT2}
    Final Balance of Token Taxable   : ${fnlBalT1}
    Final Balance of Token A   : ${fnlBalT2}
    `);
  });  
  it("  ***Uniswap:K-- Taxable : swapExactTokensForTokens function  *** ", async ()=> {                
    await tokenA.connect(signer[0]).approve(uniswapV2Router02.target, TOKEN_A_AMOUNT);
    await taxableToken.connect(signer[0]).approve(uniswapV2Router02.target, TOKEN_B_AMOUNT);
    console.log(`TOKEN_A_AMOUNT : ${TOKEN_A_AMOUNT} \n    TOKEN_TAXABLE_AMOUNT : ${TOKEN_B_AMOUNT}`);
     // function addLiquidity(address tokenA,address tokenB, uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline)
    await uniswapV2Router02.connect(signer[0]).addLiquidity(taxableToken.target,tokenA.target,TOKEN_B_AMOUNT,TOKEN_A_AMOUNT,amountAMin,amountBMin,signer[0].address,deadline);
    console.log(`Contract Address of Uniswap Pair Contract: ${uniswapV2Pair.target}`);
    pair = await uniswapV2Factory.getPair(taxableToken.target, tokenA.target);
    console.log(`Pair Address Of TokenA/TokenB via Factory: ${pair}`);
    let uniswapV2PairAt =await uniswapV2Pair.connect(signer[0]).attach(pair);
    console.log(`Reserve After addLiquidity: ${(await uniswapV2PairAt.getReserves())}`);
    await taxableToken.connect(signer[0]).approve(uniswapV2Router02.target,TOKEN_A_AMOUNT);
    let iniBalT1 = await taxableToken.balanceOf(signer[0].address);
    let iniBalT2 = await tokenA.balanceOf(signer[0].address);
    // await uniswapV2Router02.connect(signer[0]).swapExactTokensForTokens(amountIn,1,[taxableToken.target,tokenA.target],signer[0].address, deadline);
   await expect (uniswapV2Router02.connect(signer[0]).swapExactTokensForTokens(amountIn,1,[taxableToken.target,tokenA.target],signer[0].address, deadline)).to.be.revertedWith('UniswapV2: K')

    console.log(`Reserve After swap: ${(await uniswapV2PairAt.getReserves())}`);
    let fnlBalT1 = await taxableToken.balanceOf(signer[0].address);
    let fnlBalT2 = await tokenA.balanceOf(signer[0].address);
    console.log(`
    Initial Balance of Token Taxable : ${iniBalT1}
    Initial Balance of Token A : ${iniBalT2}
    Final Balance of Token Taxable   : ${fnlBalT1}
    Final Balance of Token A   : ${fnlBalT2}
    `);
    
  });
  it('  *** Not/working Check RemoveLiquidityWithPermit ***  ', async () => {
    // console.log(`Init Hash : ${initHash}`);
    await _addLiquidity();

    console.log(`Contract Address of Uniswap Pair Contract: ${uniswapV2Pair.target}`);
    pair = await uniswapV2Factory.getPair(tokenA.target, tokenB.target);
    console.log(`Pair Address Of TokenA/TokenB via Factory: ${pair}`);
    let uniswapV2PairAt = await uniswapV2Pair.connect(signer[0]).attach(pair);
    console.log(`Liquidity After Add Liquidity Function : ${await uniswapV2PairAt.balanceOf(signer[0].address)}`);
    // let TokenPair = await _factory.getPair(myToken.address,simpalToken.address);
    // let pairAttach = await uniswapV2Pair.attach(TokenPair);

    // const uniswapName = await uniswapV2ERC20.name();
    // let point = await pairAttach.getReserves();
    // await point._reserve0;
    // console.log("Reserve A:", point._reserve0);
    // await point._reserve1;
    // console.log("Reserve B:", point._reserve1);
    let liquidity = await uniswapV2PairAt.balanceOf(signer[0].address);
    console.log(`Reserve After Add Liquidity: ${await uniswapV2PairAt.getReserves()}`);
    const signatureDigest = await 
    signer[0]._signTypedData( 
      {
        name : await uniswapV2PairAt.name(),
        version :"1",
        chainId : "0",
        verifyingContract: uniswapV2PairAt.target,

      }, 
      {   
          Permit: [
            {
              name: 'owner',
              type: 'address',
            },
            {
              name: 'spender',
              type: 'address',
            },
            {
              name: 'value',
              type: 'uint256',
            },
            {
              name: 'nonce',
              type: 'uint256',
            },
            {
              name: 'deadline',
              type: 'uint256',
            },
          ],
        },
        {
          owner:signer[0].address,
          spender: uniswapV2Router02.target,
          value: liquidity,
          nonce: await uniswapV2PairAt.nonces(signer[0].address),
          deadline:deadline,
      
        });
        const signatureSplit = await ethers.utils.splitSignature(signatureDigest);
        console.log(signatureSplit ,"split value");
        
        // await uniswapV2Router02.connect(owner).removeLiquidityWithPermit(myToken.address,simpalToken.address,
        // liquidity,expandTo18Decimals(1),expandTo18Decimals(1),owner.address,deadLine,false, 
        // signatureSplit.v, signatureSplit.r,signatureSplit.s,{gasLimit:3000000})               
      
    await uniswapV2PairAt.connect(signer[0]).approve(uniswapV2Router02.target, liquidity);
    await uniswapV2Router02.connect(signer[0]).removeLiquidityWithPermit(tokenA.target,tokenB.target,liquidity,amountAMin,amountBMin,signer[0].address,deadline,false, 
      signatureSplit.v, signatureSplit.r,signatureSplit.s,{gasLimit:3000000}) 
    console.log(`Liquidity After Remove Liquidity Function : ${await uniswapV2PairAt.balanceOf(signer[0].address)}`);
    console.log(`Reserve After Remove Liquidity: ${await uniswapV2PairAt.getReserves()}`);
  });
});