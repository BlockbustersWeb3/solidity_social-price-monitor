// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceMonitor is Ownable {
    struct PriceReport {
        uint256 id;
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
    PriceReport[] s_priceReportList;

    event PriceReported(
        uint256 id,
        uint256 indexed productId,
        uint256 price,
        uint256 indexed storeId,
        address indexed reporter
    );

    constructor(uint8 _decimals) {
        i_decimals = _decimals;
    }

    function addPriceReport(
        uint256 _id,
        uint256 _productId,
        uint256 _price,
        uint256 _storeId
    ) public {
        s_priceReportList.push(
            PriceReport(_id, _productId, _price, _storeId, msg.sender)
        );

        emit PriceReported(_id, _productId, _price, _storeId, msg.sender);
    }

    /* getters */
    function getPriceReport(uint256 index) public view returns (PriceReport memory) {
        return s_priceReportList[index];
    }
}
