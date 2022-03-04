class HD {
  static PENDING = "pending";
  static FULLFILLED = "fullfilled";
  static REJECTED = "rejected";
  constructor(excutor) {
    try {
      this.status = HD.PENDING;
      this.value = null;
      this.callbacks = [];
      excutor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }
  resolve(value) {
    if (this.status === HD.PENDING) {
      setTimeout(() => {
        this.status = HD.FULLFILLED;
        this.value = value;
        if (this.callbacks.length > 0) {
          this.callbacks.forEach((callback) => {
            callback.onFullFilled(value);
          });
        }
      });
    }
  }
  reject(reason) {
    if (this.status === HD.PENDING) {
      setTimeout(() => {
        this.status = HD.REJECTED;
        this.value = reason;
        if (this.callbacks.length > 0) {
          this.callbacks.forEach((callback) => {
            callback.onRejected(reason);
          });
        }
      });
    }
  }
  then(onFullFilled, onRejected) {
    return new Promise((resolve, reject) => {
      if (typeof onFullFilled !== "function") {
        onFullFilled = () => this.value;
      }
      if (typeof onRejected !== "function") {
        onRejected = (reason) => {
          throw reason;
        };
      }
      if (this.status === HD.FULLFILLED) {
        console.log();
        setTimeout(() => {
          this.resolvePromise(onFullFilled(this.value), resolve, reject);
        });
      }
      if (this.status === HD.REJECTED) {
        setTimeout(() => {
          this.resolvePromise(onRejected(this.value), resolve, reject);
        });
      }
      if (this.status === HD.PENDING) {
        this.callbacks.push({
          onFullFilled: (value) => {
            this.resolvePromise(onFullFilled(value), resolve, reject);
          },
          onRejected: (reason) => {
            this.resolvePromise(onRejected(reason), resolve, reject);
          },
        });
      }
    });
  }
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  resolvePromise(result, resolve, reject) {
    try {
      if (result instanceof HD) {
        result.then(resolve, reject);
      } else {
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  }
  static resolve(value) {
    return new HD((resolve, reject) => {
      if (value instanceof HD) {
        value.then(resolve, reject);
      } else {
        resolve(value);
      }
    });
  }
  static reject(reason) {
    return new HD((resolve, reject) => {
      if (reason instanceof HD) {
        reason.then(resolve, reject);
      } else {
        reject(reason);
      }
    });
  }
  static all(promises) {
    return new HD((resolve, reject) => {
      const resolves = [];
      promises.forEach((promise) => {
        promise.then(
          (value) => {
            resolves.push(value);
            if (resolves.length === promises.length) {
              resolve(resolves);
            }
          },
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  }
  static race(promises) {
    return new Promise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then(
          (value) => {
            resolve(value);
          },
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  }
}
