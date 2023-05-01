import React from 'react'
import { useState } from 'react'
import { ethers } from 'ethers'

export default function Navbar(props) {

  const [walletAddress, setWalletAddress] = useState("")

  /**
   * Request access to the User's META MASK WALLET
   */
  async function requestAccount() {
    //Check if the Meta Mask Extensions exists
    if(window.ethereum){
      console.log("detected")
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      setWalletAddress(accounts[0])
    }else{
      console.log("Meta Mask not detected")
    }
  }

  async function connectWallet(){
    if(typeof window.ethereum !== 'undefined'){
      await requestAccount();
      //Provider to interact with the smart contract
      //const provider = new ethers.providers.Web3Provider(window.ethereum)
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  return (
    <nav className="navbar navbar-expand-lg blur border-radius-sm top-0 z-index-3 shadow position-sticky py-3 start-0 end-0">
      <div className="container px-1">
        <a className="navbar-brand font-weight-bolder ms-lg-0 " href="#">Blockbusters</a>
        <button className="navbar-toggler shadow-none ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navigation" aria-controls="navigation" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon mt-2">
            <span className="navbar-toggler-bar bar1"></span>
            <span className="navbar-toggler-bar bar2"></span>
            <span className="navbar-toggler-bar bar3"></span>
          </span>
        </button>
        <div className="collapse navbar-collapse" id="navigation">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link text-dark font-weight-bold d-flex align-items-center me-2 " aria-current="page" href="/astro-ecommerce/">
                How it works
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark font-weight-bold d-flex align-items-center me-2 " aria-current="page" href="#">
                Team
              </a>
            </li>
            <li className="nav-item">
              <button className="nav-link text-dark font-weight-bold d-flex align-items-center me-2"
                aria-current="page"
                id="btn-connection-wallet"
                onClick={connectWallet}>
                  Connect Wallet
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

// const Navbar = () => {  

//   return (
//     <nav className="navbar navbar-expand-lg blur border-radius-sm top-0 z-index-3 shadow position-sticky py-3 start-0 end-0">
//       <div className="container px-1">
//         <a className="navbar-brand font-weight-bolder ms-lg-0 " href="#">Blockbusters</a>
//         <button className="navbar-toggler shadow-none ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navigation" aria-controls="navigation" aria-expanded="false" aria-label="Toggle navigation">
//           <span className="navbar-toggler-icon mt-2">
//             <span className="navbar-toggler-bar bar1"></span>
//             <span className="navbar-toggler-bar bar2"></span>
//             <span className="navbar-toggler-bar bar3"></span>
//           </span>
//         </button>
//         <div className="collapse navbar-collapse" id="navigation">
//           <ul className="navbar-nav ms-auto">
//             <li className="nav-item">
//               <a className="nav-link text-dark font-weight-bold d-flex align-items-center me-2 " aria-current="page" href="/astro-ecommerce/">
//                 How it works
//               </a>
//             </li>
//             <li className="nav-item">
//               <a className="nav-link text-dark font-weight-bold d-flex align-items-center me-2 " aria-current="page" href="#">
//                 Team
//               </a>
//             </li>
//             <li className="nav-item">
//               <button className="nav-link text-dark font-weight-bold d-flex align-items-center me-2"
//                 aria-current="page"
//                 id="btn-connection-wallet">
//                   Connect Wallet
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
