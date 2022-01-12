class Promise {
	constructor(handler) {
		//console.log(' > Promise contructed');
		this.status = 'pending'; // pending -> fulfilled or rejected
		this.onFulfilledCallbacks = []; // 여러개의 then 호출을 처리하기 위함
		this.onRejectedCallbacks = [];

		const resolve = (value) => {
			//console.log('---> resolve is called, value: ', value);
			if (this.status === 'pending') {
				this.status = 'fulfilled';
				this.value = value;
				this.onFulfilledCallbacks.forEach((fn) => fn(value));
			}
		};

		const reject = (value) => {
			//console.log('---> reject is called, value: ', value);
			if (this.status === 'pending') {
				this.status = 'rejected';
				this.value = value;
				this.onRejectedCallbacks.forEach((fn) => fn(value));
			}
		};

		try {
			handler(resolve, reject);
		} catch (err) {
			reject(err);
		}
	}

	then(onFulfilled, onRejected) {
		// 성공/실패 했을때의 callback함수를 처리하는 파트, value로 값을 넘겨준다.
		// then chaining을 처리하기 위해 new Promise를 넘겨줌
		return new Promise((resolve, reject) => {
			//console.log(
			//	'Inner Promise callback function is called: pushed onFulfilled callback'
			//);
			if (this.status === 'pending') {
				this.onFulfilledCallbacks.push(() => {
					try {
						const fulfilledFromLastPromise = onFulfilled(this.value);
						//console.log(
						//	'-> pushed func is called, fulfilledFromLastPromise: ',
						//	fulfilledFromLastPromise
						//);
						if (fulfilledFromLastPromise instanceof Promise) {
							fulfilledFromLastPromise.then(resolve, reject);
						} else {
							resolve(fulfilledFromLastPromise);
						}
					} catch (err) {
						reject(err);
					}
				});
				this.onRejectedCallbacks.push(() => {
					try {
						const rejectedFromLastPromise = onRejected(this.value);
						if (rejectedFromLastPromise instanceof Promise) {
							fulfilledFromLastPromise.then(resolve, reject);
						} else {
							reject(rejectedFromLastPromise);
						}
					} catch (err) {
						reject(err);
					}
				});
			}

			if (this.status === 'fulfilled') {
				//console.log('Promise is fulfilled');
				try {
					const fulfilledFromLastPromise = onFulfilled(this.value);
					if (fulfilledFromLastPromise instanceof Promise) {
						fulfilledFromLastPromise.then(resolve, reject);
					} else {
						resolve(fulfilledFromLastPromise);
					}
				} catch (err) {
					reject(err);
				}
			}

			if (this.status === 'rejected') {
				//console.log('Promise is rejected, ', onRejected);
				if (!onRejected) reject(this.value);
				try {
					const rejectedFromLastPromise = onRejected(this.value);
					if (fulfilledFromLastPromise instanceof Promise) {
						fulfilledFromLastPromise.then(resolve, reject);
					} else {
						reject(rejectedFromLastPromise);
					}
				} catch (err) {
					reject(err);
				}
			}
		});
	}

	catch(onRejected) {
		return new Promise((resolve, reject) => {
			if (this.status === 'pending') {
				//console.log('Promise is pending');
				this.onRejectedCallbacks.push(() => {
					try {
						const rejectedFromLastPromise = onRejected(this.value);
						if (rejectedFromLastPromise instanceof Promise) {
							fulfilledFromLastPromise.then(resolve, reject);
						} else {
							reject(rejectedFromLastPromise);
						}
					} catch (err) {
						reject(err);
					}
				});
			}
			if (this.status === 'rejected') {
				//console.log('Promise is rejected');
				try {
					const rejectedFromLastPromise = onRejected(this.value);
					if (rejectedFromLastPromise instanceof Promise) {
						fulfilledFromLastPromise.then(resolve, reject);
					} else {
						reject(rejectedFromLastPromise);
					}
				} catch (err) {
					reject(err);
				}
			}
		});
	}

	finally(onFinally) {
		return Promise.resolve(onFinally());
	}
}

Promise.resolve = function (value) {
	if (value instanceof Promise) {
		return value;
	} else {
		return new Promise((resolve, reject) => {
			resolve(value);
		});
	}
};

Promise.reject = function (reason) {
	return new Promise((resolve, reject) => reject(reason));
};

Promise.all = function (promises) {
	return new Promise((resolve, reject) => {
		let counter = 0;
		const result = [];
		for (let i = 0; i < promises.length; i++) {
			Promise.resolve(promises[i]).then(
				(res) => {
					result[i] = res;
					counter++;
					if (counter === promises.length) {
						resolve(result);
					}
				},
				(rej) => {
					reject(rej);
				}
			);
		}
	});
};

function checkRandom() {
	return new Promise((resolve, reject) => {
		if (Math.random() > 0.5) {
			resolve('Success');
		} else {
			reject(new Error('Failed'));
		}
	});
}

checkRandom()
	.then((rst) => {
		console.log(rst);
		return checkRandom();
	})
	.then((rst) => {
		console.log(rst);
	})
	.catch((err) => {
		console.error(err);
	})
	.finally(() => {
		console.log('Completed');
	});

const promise1 = Promise.resolve(3);
const promise2 = 15;
const promise3 = new Promise((resolve, reject) => {
	setTimeout(resolve, 1000, 'foo');
});

const newPromise = Promise.all([promise1, promise2, promise3]).then(
	(values) => {
		console.log(values);
	}
);
