pragma solidity ^0.8.9;

interface IUniswapV3Pool {
  function token0() external returns (address);
  function token1() external returns (address);

  function swap(
    address recipient,
    bool zeroForOne,
    int256 amountSpecified,
    uint160 sqrtPriceLimitX96,
    bytes calldata data
  ) external returns (int256 amount0, int256 amount1);
}