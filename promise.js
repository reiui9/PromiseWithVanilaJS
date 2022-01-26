class Promise {
	constructor(handler) {
		this.status = 'pending';
		this.onFulfilledCallbacks = [];
		this.onRejectedCallbacks = [];

		const resolve = (value) => {
			console.log('Promise Resolve called ', this.status, value);
			if (this.status === 'pending') {
				this.status = 'fulfilled';
				this.value = value;
				this.onFulfilledCallbacks.forEach((fn) => fn(value));
			}
		};

		const reject = (value) => {
			console.log('Promise Reject called ', this.status, value);
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
		return new Promise((resolve, reject) => {
			console.log('Then handler is registered');
			if (this.status === 'pending') {
				this.onFulfilledCallbacks.push(() => {
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
			console.log('Catch handler is registered');
			if (this.status === 'pending') {
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

// testing code 1

// testing code
//const p3 = new Promise((resolve, reject) => {
//	setTimeout(() => resolve('resolved!'), 1000);
//});
//p3.then(
//	(res) => {
//		console.log(res);
//	},
//	(err) => {
//		console.log(err);
//	}
//);

// 'p1 resolved!'
// 'p2 rejected!'

// testing code 2

//const p1 = new Promise((resolve, reject) => {
//	setTimeout(() => resolve('resolved first one'), 1000);
//});

//p1.then((res) => {
//	console.log(res);
//	return new Promise((resolve) => {
//		setTimeout(() => resolve('resolved second one'), 1000);
//	});
//}).then((res) => {
//	console.log(res);
//});

// ideally, it should
// 1 sec later, log 'resolved first one'
// 1 sec later, log 'resolved second one'

// testing code 3

function checkRandom() {
	return new Promise((resolve, reject) => {
		console.log('handler 1 is registered');
		setTimeout(() => {
			if (Math.random() > 0.5) {
				resolve('Success');
			} else {
				reject(new Error('Failed'));
			}
		}, 500);
	});
}

checkRandom()
	//.then((rst) => {
	//	console.log(rst);
	//	return checkRandom();
	//})
	.then((rst) => {
		console.log('Then is called ', rst);
		return 'resolve then';
	})
	.catch((err) => {
		console.error('Catch is called ', err);
		return 'resolve catch';
	});
//.finally(() => {
//	console.log('Completed');
//});

//const promise1 = Promise.resolve(3);
//const promise2 = 15;
//const promise3 = new Promise((resolve, reject) => {
//	setTimeout(resolve, 1000, 'foo');
//});

//const newPromise = Promise.all([promise1, promise2, promise3]).then(
//	(values) => {
//		console.log(values);
//	}
//);
