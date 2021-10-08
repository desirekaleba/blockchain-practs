// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

contract Coin {
    address public minter;
    mapping(address => uint) public balances;
    
    event Sent(address from, address to, uint amount);
    
    constructor() {
        minter = msg.sender;
    }
    
    /*
     * @mint mint new coins
     * @param receiver receiver's address
     * @param amount amount to mint
     */
    function mint(address receiver, uint amount) public {
        require(msg.sender == minter);
        balances[receiver] += amount;
    }
    
    /*
     * @Throws when requested amount > available amount
     * @param requested requested amount
     * @param available available amount
     */
    error InsufficientBalance(uint requested, uint available);
    
    /*
     * @send make transactions
     * @param receiver receiver's address
     * @param amount amount to send
     */
    function send(address receiver, uint amount) public {
        if (amount > balances[msg.sender]) {
            revert InsufficientBalance({
                requested: amount,
                available: balances[msg.sender]
            });
        }
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        emit Sent(msg.sender, receiver, amount);
    }
}
