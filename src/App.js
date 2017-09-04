import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import { HashRouter, Route } from 'react-router-dom';

import './main.css';

import { WEB_ROOT } from './config';

import axios from 'axios';

import GridList from 'zele-react/dist/components/Grid/GridList'; 
import ImageItem from 'zele-react/dist/components/ImageItem'; 

import main3d from './index';

axios.get(`${WEB_ROOT}assets/productInfo.json`).then((res) => {

	const data = res.data;

	class ProductList extends Component {
		constructor(props) {
			super(props);

			this.state = {
				activeId: props.activeId
			}
		}

		static propTypes = {
			products: PropTypes.array,
			activeId: PropTypes.number,
			onItemClick: PropTypes.func
		};

		static defaultProps = {
			products: [],
			activeId: -1
		};

		render() {
			const { products, onItemClick } = this.props;

			const itemElements = products.map((item, index) => {
				return <div key={index} style={{marginBottom: 10}}>
					<ImageItem active={index === this.state.activeId ? true : false} activeColor='#ff9000' img={item.image} title={item.name} defaultBorderColor='rgba(0, 0, 0, 0.1)' onClick={(e, title) => {
						this.setState({activeId: index});
						if(onItemClick) {
							onItemClick(e, title, index);
						}
					}}/>
				</div>;
			});

			return <GridList>{itemElements}</GridList>;
		}
	}

	class IndexPage extends Component {
		constructor(props) {
			super(props);
			this.state = {
				activeButtonId: -1,
				activePid: -1
			};
		}

		componentWillMount() {
			for(let i = 0, l = data.length; i < l; i ++ ) {
				let each = data[i];
				if(each.name === this.props.match.params.caseName) {
					this.setState({activePid: i});
					break;
				}
			}
		}

		componentDidMount() {
			this.canvas = document.getElementById('jxzy-viewport');
			main3d(this.canvas, data[this.state.activePid].project);
		}

		render() {

			let resultElement = <div>没有发现该产品</div>;

			if(this.state.activePid !== -1) {

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
					popupConentElement = <ProductList onItemClick={(e, title, index) => {
						this.setState({activePid: index, activeButtonId: -1});
						window.location.href = '#/' + title;
						main3d(this.canvas, data[index].project);
					}} products={data} activeId={this.state.activePid}/>
				} else if(this.state.activeButtonId === 1) {
					popupConentElement = data[this.state.activePid].introduce;
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
							<GridList cols={3} gutter={20}>{buttonElements}</GridList>
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