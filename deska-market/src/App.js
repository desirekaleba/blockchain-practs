import React, { useState, useEffect } from 'react';
import Marketplace from './abis/Marketplace.json';

import Navbar from './components/Navbar';
import Main from './components/Main';

import './App.css';
import Web3 from 'web3';

function App() {

  const [account, setAccount] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productCount, setProductCount] = useState(null);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  };

  const loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    const networkID = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkID];
    if (networkData) {
      const _marketplace = new web3.eth.Contract(Marketplace.abi, networkData.address);
      setMarketplace(_marketplace);
      const _productCount = await _marketplace.methods.productCount().call();
      setProductCount(productCount);
      const _products = [];
      for (let i = 1; i <= _productCount; i++) {
        const product = await _marketplace.methods.products(i).call();
        _products.push(product);
      }
      setProducts(_products);
      setLoading(false);
    } else {
      window.alert('Marketplace contract not deployed to detected network.');
    }
  };

  const createProduct = (name, price) => {
    setLoading(true);
    marketplace.methods.createProduct(name, price).send({ from: account })
      .once('receipt', (receipt) => {
        setLoading(false);
      })
  };

  const purchaseProduct = (id, price) => {
    setLoading(true);
    marketplace.methods.purchaseProduct(id).send({ from: account, value: price })
      .once('receipt', (receipt) => {
        loading(false);
      })
  };

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  return (
    <div className="App">
      <Navbar account={account} />
      <main role='main' className='col-lg-12 d-flex'>
        {loading ?
          (
            <div className='d-flex justify-content-center'>
              <div className="spinner-grow" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )
          : (
            <Main products={products}
              createProduct={createProduct}
              purchaseProduct={purchaseProduct} />
          )}
      </main>
    </div>
  );
}

export default App;
