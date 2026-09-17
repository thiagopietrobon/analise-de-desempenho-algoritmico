/* =========================================================
   QUICKSORT LAB — ANIMAÇÃO
   Responsabilidade deste módulo:
   - controlar a reprodução dos passos;
   - pausar, avançar e reiniciar;
   - aplicar uma velocidade compartilhada entre as bancadas.
   ========================================================= */

/**
 * Cria um controlador independente para uma bancada.
 * O valor de velocidade vem do módulo central, portanto ambos os
 * controladores usam o mesmo slider.
 */
export function createAnimationController({
    getSpeed,
    onRender,
    onStateChange,
}) {
    const state = {
        events: [],
        index: 0,
        timer: null,
        running: false,
    };

    const clearTimer = () => {
        if (state.timer !== null) {
            window.clearTimeout(state.timer);
            state.timer = null;
        }
    };

    /*
     * O atraso é inversamente proporcional à velocidade.
     * 1× = 500 ms, 2× = 250 ms, 5× = 100 ms,
     * 10× = 50 ms e 20× = 25 ms.
     */
    const getDelay = () => {
        const speed = Math.max(1, Number(getSpeed()) || 5);
        return Math.max(25, 500 / speed);
    };

    const render = () => {
        const event = state.events[state.index];

        onRender(event, state);
        onStateChange(state);
    };

    const schedule = () => {
        clearTimer();

        if (!state.running) {
            return;
        }

        state.timer = window.setTimeout(() => {
            state.timer = null;

            if (state.index >= state.events.length - 1) {
                state.running = false;
                render();
                return;
            }

            state.index++;
            render();
            schedule();
        }, getDelay());
    };

    return {
        load(events) {
            clearTimer();
            state.events = events ?? [];
            state.index = 0;
            state.running = false;
            render();
        },

        play() {
            if (!state.events.length) {
                return;
            }

            if (state.index >= state.events.length - 1) {
                state.index = 0;
            }

            state.running = true;
            render();
            schedule();
        },

        pause() {
            state.running = false;
            clearTimer();
            render();
        },

        next() {
            if (!state.events.length) {
                return;
            }

            state.running = false;
            clearTimer();

            if (state.index < state.events.length - 1) {
                state.index++;
            }

            render();
        },

        reset() {
            if (!state.events.length) {
                return;
            }

            state.running = false;
            clearTimer();
            state.index = 0;
            render();
        },

        /**
         * Recalcula imediatamente o próximo atraso.
         * É chamado quando o usuário mexe no slider durante a execução.
         */
        updateSpeed() {
            if (state.running) {
                schedule();
            }
        },

        getState() {
            return state;
        },
    };
}
