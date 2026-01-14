
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DipuStaking is ReentrancyGuard {
    IERC20 public s_stakingToken;
    IERC20 public s_rewardToken;

    
    uint256 public constant REWARD_RATE = 100; 
    uint256 public s_totalSupply;
    uint256 public s_lastUpdateTime;
    uint256 public s_rewardPerTokenStored;

    mapping(address => uint256) public s_userRewardPerTokenPaid;
    mapping(address => uint256) public s_rewards;
    mapping(address => uint256) public s_balances;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address stakingToken, address rewardToken) {
        s_stakingToken = IERC20(stakingToken);
        s_rewardToken = IERC20(rewardToken);
    }

    function rewardPerToken() public view returns (uint256) {
        if (s_totalSupply == 0) {
            return s_rewardPerTokenStored;
        }
        return s_rewardPerTokenStored + (((block.timestamp - s_lastUpdateTime) * REWARD_RATE * 1e18) / s_totalSupply);
    }

    function earned(address account) public view returns (uint256) {
        return ((s_balances[account] * (rewardPerToken() - s_userRewardPerTokenPaid[account])) / 1e18) + s_rewards[account];
    }

    modifier updateReward(address account) {
        s_rewardPerTokenStored = rewardPerToken();
        s_lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            s_rewards[account] = earned(account);
            s_userRewardPerTokenPaid[account] = s_rewardPerTokenStored;
        }
        _;
    }

    function stake(uint256 amount) external updateReward(msg.sender) nonReentrant {
        require(amount > 0, "Cannot stake 0");
        s_totalSupply += amount;
        s_balances[msg.sender] += amount;
        bool success = s_stakingToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external updateReward(msg.sender) nonReentrant {
        require(amount > 0, "Cannot withdraw 0");
        s_totalSupply -= amount;
        s_balances[msg.sender] -= amount;
        bool success = s_stakingToken.transfer(msg.sender, amount);
        require(success, "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() external updateReward(msg.sender) nonReentrant {
        uint256 reward = s_rewards[msg.sender];
        if (reward > 0) {
            s_rewards[msg.sender] = 0;
            bool success = s_rewardToken.transfer(msg.sender, reward);
            require(success, "Transfer failed");
            emit RewardsClaimed(msg.sender, reward);
        }
    }

}
