import React, { useEffect, useState } from 'react';
import './App.css';
import twitterLogo from './assets/twitter-logo.svg';
import SelectCharacter from './Components/SelectCharacter';
import KSGame from './utils/KSGame.json';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';
const MUMBAI_ID = "0x13881"; //POLYGON
const RINKEBY_ID = "0x04";

const App = () => {

  // State
  const [currentAccount, setCurrentAccount] = useState(null);
	const [characterNFT, setCharacterNFT] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [network, setNetwork] = useState("")

  // Actions
  const checkIfWalletIsConnected = async () => {
        try {
            const {ethereum} = window;
            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {

                console.log("Metamask detected", ethereum);
            }

            const network = await ethereum.request({method: 'eth_chainId'});
            if (network === RINKEBY_ID) {
                setNetwork(network);
                console.log("Connected to Rinkeby testnet");
            }

            const accounts = await ethereum.request({method: 'eth_accounts'});
            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account)
            } else {
                console.log("No authorized account found")
            }
        } catch (error) {
            console.log(error);
        }
    }

	  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
  //setIsLoading(true);
  checkIfWalletIsConnected();
}, []);

useEffect(() => {
  const fetchNFTMetadata = async () => {
    console.log('Checking for Character NFT on address:', currentAccount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      KSGame.abi,
      signer
    );

    const characterNFT = await gameContract.checkIfUserHasNFT();
    if (characterNFT.name) {
      console.log('User has character NFT');
      setCharacterNFT(transformCharacterData(characterNFT));
    }

    setIsLoading(false);
  };

  if (currentAccount) {
    console.log('CurrentAccount:', currentAccount);
    fetchNFTMetadata();
  }
}, [currentAccount]);

	// Render Methods
const renderContent = () => {
  /*
   * If the app is currently loading, just render out LoadingIndicator
   */
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
        <img
          src="https://thumbs.gfycat.com/BoilingFrankIbizanhound-size_restricted.gif"
          alt="Pokemon Battle"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet To Get Started
        </button>
      </div>
    );
  } else if (currentAccount && !characterNFT) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
  } else if (currentAccount && characterNFT) {
    return (
      <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
    );
  }
};



  return (
  <div className="App">
    <div className="container">
      <div className="header-container">
        <p className="header gradient-text">⚔️ Pokemon Battle ⚔️</p>
        <p className="sub-text">Team up to defeat the Pokemon Boss!</p>
        {renderContent()}
      </div>
      <div className="footer-container">
      </div>
    </div>
  </div>
);
};

export default App;