import React, { Component } from 'react';
import bson from 'bson';
import { Stitch, RemoteMongoClient } from 'mongodb-stitch-browser-sdk';

import Products from '../../components/Products/Products';

class ProductsPage extends Component {
  state = { isLoading: true, products: [] };
  componentDidMount() {
    this.fetchData();
  }

  productDeleteHandler = (productId) => {
    const mongodb = Stitch.defaultAppClient.getServiceClient(
      RemoteMongoClient.factory,
      'mongodb-atlas'
    );
    mongodb
      .db('shop')
      .collection('products')
      .deleteOne({ _id: new bson.ObjectId(productId) })
      .then(() => {
        this.fetchData();
      })
      .catch((err) => {
        this.props.onError(
          'Deleting the products failed. Please try again later'
        );
        this.setState({ isLoading: false });
        console.log(err);
      });
  };

  fetchData = () => {
    const mongodb = Stitch.defaultAppClient.getServiceClient(
      RemoteMongoClient.factory,
      'mongodb-atlas'
    );
    mongodb
      .db('shop')
      .collection('products')
      .find()
      .asArray()
      .then((products) => {
        const transformedProducts = products.map((product) => {
          product._id = product._id.toString();
          product.price = product.price.toString();
          return product;
        });
        this.setState({ isLoading: false, products: transformedProducts });
      })
      .catch((err) => {
        this.props.onError(
          'Fetching the products failed. Please try again later'
        );
        this.setState({ isLoading: false });
        console.log(err);
      });
  };

  render() {
    let content = <p>Loading products...</p>;

    if (!this.state.isLoading && this.state.products.length > 0) {
      content = (
        <Products
          products={this.state.products}
          onDeleteProduct={this.productDeleteHandler}
        />
      );
    }
    if (!this.state.isLoading && this.state.products.length === 0) {
      content = <p>Found no products. Try again later.</p>;
    }
    return <main>{content}</main>;
  }
}

export default ProductsPage;
