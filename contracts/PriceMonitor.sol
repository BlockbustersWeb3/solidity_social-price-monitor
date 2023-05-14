// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//VRF
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

import "hardhat/console.sol";

interface IPUSHCommInterface {
    function sendNotification(
        address _channel,
        address _recipient,
        bytes calldata _identity
    ) external;
}

error PriceMonitor__IsNotSubscriber();

contract PriceMonitor is VRFConsumerBaseV2, ConfirmedOwner {
    using Strings for uint;
    using Strings for address;
    using Counters for Counters.Counter;

    struct PriceReport {
        uint256 productId;
        uint256 price;
        uint256 storeId;
        address reporter;
        address[] assignedValidators;
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

    mapping(uint256 => mapping(address => bool)) productSubscribers; // TODO Check if this mapping it's necessary since were adding and deleting items from array
    mapping(uint256 => address[]) productSubscribersAll;

    //VRF
    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus)
        public s_requests; /* requestId --> requestStatus */
    VRFCoordinatorV2Interface COORDINATOR;

    mapping(uint256 => uint256) requestToPriceReport;

    // Your subscription ID.
    uint64 s_subscriptionId;

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    bytes32 i_keyHash;
    uint32 i_callbackGasLimit;
    uint16 i_requestConfirmations;
    uint32 i_numWords;

    // Events

    event PriceReported(
        uint256 id,
        uint256 indexed productId,
        uint256 price,
        uint256 indexed storeId,
        address indexed reporter,
        uint256 requestId
    );

    event ProductCreated(
        uint256 id,
        string _name,
        string indexed _brand,
        string _description
    );

    event PriceReportValidatorsAssigned(
        uint256 indexed priceReportId,
        address[] validators
    );

    event PriceReportValidated(
        uint256 indexed priceReportId,
        address indexed validator,
        uint256 validatorsCount
    );


    constructor(
        uint8 _decimals,
        address _epns_proxy_address,
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 keyHash,
        uint32 callbackGasLimit
    )
        VRFConsumerBaseV2(vrfCoordinatorV2)
        ConfirmedOwner(msg.sender)
    {
        i_decimals = _decimals;

        CHANNEL_ADDRESS = msg.sender;
        address EPNS_COMMV_1_5_STAGING = _epns_proxy_address;
        PUSHCOMM = IPUSHCommInterface(EPNS_COMMV_1_5_STAGING);

        //VRF
        COORDINATOR = VRFCoordinatorV2Interface(
            vrfCoordinatorV2
        );
        i_keyHash = keyHash; 
        s_subscriptionId = subscriptionId;
        i_requestConfirmations = 3;
        i_callbackGasLimit = callbackGasLimit;
        i_numWords = 4;
    }

    function addPriceReport(
        uint256 _productId,
        uint256 _price,
        uint256 _storeId
    ) public returns(uint256 currentPriceReportId) {
        currentPriceReportId = _priceReportIds.current();
        s_priceReports[currentPriceReportId] = PriceReport(
            _productId,
            _price,
            _storeId,
            msg.sender,
            new address[](0),
            new address[](0)
        );
        _priceReportIds.increment();
        
        uint256 requestId = 0;
        if (productSubscribersAll[_productId].length < 4){
            assignValidators(currentPriceReportId, new uint256[](0));
            console.log("HERE");
        } else {
            requestId = requestRandomWords();
        }
        
        console.log("requestId", requestId);
        requestToPriceReport[requestId] = currentPriceReportId;

        emit PriceReported(
            currentPriceReportId,
            _productId,
            _price,
            _storeId,
            msg.sender,
            requestId // Maybe I dont need this and can move the event earlier
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

    // function requestForValidators(uint256 _priceReportId) private {
    //     uint256 requestId = requestRandomWords(_priceReportId);
    //     s_priceReportRequests[_priceReportId].push(requestId);

    //     emit RequestForValidatorsSent(_priceReportId, requestId, i_numWords);
    // }

    function requestRandomWords() private returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            i_keyHash,
            s_subscriptionId,
            i_requestConfirmations,
            i_callbackGasLimit,
            i_numWords
        );
        console.log("Request ID:", requestId);
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        // emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        // emit RequestFulfilled(_priceReportId, _requestId, _randomWords);

        assignValidators(requestToPriceReport[_requestId], _randomWords);
    }

    function getRequestStatus(
        uint256 _requestId
    )
        external
        view
        returns (
            bool fulfilled,
            uint256[] memory randomWords,
            uint256 priceReportId
        )
    {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (
            request.fulfilled,
            request.randomWords,
            requestToPriceReport[_requestId]
        );
    }

    function assignValidators(
        uint256 _priceReportId,
        uint256[] memory _randomWords
    ) private {
        uint256 randomWordsLength = _randomWords.length;
        console.log("Random Words Length: ", "->", randomWordsLength);
        
        uint256 productId = s_priceReports[_priceReportId].productId;
        // create temp list
        address[] storage _productSubscribers = productSubscribersAll[productId];

        if (randomWordsLength == 0) {
            // Assign all available subscribers
            s_priceReports[_priceReportId].assignedValidators = _productSubscribers;
        } else {
            for (uint256 i = 0; i < randomWordsLength; i++){
                console.log("Loop: ", i);
                console.log("_priceReportId: ", _priceReportId);

                // calculate the index
                uint256 indexOfValidator =  _randomWords[i] % _productSubscribers.length;
                
                // add the chosen validator to validators list
                s_priceReports[_priceReportId].assignedValidators.push(_productSubscribers[indexOfValidator]);
                console.log("Validators: ", i, "->", _productSubscribers[indexOfValidator]);

                // Remove chosen validator from temp list
                _productSubscribers[indexOfValidator] = _productSubscribers[_productSubscribers.length - 1];
                _productSubscribers.pop();
            }
        }

        emit PriceReportValidatorsAssigned(_priceReportId, s_priceReports[_priceReportId].assignedValidators);
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

// TODO
// when a pricereport is created, it calls a function to assign validators
// these validators are assigned into a mapping priceReportId => address[] assignedValidators
// and event is emitted
// a PUSH Notification is sent to assigned validators

// a priceReportId might require multiple calls for validators if any turn down its assignment
// so create a mapping priceReportId => requestId => bool requestIdFullfilled
