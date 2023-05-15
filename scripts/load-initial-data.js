const { ethers } = require("hardhat");

async function loadInitialData() {
    const priceMonitor = await ethers.getContract("PriceMonitor");

    // create a product
    const txProductResponse = await priceMonitor.addProduct("Arroz 1KG", "Blue Patna", "Arror Normal, blanco, sin aditivios");
    const txProductReceipt = await txProductResponse.wait(1);
    const productId = txProductReceipt.events[1].args.id;
    
    // create a store
    const txStoreResponse = await priceMonitor.addStore("Tata 99", "Av 18 de Julio y Andes");
    const txStoreReceipt = await txStoreResponse.wait(1);
    const StoreId = txStoreReceipt.events[1].args.id;
    
    // subscribe 5 accounts to the product
    // create a priceReport
}