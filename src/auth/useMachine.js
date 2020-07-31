import { readable } from 'svelte/store';
import { interpret } from 'xstate';

export const useMachine = (machine, options) => {
  const service = interpret(machine, options);

  // wrap machine in a svelte readable store with
  // initial state (defined in config) as its starting state
  const store = readable(service.initialState, set => {
    // every time we change state onTransition
    // hook is triggered
    service.onTransition(state => {
      set(state);
    });

    // start the machine service
    service.start();

    return () => {
      service.stop();
    };
  });

  // return a custom Svelte store
  return {
    state: store,
    send: service.send
  };
};
