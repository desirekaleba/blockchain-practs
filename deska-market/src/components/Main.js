import React, { useState } from 'react';

const Main = ({ createProduct, purchaseProduct, products }) => {

    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState(1);

    const handleProductNameChange = (event) => {
        setProductName(event.target.value);
    }
    const handleProductPriceChange = (event) => {
        setProductPrice(event.target.value);
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        const price = window.web3.utils.toWei(productPrice.toString(), 'ether');
        createProduct(productName, price);
    }
    return (
        <div className='container'>
            <h2>Add Product</h2>
            <form onSubmit={handleSubmit}>
                <div className='form-group mr-sm-2'>
                    <input type='text'
                        className='form-control'
                        placeholder='Product Name'
                        value={productName}
                        onChange={handleProductNameChange}
                        required />
                </div>
                <div className='form-group mr-sm-2'>
                    <input type='text'
                        className='form-control'
                        placeholder='Product Price'
                        value={productPrice}
                        onChange={handleProductPriceChange}
                        required />
                </div>
                <button type='submit' className='btn btn-primary'>Add Product</button>
            </form>
            <p></p>
            <h2>Buy Product</h2>
            <table className='table'>
                <thead>
                    <tr>
                        <th scope='col'>#</th>
                        <th scope='col'>Name</th>
                        <th scope='col'>Price</th>
                        <th scope='col'>Owner</th>
                        <th scope='col'></th>
                    </tr>
                </thead>
                <tbody id='productList'>
                    {console.log(products)}
                    {products?.map(product =>
                        <tr key={product.id}>
                            <th scope="row">{product.id.toString()}</th>
                            <td>{product.name}</td>
                            <td>{window.web3.utils.fromWei(product.price.toString(), 'ether')} ETH</td>
                            <td>{product.owner}</td>
                            <td>
                                {!product.purchased ?
                                    (
                                        <button
                                            name={product.id}
                                            value={product.price}
                                            onClick={(evt) => { purchaseProduct(evt.target.name, evt.target.value) }}
                                        > Buy </button>
                                    ) : null

                                }
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
};

export default Main;
