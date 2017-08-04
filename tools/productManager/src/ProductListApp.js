import React, { Component } from 'react';

import EditProduct from './EditProduct';

import { Button, Layout, Card, MessageBox, Message, Notification } from 'element-react';

import axios from 'axios';

import 'element-theme-default';

const CName = {
	NAME: '名称',
	INTRODUCE: '介绍',
	IMAGE_PATH: '图片路径',
	PROJECT_PATH: '工程文件路径'
};

class ProductApp extends Component {
	constructor(props) {
		super(props);

		this.state = {
			editDialogVisible: false,
			editDialogTitle: '',
			editDialogDatas: [],
			productsData: []
		};

		axios.get('../../../assets/productInfo.json').then((response) => {
			// console.log(response.data);
			this.setState({productsData: response.data});
		}).catch((error) => {
			console.log(error);
		});

		this.MIndex = -1;
	}
	renderProducts() {
		const row = 8, gutter = 10;
		const span = 24 / row;

		let result = this.state.productsData.map((item, index) => {
			let productName = item.name;
			let productElement = <Layout.Col span={ span } key={`card_${productName}_${index}`}>
				<div style={{margin: `${gutter/2}px 0`}}><Card bodyStyle={{ padding: 0}}>
					<div style={{
						width: '100%',
						height: '200px',
						background: '#eee',
						backgroundImage: `url(${item.image})`,
						backgroundPosition: 'center enter',
						backgroundSize: 'cover'
					}}></div>
					<div style={{ padding: 14 }}>
						<h3>{productName}</h3>
						<div className="bottom clearfix"><Button.Group>
							<Button type="primary" icon="edit" size="small" onClick={e => {
								this.setState({
									editDialogVisible: true, 
									editDialogTitle: `编辑  ${productName} `,
									editDialogDatas: [{
										name: CName.NAME,
										value: productName,
										type: 0
									}, {
										name: CName.INTRODUCE,
										value: item.introduce,
										type: 1
									}, {
										name: CName.IMAGE_PATH,
										value: item.image,
										type: 2
									}, {
										name: CName.PROJECT_PATH,
										value: item.project,
										type: 2
									}]
								});
								this.MIndex = index;
							}}>编辑</Button>
							<Button type="danger" icon="delete" size="small" onClick={e => {
								MessageBox.confirm(`此操作将永久删除 ${productName} 文件, 是否继续?`, '提示', {
									type: 'warning'
								}).then(() => {
									Message({
										type: 'success',
										message: '删除成功!'
									});
								}).catch(() => {
									Message({
										type: 'info',
										message: '已取消删除'
									});
								});
							}}>删除</Button>
						</Button.Group></div>
					</div>
				</Card></div>
			</Layout.Col>;
			return productElement;
		});

		return <Layout.Row gutter={gutter}>{result}</Layout.Row>;
	}

	render() {
		const { editDialogVisible, editDialogTitle, editDialogDatas, productsData } = this.state;

		return <div>
			<EditProduct visible={editDialogVisible} title={editDialogTitle} datas={editDialogDatas} onCancel={e => {
				this.setState({editDialogVisible: false});
			}} onConfirm={(e, datas) => {
				console.log(datas);
				// let isExistName = false, existName = '';
				// for(let data of datas) {
				// 	if(data.name === '名称') {
				// 		if(productsData[data.value] !== undefined) {
				// 			isExistName = true;
				// 			existName = data.value;
				// 		}
				// 	} else {
				// 		break;
				// 	}
				// }

				// if(isExistName) {
				// 	Notification.error({
				// 		title: '错误',
				// 		message: `${existName}已经存在，请换一个名字试试！`
				// 	});
				// } else {
					
				// }
				let newData = {};
				for(let data of datas) {
					switch(data.name) {
						case CName.NAME:
							newData['name'] = data.value;
							break;
						case CName.INTRODUCE:
							newData['introduce'] = data.value;
							break;
						case CName.IMAGE_PATH:
							newData['image'] = data.value;
							break;
						case CName.PROJECT_PATH:
							newData['project'] = data.value;
							break;
					}
					
				}

				let newProductsData = this.state.productsData;

				if(this.MIndex >= 0) {
					newProductsData[this.MIndex] = newData;
				} else {
					newProductsData.push(newData);
				}

				this.setState({productsData: newProductsData});
			}}/>
			<Button type="primary" icon="plus" size="small" onClick={e => {
				this.setState({
					editDialogVisible: true, 
					editDialogTitle: '添加产品',
					editDialogDatas: [{
						name: CName.NAME,
						value: '',
						type: 0
					}, {
						name:  CName.INTRODUCE,
						value: '',
						type: 1
					}, {
						name:  CName.IMAGE_PATH,
						value: '',
						type: 2
					}, {
						name:  CName.PROJECT_PATH,
						value: '',
						type: 2
					}]
				});
				this.MIndex = -1;
			}}>添加</Button>
			{this.renderProducts()}
		</div>;
	}
}

export default ProductApp;