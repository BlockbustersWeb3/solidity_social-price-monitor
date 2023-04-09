// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// import "hardhat/console.sol";

interface IPUSHCommInterface {
    function sendNotification(
        address _channel,
        address _recipient,
        bytes calldata _identity
    ) external;
}

error PriceMonitor__IsNotSubscriber();

contract PriceMonitor is Ownable {
    using Strings for uint;
    using Strings for address;
    using Counters for Counters.Counter;

    struct PriceReport {
        uint256 productId;
        uint256 price;
        uint256 storeId;
        address reporter;
        address[] validators;
    }

    struct Product {
        string name;
        string brand;
        string description;
    }

    struct Store {
        uint256 id;
        string name;
        string location;
    }

    IPUSHCommInterface immutable PUSHCOMM;
    address immutable CHANNEL_ADDRESS;
    uint8 immutable i_decimals;

    Counters.Counter private _priceReportIds;
    Counters.Counter private _productIds;

    mapping(uint256 => Product) s_products;
    mapping(uint256 => Store) s_stores;
    mapping(uint256 => PriceReport) s_priceReports;

    mapping(uint256 => mapping(address => bool)) productSubscribers;
    mapping(uint256 => address[]) productSubscribersAll;

    event PriceReported(
        uint256 id,
        uint256 indexed productId,
        uint256 price,
        uint256 indexed storeId,
        address indexed reporter
    );

    event ProductCreated(
        uint256 id,
        string _name,
        string indexed _brand,
        string _description
    );

    event PriceReportValidated(
        uint256 indexed priceReportId,
        address indexed validator,
        uint256 validatorsCount
    );

    constructor(uint8 _decimals, address _epns_proxy_address) {
        i_decimals = _decimals;

        CHANNEL_ADDRESS = msg.sender;
        address EPNS_COMMV_1_5_STAGING = _epns_proxy_address;
        PUSHCOMM = IPUSHCommInterface(EPNS_COMMV_1_5_STAGING);
    }

    function addPriceReport(
        uint256 _productId,
        uint256 _price,
        uint256 _storeId
    ) public {
        uint256 currentPriceReportId = _priceReportIds.current();
        s_priceReports[currentPriceReportId] = PriceReport(
            _productId,
            _price,
            _storeId,
            msg.sender,
            new address[](0)
        );
        _priceReportIds.increment();

        emit PriceReported(
            currentPriceReportId,
            _productId,
            _price,
            _storeId,
            msg.sender
        );

        address to = address(this);
        PUSHCOMM.sendNotification(
            CHANNEL_ADDRESS, // from channel
            to, // to recipient, put address(this) in case you want Broadcast or Subset. For Targetted put the address to which you want to send
            bytes(
                string(
                    // We are passing identity here: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                    abi.encodePacked(
                        "0", // this is notification identity: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                        "+", // segregator
                        "1", // this is payload type: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/payload (1, 3 or 4) = (Broadcast, targetted or subset)
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

    function addProduct(
        string memory _name,
        string memory _brand,
        string memory _description
    ) public {
        uint256 currentProductId = _productIds.current();
        s_products[currentProductId] = Product(_name, _brand, _description);
        _productIds.increment();

        emit ProductCreated(currentProductId, _name, _brand, _description);

        address to = address(this);
        PUSHCOMM.sendNotification(
            CHANNEL_ADDRESS, // from channel
            to, // to recipient, put address(this) in case you want Broadcast or Subset. For Targetted put the address to which you want to send
            bytes(
                string(
                    // We are passing identity here: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                    abi.encodePacked(
                        "0", // this is notification identity: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                        "+", // segregator
                        "1", // this is payload type: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/payload (1, 3 or 4) = (Broadcast, targetted or subset)
                        "+", // segregator
                        "Price Report Alert: Product added", // this is notificaiton title
                        "+", // segregator
                        "Check this added product! ",
                        " | reported by: ", // notification body
                        msg.sender.toHexString(), // notification body
                        " | Product ID: ", // notification body
                        currentProductId.toString(), // notification body
                        " | Name: ", // notification body
                        _name, // notification body
                        " | Brand: ", // notification body
                        _brand, // notification body
                        " | Description: ", // notification body
                        _description, // notification body
                        " PUSH to you!" // notification body
                    )
                )
            )
        );
    }

    function addProductSubscriber(uint256 _productId) public {
        productSubscribersAll[_productId].push(msg.sender);
        productSubscribers[_productId][msg.sender] = true;
    }

    function removeProductSubscriber(uint256 _productId) public {
        if (!productSubscribers[_productId][msg.sender]) {
            revert PriceMonitor__IsNotSubscriber();
        }

        address[] memory allSubscribers = productSubscribersAll[_productId];
        for (uint256 i = 0; i < allSubscribers.length; i++) {
            if (allSubscribers[i] == msg.sender) {
                productSubscribersAll[_productId][i] = productSubscribersAll[
                    _productId
                ][allSubscribers.length - 1];
                productSubscribersAll[_productId].pop();

                productSubscribers[_productId][msg.sender] = false;
            }
        }
    }

    function validatePriceReport(uint256 _priceReportId) public {
        // TODO Check if sender is in assigned validators list
        s_priceReports[_priceReportId].validators.push(msg.sender);

        emit PriceReportValidated(
            _priceReportId,
            msg.sender,
            getValidatorsCount(_priceReportId)
        );
    }

    /* getters */
    function getPriceReport(
        uint256 index
    ) public view returns (PriceReport memory) {
        return s_priceReports[index];
    }

    function getProduct(uint256 index) public view returns (Product memory) {
        return s_products[index];
    }

    function isSubscribedToProduct(
        uint256 _productId
    ) public view returns (bool) {
        return productSubscribers[_productId][msg.sender];
    }

    function getValidatorsCount(
        uint _priceReportId
    ) public view returns (uint256) {
        return s_priceReports[_priceReportId].validators.length;
    }
}
