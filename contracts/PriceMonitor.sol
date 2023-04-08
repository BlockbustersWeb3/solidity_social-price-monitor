// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IPUSHCommInterface {
    function sendNotification(
        address _channel,
        address _recipient,
        bytes calldata _identity
    ) external;
}

contract PriceMonitor is Ownable {
    using Strings for uint;
    using Strings for address;
    using Counters for Counters.Counter;

    IPUSHCommInterface PUSHCOMM;

    Counters.Counter private _priceReportIds;

    struct PriceReport {
        uint256 productId;
        uint256 price;
        uint256 storeId;
        address reporter;
    }

    struct Product {
        uint256 id;
        string name;
        string brand;
        string description;
    }

    struct Store {
        uint256 id;
        string name;
        string location;
    }

    uint8 i_decimals;

    Product[] s_productList;
    Store[] s_storeList;
    mapping(uint256 => PriceReport) s_priceReports;

    event PriceReported(
        uint256 id,
        uint256 indexed productId,
        uint256 price,
        uint256 indexed storeId,
        address indexed reporter
    );

    constructor(uint8 _decimals) {
        i_decimals = _decimals;

        address EPNS_COMMV_1_5_STAGING = 0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa; //MUMBAI
        PUSHCOMM = IPUSHCommInterface(EPNS_COMMV_1_5_STAGING);
    }

    function addPriceReport(
        uint256 _productId,
        uint256 _price,
        uint256 _storeId
    ) public {
        uint256 currentpriceReportId = _priceReportIds.current();
        s_priceReports[currentpriceReportId] = PriceReport(
            _productId,
            _price,
            _storeId,
            msg.sender
        );
        _priceReportIds.increment();

        emit PriceReported(
            currentpriceReportId,
            _productId,
            _price,
            _storeId,
            msg.sender
        );

        address CHANNEL_ADDRESS = 0xCfA675376B1Aca49B30A2C836BB5D0834907A3cb;
        address to = 0xCfA675376B1Aca49B30A2C836BB5D0834907A3cb;

        // IPUSHCommInterface(EPNS_COMMV_1_5_STAGING).sendNotification(
        PUSHCOMM.sendNotification(
            CHANNEL_ADDRESS, // from channel
            to, // to recipient, put address(this) in case you want Broadcast or Subset. For Targetted put the address to which you want to send
            bytes(
                string(
                    // We are passing identity here: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                    abi.encodePacked(
                        "0", // this is notification identity: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                        "+", // segregator
                        "3", // this is payload type: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/payload (1, 3 or 4) = (Broadcast, targetted or subset)
                        "+", // segregator
                        "Price Report Alert", // this is notificaiton title
                        "+", // segregator
                        "Check this reported price! ",
                        " | reported by: ", // notification body
                        msg.sender.toHexString(), // notification body
                        " | Product: ", // notification body
                        _productId.toString(), // notification body
                        " | Price: ", // notification body
                        _price.toString(), // notification body
                        " PUSH to you!" // notification body
                    )
                )
            )
        );
    }

    /* getters */
    function getPriceReport(
        uint256 index
    ) public view returns (PriceReport memory) {
        return s_priceReports[index];
    }
}
