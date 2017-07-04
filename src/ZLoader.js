/**
 * three.js website Loader by fun.zheng
 */

export default class ZLoader {
	load( url, onLoad, onProgress, onError ) {

		if ( this.path !== undefined ) {
			url = this.path + url;
		}

		let request = new XMLHttpRequest();
		request.overrideMimeType( 'text/plain' );
		request.open( 'GET', url, true );

		request.addEventListener( 'load', function ( event ) {

			let response = event.target.response;

			if ( this.status === 200 ) {

				if ( onLoad ) {
					onLoad( response );
				}

			} else if ( this.status === 0 ) {

				// Some browsers return HTTP Status 0 when using non-http protocol
				// e.g. 'file://' or 'data://'. Handle as success.

				console.warn( 'THREE.XHRLoader: HTTP Status 0 received.' );

				if ( onLoad ) {
					onLoad( response );
				}

			} else {

				if ( onError ) {
					onError( event );
				}
			}

		}, false );

		if ( onProgress !== undefined ) {

			request.addEventListener( 'progress', function ( event ) {

				onProgress( event );

			}, false );

		}

		request.addEventListener( 'error', function ( event ) {

			if ( onError ) {
				onError( event );
			}

		}, false );

		if ( this.responseType !== undefined ) {
			request.responseType = this.responseType;
		}

		if ( this.withCredentials !== undefined ) {
			request.withCredentials = this.withCredentials;
		}

		request.send( null );

		return request;

	}

	setPath ( value ) {

		this.path = value;

	}

	setResponseType ( value ) {

		this.responseType = value;

	}

	setWithCredentials ( value ) {

		this.withCredentials = value;

	}
}
