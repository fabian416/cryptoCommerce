// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/token/ERC20/IERC20.sol";

contract ShoppingTransaction {
    IERC20 public usdtToken;
    IERC20 public usdcToken;
    address public owner;

    enum TokenType { USDT, USDC }

    // Structure to register order details
    struct PurchaseDetail {
        string orderUUID; // UUID or order number
        address buyer;    // Wallet address of the buyer
        uint256 amount;   // Amount of the transaction
        TokenType tokenUsed; // Type of token used
    }

    // Array to show a register of all the transactions
    PurchaseDetail[] public purchaseHistory;

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

        PurchaseDetail memory newPurchase;
        newPurchase.orderUUID = orderUUID;
        newPurchase.buyer = msg.sender;
        newPurchase.amount = amount;
        newPurchase.tokenUsed = tokenType;

        purchaseHistory.push(newPurchase);

        emit Purchased(orderUUID, msg.sender, amount, tokenType);
    }

    function getPurchaseHistoryLength() public view returns (uint256) {
        return purchaseHistory.length;
    }

    function setTokenAddress(TokenType tokenType, address newAddress) public onlyOwner {
        if (tokenType == TokenType.USDT) {
            usdtToken = IERC20(newAddress);
        } else if (tokenType == TokenType.USDC) {
            usdcToken = IERC20(newAddress);
        } else {
            revert("Invalid token type");
        }
    }
}
