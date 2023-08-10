// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/token/ERC20/IERC20.sol";

contract ShoppingTransaction {
    IERC20 public usdtToken;
    IERC20 public usdcToken;
    address public owner;

    enum TokenType { USDT, USDC }

    event Purchased(string indexed orderUUID, address indexed buyer, uint256 amount, TokenType tokenUsed);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(address _usdtAddress, address _usdcAddress) {
        usdtToken = IERC20(_usdtAddress);
        usdcToken = IERC20(_usdcAddress);
        owner = msg.sender;
    }

    function purchase(string memory orderUUID, uint256 amount, TokenType tokenType) public {
        IERC20 token;
        if (tokenType == TokenType.USDT) {
            token = usdtToken;
        } else if (tokenType == TokenType.USDC) {
            token = usdcToken;
        } else {
            revert("Invalid token type");
        }

        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "Allowance too low"
        );
        require(
            token.transferFrom(msg.sender, owner, amount),
            "Transfer failed"
        );

        emit Purchased(orderUUID, msg.sender, amount, tokenType);
    }
}

