import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import { HashRouter, Route } from 'react-router-dom';

import './main.css';

import { WEB_ROOT } from './config';

import axios from 'axios';

import GridList from 'zele-react/dist/components/Grid/GridList'; 
import ImageItem from 'zele-react/dist/components/ImageItem'; 

console.log(GridList);

const ShowState = {
	NONE: 0,
	CATALOG: 1,
	INTRODUCE: 2,
	ABOUT: 3
};

axios.get(`${WEB_ROOT}assets/productInfo.json`).then((res) => {

	const data = res.data;

	class ProductList extends Component {
		constructor(props) {
			super(props);

			this.state = {
				activeId: -1
			}
		}

		static propTypes = {
			products: PropTypes.array
		};

		static defaultProps = {
			products: []
		};

		render() {
			const { products } = this.props;

			const itemElements = products.map((item, index) => {
				return <div key={index} style={{marginBottom: 10}}>
					<ImageItem img={item.image} title={item.name} defaultBorderColor='rgba(0, 0, 0, 0.1)'/>
				</div>;
			});

			return <GridList>{itemElements}</GridList>;
		}
	}

	class IndexPage extends Component {
		constructor(props) {
			super(props);
			this.state = {
				showState: ShowState.NONE,
				activeButtonId: -1
			};

			this.caseInfo = null;

			for(let each of data) {
				if(each.name === this.props.match.params.caseName) {
					this.caseInfo = each;
					break;
				}
			}
		}

		render() {
			let resultElement = <div>没有发现该产品</div>;

			if(this.caseInfo) {

				const buttonNames = ['目录', '介绍', '关于'];

				const buttonElements = buttonNames.map((item, index) => {
					return <div key={index} className='jxzy-btn' style={{
						backgroundColor: this.state.activeButtonId === index ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0)'
					}} onClick={(e) => {
						if(index === this.state.activeButtonId) {
							this.setState({activeButtonId: -1});
						} else {
							this.setState({activeButtonId: index});
						}
					}}>{item}</div>;
				});

				let popupConentElement = '';

				if(this.state.activeButtonId === 0) {
					popupConentElement = <ProductList products={data}/>
				} else if(this.state.activeButtonId === 1) {
					popupConentElement = this.caseInfo.introduce;
				} else if(this.state.activeButtonId === 2) {
					popupConentElement = 'about';
				}

				resultElement = <div>
					<div id='jxzy-product-title'>3D江西中医药饮片</div>
					<div id='jxzy-search-group'>
						<input type='text' defaultValue='人参' id='jxzy-search-input' />
					</div>
					<div id='jxzy-editor'>
						<canvas id='jxzy-viewport'></canvas>
					</div>
					<div id='jxzy-footer'>
						<div className='jxzy-row-parent' style={{overflow: 'hidden'}}>
							<GridList cols={3}>{buttonElements}</GridList>
						</div>
					</div>
					<div className='jxzy-popup-parent' style={{
						display: this.state.activeButtonId !== -1 ? 'block' : 'none'
					}}>
						<div className='jxzy-popup'>{popupConentElement}</div>
					</div>
				</div>;
			}

			return resultElement;
		}
	}

	let App = (props) => {
		return <div>
			<Route exact path='/:caseName' component={IndexPage} />
		</div>
	}

	ReactDOM.render(<HashRouter>
		<App />
	</HashRouter>, document.getElementById('app'));

}).catch(e => console.log(e));