/**
 * Created by SUN on 2017-01-05.
 */
function typeOf(thing) {
    if (!thing) return 'void';

    if (Array.isArray(thing)) {
        if (!thing.length) return 'void';
        return 'array';
    }

    return typeof thing;
}
function getSubset(obj, paths) {
    let subset = {};

    paths.forEach(function (key) {
        let slice = obj[key];
        if (slice) subset[key] = slice;
    });
    return subset;
}

export default function (paths, config) {
    let cfg = {
        key: 'redux',
        merge: function (initialState, persistedState) {
            return persistedState ? {...initialState, ...persistedState} : initialState;
        },
        slicer: function (paths) {
            switch (typeOf(paths)) {
                case 'void':
                    return function (state) {
                        return state;
                    };
                case 'string':
                    return function (state) {
                        return getSubset(state, [paths]);
                    };
                case 'array':
                    return function (state) {
                        return getSubset(state, paths);
                    };
                default:
                    return console.error('Invalid paths argument, should be of type String, Array or Void');
            }
        },
        serialize: JSON.stringify,
        deserialize: JSON.parse,
        ...config
    };

    let key = cfg.key;
    let merge = cfg.merge;
    let slicer = cfg.slicer;
    let serialize = cfg.serialize;
    let deserialize = cfg.deserialize;

    return function (next) {
        return function (reducer, initialState) {
            let persistedState = undefined;
            let finalInitialState = undefined;
            try {
                let sessionState = deserialize(sessionStorage.getItem(key));
                let localState = deserialize(localStorage.getItem(key));
                persistedState = {...localState, ...sessionState};
                finalInitialState = merge(initialState, persistedState);
            } catch (e) {
                console.warn('Failed to retrieve initialize state from sessionStorage:', e);
            }

            let store = next(reducer, finalInitialState);
            let slicerFn = slicer(paths);

            store.subscribe(function () {
                let state = store.getState();
                let subset = slicerFn(state);
                try {
                    let sessionState = {};
                    let localState = {};
                    for (let k in subset) {
                        if (subset[k].store === "session") {
                            sessionState[k] = subset[k];
                        } else if (subset[k].store === "local") {
                            localState[k] = subset[k];
                        } else if (subset[k].store === false) {
                        } else if (subset[k].store === undefined) {
                            sessionState[k] = subset[k];
                        }
                        window.sessionStorage.setItem(key, serialize(sessionState));
                        window.localStorage.setItem(key, serialize(localState));
                    }
                } catch (e) {
                    console.warn('Unable to persist state to sessionStorage:', e);
                }
            });
            return store;
        };
    };
}