'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Store = function () {
    function Store(reducer, mapStorageToState, mapStateToStorage) {
        var _Redux;

        _classCallCheck(this, Store);

        for (var _len = arguments.length, middleware = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
            middleware[_key - 3] = arguments[_key];
        }

        this._store = Redux.createStore(reducer, this.load(mapStorageToState), (_Redux = Redux).applyMiddleware.apply(_Redux, middleware));
        this._queue = [];
        this.state = this._store.getState();

        this.dispatch = this.dispatch.bind(this);
        this.queue = this.queue.bind(this);
        this.mapStateToStorage = mapStateToStorage;

        this._store.subscribe(this.listener.bind(this));
    }

    _createClass(Store, [{
        key: 'dispatch',
        value: function dispatch(action) {
            this._store.dispatch(action);
        }
    }, {
        key: 'subscribe',
        value: function subscribe(fn) {
            this._store.subscribe(fn);
        }
    }, {
        key: 'queue',
        value: function queue(test, action) {
            if (test(this.state)) {
                action(this.state);
            } else {
                this._queue.push({ test: test, action: action });
            }
        }
    }, {
        key: 'listener',
        value: function listener() {
            this.state = this._store.getState();
            this.save(this.state);

            for (var i = 0; i < this._queue.length; i++) {
                var item = this._queue[i];

                if (item.test(this.state)) {
                    this._queue.splice(i, 1);
                    item.action(this.state);
                }
            }
        }
    }, {
        key: 'save',
        value: function save(state) {
            try {
                var serialisedState = JSON.stringify(this.mapStateToStorage(state));
                localStorage.setItem('state', serialisedState);
            } catch (err) {
                // Ignore write error
            }
        }
    }, {
        key: 'load',
        value: function load(mapStorageToState) {
            try {
                var serialisedState = localStorage.getItem('state');

                if (serialisedState === null) {
                    return undefined;
                }

                return mapStorageToState(JSON.parse(serialisedState));
            } catch (err) {
                return undefined;
            }
        }
    }]);

    return Store;
}();

module.exports = Store;