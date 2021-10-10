const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);

require('chai')
    .use(require('chai-as-promised'))
    .should();

const Marketplace = artifacts.require("Marketplace");

contract('Marketplace', ([deployer, seller, buyer]) => {
    let marketplace;

    before(async () => {
        marketplace = await Marketplace.deployed();
    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await marketplace.address;
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        });

        it('has a name', async () => {
            const name = await marketplace.name();
            assert.equal(name, 'Deska Market')
        });
    });

    describe('Products', async () => {
        let result, productCount;

        before(async () => {
            result = await marketplace.createProduct('Iphone 11 Pro', web3.utils.toWei('1', 'ether'), { from: seller });
            productCount = await marketplace.productCount();
        });

        it('creates a product', async () => {
            // SUCCESS
            assert.equal(productCount, 1);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct');
            assert.equal(event.name, 'Iphone 11 Pro', 'name is correct');
            assert.equal(event.price, '1000000000000000000', 'price is correct');
            assert.equal(event.owner, seller, 'owner is correct');
            assert.equal(event.purchased, false, 'purchased is correct');

            // FAILURE: Product must have a name
            //await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
            // FAILURE: Product must have a price
            //await await marketplace.createProduct('iPhone X', 0, { from: seller }).should.be.rejected;
        });
        it('should not create a product', async () => {
            // FAILURE: Product must have a name
            await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
            // FAILURE: Product must have a price
            await await marketplace.createProduct('iPhone X', 0, { from: seller }).should.be.rejected;
        });
        it('sells a product', async () => {

            let oldSellerBalance = await web3.eth.getBalance(seller);
            oldSellerBalance = new web3.utils.BN(oldSellerBalance);

            // SUCCESS: Buyer makes purchase
            result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'ether') });

            // check logs
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'Id is correct');
            assert.equal(event.name, 'Iphone 11 Pro', 'name is correct');
            assert.equal(event.price, '1000000000000000000', 'price is correct');
            assert.equal(event.owner, buyer, 'owner is correct');
            assert.equal(event.purchased, true, 'purchased is correct');

            // Check that seller received funds
            let newSellerBallance = await web3.eth.getBalance(seller);
            newSellerBallance = new web3.utils.BN(newSellerBallance);

            let price;
            price = web3.utils.toWei('1', 'ether');
            price = new web3.utils.BN(price);

            const expectedBalance = oldSellerBalance.add(price);

            assert.equal(newSellerBallance.toString(), expectedBalance.toString());
        });
        it('should not sell products', async () => {
            // FAILURE: Tries to buy a product that does not exist, i.e., product must have valid id
            await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
            // FAILURE: Buyer tries to buy without enough ether
            await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
            // FAILURE: Deployer tries to buy the product, i.e., product can't be purchased twice
            await marketplace.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
            // FAILURE: Buyer tries to buy again, i.e., buyer can't be the seller
            await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        });
    });
});
