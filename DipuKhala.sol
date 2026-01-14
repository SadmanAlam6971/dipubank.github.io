// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts@5.5.0/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts@5.5.0/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts@5.5.0/access/Ownable.sol";

/// @custom:security-contact contacttous@gmail.com
contract DipuKhala is ERC20, Ownable, ERC20Permit {
    constructor(address recipient, address initialOwner)
        ERC20("DipuKhala", "DIPUKHALA")
        Ownable(initialOwner)
        ERC20Permit("DipuKhala")
    {
        _mint(recipient, 10000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
