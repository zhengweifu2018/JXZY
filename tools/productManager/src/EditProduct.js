import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { Dialog, Form, Button, Input } from 'element-react';

import 'element-theme-default';

// const { dialog } = require('electron').remote;
const ipc = require('electron').remote;
// const fs = require('fs');

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'bmp'];

function getFileExtension(fileName) {
	const ext = /^.+\.([^.]+)$/.exec(fileName);
	return ext == null ? '' : ext[1];
};

class EditProduct extends Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: props.visible,
			datas: props.datas
		}
	}

	static propTypes = {
		visible: PropTypes.bool,
		title: PropTypes.string,
		datas: PropTypes.array,
		onCancel: PropTypes.func,
		onConfirm: PropTypes.func
	};

	static defaultProps = {
		visible: true,
		datas: [],
		title: '添加产品'
	};

	componentWillReceiveProps(newProps) {
        if(newProps.visible !== undefined) {
            this.setState({
                visible: newProps.visible
            });
        }

        if(newProps.datas !== undefined) {
        	this.setState({
                datas: newProps.datas
            });
        }
    }

    renderItems() {
    	return this.state.datas.map((item, index) => {
    		let childEle;
    		switch(item.type) {
    			case 0:
    				childEle = <Input value={item['value']} onChange={val => {
    					let newDatas = this.state.datas;
    					newDatas[index]['value'] = val;
    					this.setState({datas: newDatas});
    				}} />;
    				break;
    			case 1:
    				childEle = <Input type='textarea' value={item['value']} onChange={val => {
    					let newDatas = this.state.datas;
    					newDatas[index]['value'] = val;
    					this.setState({datas: newDatas});
    				}} />;
    				break;
    			case 2:
    				childEle = <Input value={item['value']}append={<Button type="primary" onClick={() => {
    					// this.MUpload.click();
    					console.log(ipc);
    				}}>浏览</Button>} />;
    				break;	
    			default:
    				childEle = <Input value={item['value']}></Input>;
    				break;
    		}
    		 
    		return <Form.Item label={item.name} key={index}>{childEle}</Form.Item>
    	});
    }

	render() {
		const { title, onConfirm, onCancel } = this.props;
		return <div>
			<input type='file' ref={ref => this.MUpload = ref} style={{display: 'none'}} onChange={e => {
	            const mFile = e.target.files[0];
	            const mExt = getFileExtension(mFile.name).toLowerCase();
	            const mIndex = IMAGE_EXT.findIndex(item => item === mExt);
	            if(mIndex === -1) {
	                alert('上传文件格式只支持: ' + IMAGE_EXT.toString());
	                return;
	            }
	            console.log(mFile.path);
	            // OpenFile(mFile, data => {
	                // let tImage = new Image();
	                // tImage.onload = (e) => {
	                //     if(tImage.width <= viewport2dWidth && tImage.height <= viewport2dHeight) {
	                //         this.props.brush.importImage(data); 
	                //     } else {
	                //         this.props.brush.importImage(SetImageSize(tImage, viewport2dWidth, viewport2dHeight));
	                //     }
	                // };
	                // tImage.src = data;
	                
	            // });
	        }}/>
			<Dialog
				title={title}
				visible={ this.state.visible }
				onCancel={ (e) => {
					this.setState({ visible: false });
					if(onCancel) onCancel(e);
				}}>
				<Dialog.Body>
					<Form>
						{this.renderItems()}
						<Form.Item>
							<Button type="primary" onClick={e => {
								if(onConfirm) onConfirm(e, this.state.datas);
							}}>提交</Button>
						</Form.Item>
					</Form>
				</Dialog.Body>
			</Dialog>
		</div>;
	}
}

export default EditProduct;