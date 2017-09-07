import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import { HashRouter, Route } from 'react-router-dom';

import './main.css';

import { WEB_ROOT, IS_DEBUG } from './config';

import axios from 'axios';

import GridList from 'zele-react/dist/components/Grid/GridList'; 
import ImageItem from 'zele-react/dist/components/ImageItem'; 
import SvgIcon from 'zele-react/dist/components/SvgIcon'; 
import IconButton from 'zele-react/dist/components/Button/IconButton'; 

import { lighten } from './ZUtils/colorManipulator';

import main3d from './index';

import GetCurrentDataString from './ZUtils/GetCurrentDataString';


let productInfoUrl = `${WEB_ROOT}assets/productInfo.json`;
if(IS_DEBUG) {
	productInfoUrl += `?${GetCurrentDataString()}`;
}

const gBaseColor = '#e4d09a';
const gActiveColor = '#ff9000';
const gLineColor = '#888888';

const searchSvgPath = <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />;

axios.get(productInfoUrl).then((res) => {

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

			const mcols = 2;
			const itemElements = products.map((item, index) => {
				const bCount = (Math.ceil(data.length / mcols) - 1) * mcols - 1;
				const marginBottom = index > bCount ? 0 : 10;
				return <div key={index} style={{marginBottom: marginBottom}}>
					<ImageItem active={index === this.state.activeId ? true : false} activeColor={gActiveColor} img={item.image} title={item.name} defaultBorderColor='rgba(0, 0, 0, 0.1)' onClick={(e, title) => {
						this.setState({activeId: index});
						if(onItemClick) {
							onItemClick(e, title, index);
						}
					}}/>
				</div>;
			});

			return <GridList cols={mcols}>{itemElements}</GridList>;
		}
	}

	class IndexPage extends Component {
		constructor(props) {
			super(props);
			this.state = {
				activeButtonId: -1,
				activePid: -1,
				searchResultPlaneOpen: false, 
				searchResultDatas: [],
				searchValue: '',
			};
		}

		componentWillMount() {
			console.log(this.props.match.params);
			for(let i = 0, l = data.length; i < l; i ++ ) {
				let each = data[i];
				if(i == this.props.match.params.caseID) {
					this.setState({activePid: i, searchValue: each.name});
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
							this.setState({activeButtonId: index, searchResultPlaneOpen: false});
						}
					}}>{item}</div>;
				});

				let popupConentElement = '';

				if(this.state.activeButtonId === 0) {
					popupConentElement = <ProductList onItemClick={(e, title, index) => {
						if(this.state.activePid === index) {
							return;
						}
						this.setState({activePid: index, activeButtonId: -1, searchValue: data[index].name});
						window.location.href = '#/' + index;
						main3d(this.canvas, data[index].project);
					}} products={data} activeId={this.state.activePid}/>
				} else if(this.state.activeButtonId === 1) {
					popupConentElement = data[this.state.activePid].introduce;
				} else if(this.state.activeButtonId === 2) {
					popupConentElement = 'about';
				}

				const inputHeight = 34, inputHalfHeight = inputHeight / 2, mcols = 2;

				const searchResultElementChildren = this.state.searchResultDatas.map((item, index) => {
					const bCount = (Math.ceil(this.state.searchResultDatas.length / mcols) - 1) * mcols - 1;
					// console.log(bCount);
					const marginBottom = index > bCount ? 0 : 10;
					return <div key={index} style={{marginBottom: marginBottom}}>
						<ImageItem active={item.cid === this.state.activePid ? true : false} activeColor={gActiveColor} img={item.image} title={item.name} defaultBorderColor='rgba(0, 0, 0, 0.1)' onClick={(e, title) => {
							if(item.cid === this.state.activePid) {
								return;
							}
							this.setState({searchResultPlaneOpen: false, searchValue: item.name, activePid: item.cid});
							window.location.href = '#/' + item.cid;
							main3d(this.canvas, item.project);
						}}/>
					</div>
				});

				const searchResultElement = searchResultElementChildren.length > 0 
					? <GridList>{searchResultElementChildren}</GridList>
					: <div style={{textAlign: 'center'}}>没有发现结果</div>;

				resultElement = <div>
					<div id='jxzy-product-title'>3D江西中医药饮片</div>
					<div id='jxzy-search-group'>
						<input type='text' style={{
							borderColor: gLineColor,
							borderStyle: 'solid',
							borderWidth: 1,
							borderTopLeftRadius: inputHalfHeight,
							borderTopRightRadius: inputHalfHeight,
							borderBottomLeftRadius: this.state.searchResultPlaneOpen ? 0 : inputHalfHeight,
							borderBottomRightRadius: this.state.searchResultPlaneOpen ? 0 : inputHalfHeight
						}} onChange={e => {
							this.setState({searchValue: e.target.value, searchResultPlaneOpen: false});
						}} value={this.state.searchValue} id='jxzy-search-input'/>
						<div style={{
							position: 'absolute',
							top: 0,
							right: 0
						}}><IconButton color={gActiveColor} icon={<SvgIcon>{searchSvgPath}</SvgIcon>} onClick={e => {
							let sData = [];
							for(let i = 0, l = data.length; i < l; i ++) {
								let each = data[i];
								// console.log(each.name, each.name.indexOf(this.state.searchValue));
								if(each.name.indexOf(this.state.searchValue) !== -1) {
									sData.push(Object.assign({}, each, {cid: i}));
								}
							}
							this.setState({
								activeButtonId: -1,
								searchResultPlaneOpen: !this.state.searchResultPlaneOpen, 
								searchResultDatas: sData
							});
						}}/></div>
						<div style={{
							display: this.state.searchResultPlaneOpen ? 'block' : 'none',
							boxSizing: 'border-box',
							borderColor: gLineColor,
							borderStyle: 'solid',
							borderWidth: 1,
							borderTopWidth: 0,
							width: '100%',
							padding: 10,
							borderBottomLeftRadius: inputHalfHeight,
							borderBottomRightRadius: inputHalfHeight,
							position: 'absolute',
							top: inputHeight,
							zIndex: 3
						}}>
							<div style={{
								maxHeight: 400,
								overflow: 'auto',
							}}>{searchResultElement}</div>
						</div>
					</div>
					<div id='jxzy-editor'>
						<div id='jxzy-logo'>
							<img src={`${WEB_ROOT}assets/icons/logo.png`} />
						</div>
						<canvas id='jxzy-viewport'></canvas>
					</div>
					<div id='jxzy-footer'>
						<div className='jxzy-row-parent' style={{overflow: 'hidden'}}>
							<GridList cols={3} gutter={20}>{buttonElements}</GridList>
						</div>
					</div>
					<div className='jxzy-popup-parent' style={{
						backgroundColor: lighten(gBaseColor, 0.5),
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
			<Route exact path='/:caseID' component={IndexPage} />
		</div>
	}

	ReactDOM.render(<HashRouter>
		<App />
	</HashRouter>, document.getElementById('app'));

}).catch(e => console.log(e));