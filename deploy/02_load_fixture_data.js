const { network, ethers } = require("hardhat")

module.exports = async ({ deployments }) => {
    const { log } = deployments
    const [ , user1, user2, user3, user4 ] = await ethers.getSigners();
    let priceMonitor = await ethers.getContract("PriceMonitor");

    log("----------------------------------------------------")

     // create a product
     const txProductResponse = await priceMonitor.addProduct("Arroz 1KG", "Blue Patna", "Arror Normal, blanco, sin aditivios");
     const txProductReceipt = await txProductResponse.wait(1);
     const productId = txProductReceipt.events[0].args[0];
     log(productId)
     
     // create a store
     const txStoreResponse = await priceMonitor.addStore("Tata 99", "Av 18 de Julio y Andes");
     const txStoreReceipt = await txStoreResponse.wait(1);
     const StoreId = txStoreReceipt.events[0].args[0];
     
     // subscribe 5 accounts to the product
     await priceMonitor.addProductSubscriber(productId);
     await priceMonitor.connect(user1).addProductSubscriber(productId);
     await priceMonitor.connect(user2).addProductSubscriber(productId);
     await priceMonitor.connect(user3).addProductSubscriber(productId);
     const txSubscription = await priceMonitor.connect(user4).addProductSubscriber(productId);
     await txSubscription.wait(1);

     // check product has 5 subscribers
     const subscribersdCount = await priceMonitor.getProductSubscribersCount(productId);
     log("---Subscribers Count:", subscribersdCount.toString());

     log("----------------------------------------------------")
 }


module.exports.tags = ["all", "fixturedata"]