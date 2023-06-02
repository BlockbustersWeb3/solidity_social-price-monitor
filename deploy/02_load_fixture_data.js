const { network, ethers } = require("hardhat")

module.exports = async ({ deployments }) => {
    const { log } = deployments
    const [ , user1, user2, user3, user4 ] = await ethers.getSigners();
    let priceMonitor = await ethers.getContract("PriceMonitor");

    log("----------------------------------------------------")

     // create a product
     let txProductResponse = await priceMonitor.addProduct("Arroz 1KG", "Blue Patna", "Arror Normal, blanco, sin aditivios");
     let txProductReceipt = await txProductResponse.wait(1);
     let productId = txProductReceipt.events[0].args[0];
     log("New product", productId)

     txProductResponse = await priceMonitor.addProduct("Detergente 3KG", "Ariel", "Detergente para lavar ropa");
     txProductReceipt = await txProductResponse.wait(1);
     productId = txProductReceipt.events[0].args[0];
     log("New product", productId)

     txProductResponse = await priceMonitor.addProduct("Mouse Inalambrico", "Logitech", "Mouse inalambrico gamer v3.1 conexion Bluetooth");
     txProductReceipt = await txProductResponse.wait(1);
     productId = txProductReceipt.events[0].args[0];
     log("New product", productId)

     txProductResponse = await priceMonitor.addProduct("Zucaritas", "Kellogs", "Cereal en caja de 250gr para desayuno");
     txProductReceipt = await txProductResponse.wait(1);
     productId = txProductReceipt.events[0].args[0];
     log("New product", productId)


     txProductResponse = await priceMonitor.addProduct("Crema de dientes", "Colgate", "Pasta de dientes con efectos blanqueadores. Seguridad 24/7");
     txProductReceipt = await txProductResponse.wait(1);
     productId = txProductReceipt.events[0].args[0];
     log("New product", productId)

     txProductResponse = await priceMonitor.addProduct("Monopoly", "PlayDo", "Popular juego de mesa sobre inversiones en bienes raices");
     txProductReceipt = await txProductResponse.wait(1);
     productId = txProductReceipt.events[0].args[0];
     log("New product", productId)
     
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