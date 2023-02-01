export const server = {
  subscribers: { },

  subscribe(event, cb) {
    if (!(event in this.subscribers)) {
      this.subscribers[event] = [];
    }

    this.subscribers[event].push(cb);
  },

  unsubscribe(event, cb) {
    if (!(event in this.subscribers)) {
      return;
    }

    let i = this.subscribers[event].indexOf(cb);

    if (i > -1) {
      this.subscribers[event].splice(i, 1);
    }
  },

  emit(event, data) {
    if (event in this.subscribers) {
      for (let cb of this.subscribers[event]) {
        cb(data)
      }
    }
  },

  reset() {
    this.subscribers = { };
  }
};

export const io = () => ({
  connect: () => { },

  on: (event, cb) => {
    server.subscribe(event, cb);
  },

  off: (event, cb) => {
    server.unsubscribe(event, cb);
  },

  emit: () => { }
});
