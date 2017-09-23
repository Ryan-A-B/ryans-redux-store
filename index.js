class Store {
    constructor (reducer, mapStorageToState, mapStateToStorage) {
        this._store = Redux.createStore(reducer, this.load(mapStorageToState));
        this._queue = [];
        this.state = this._store.getState();

        this.dispatch = this.dispatch.bind(this);
        this.queue = this.queue.bind(this);
        this.mapStateToStorage = mapStateToStorage;

        this._store.subscribe(this.listener.bind(this));
    }

    dispatch (action) {
        this._store.dispatch(action);
    }

    subscribe (fn) {
        this._store.subscribe(fn);
    }

    queue (test, action) {
        if (test(this.state)) {
            action(this.state);
        } else {
            this._queue.push({test, action});
        }
    }

    listener (...args) {
        this.state = this._store.getState();
        this.save(this.state);

        for (let i = 0; i < this._queue.length; i++) {
            let item = this._queue[i];

            if (item.test(this.state)) {
                this._queue.splice(i, 1);
                item.action(this.state);
            }
        }
    }

    save (state) {
        try {
            const serialisedState = JSON.stringify(this.mapStateToStorage(state));
            localStorage.setItem('state', serialisedState);
        } catch (err) {
            // Ignore write error
        }
    }

    load (mapStorageToState) {
        try {
            const serialisedState = localStorage.getItem('state');

            if (serialisedState === null) {
                return undefined;
            }

            return mapStorageToState(JSON.parse(serialisedState));
        } catch (err) {
            return undefined;
        }
    }
}

export default Store;
